import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  DollarSign,
  Download,
  TrendingUp,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/pages/logHelper";

interface Employee {
  id: number;
  name: string;
  salary: number;
  startDate: string;
  endDate: string;
  status: "paid" | "unpaid";
  lastPaid?: string;
}

const API_URL = "https://chili-track-dash.onrender.com";

const Salaries = () => {
  const [formData, setFormData] = useState({
    name: "",
    salary: "",
    startDate: "",
    endDate: "",
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const currentUser = localStorage.getItem("username") || "Unknown";

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/employees`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch employees.", variant: "destructive" });
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const empDate = new Date(emp.startDate);
      const fromMatch = !dateFrom || empDate >= new Date(dateFrom + "T00:00:00");
      const toMatch = !dateTo || empDate <= new Date(dateTo + "T23:59:59");
      return fromMatch && toMatch;
    });
  }, [employees, dateFrom, dateTo]);

  const exportToCSV = async () => {
    if (filteredEmployees.length === 0) {
      toast({ title: "No Data", description: "No employees to export.", variant: "destructive" });
      return;
    }

    const headers = ["Name", "Salary", "Start Date", "End Date", "Status", "Last Paid"];
    const rows = filteredEmployees.map((e) => [
      e.name,
      e.salary.toFixed(2),
      e.startDate,
      e.endDate,
      e.status,
      e.lastPaid || "-",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `employees_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    URL.revokeObjectURL(link.href);

    try {
      await logAction(currentUser, "Export Employees", `Exported ${filteredEmployees.length} employee records`);
      toast({ title: "✅ Exported", description: "Employees exported successfully." });
    } catch (error) {
      console.error("Failed to log export action:", error);
    }
  };

  const summary = useMemo(() => {
    let paid = 0,
      unpaid = 0;
    filteredEmployees.forEach((e) => {
      if (e.status === "paid") paid += e.salary;
      else unpaid += e.salary;
    });
    return { paid, unpaid, total: paid + unpaid, totalRecords: filteredEmployees.length };
  }, [filteredEmployees]);

  const resetDateFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, salary, startDate, endDate } = formData;

    if (!name || !salary) {
      toast({ title: "Error", description: "Name and salary are required.", variant: "destructive" });
      return;
    }

    try {
      let savedEmployee: Employee;
      if (editingId) {
        const res = await fetch(`${API_URL}/employees/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            salary: parseFloat(salary),
            startDate,
            endDate,
          }),
        });
        if (!res.ok) throw new Error("Failed to update");
        savedEmployee = await res.json();
        setEmployees((prev) => prev.map((e) => (e.id === editingId ? savedEmployee : e)));
        await logAction(currentUser, "Update Employee", `Updated employee ${name} with ID: ${editingId}`);
        toast({ title: "✅ Employee Updated", description: `Updated ${name}` });
        setEditingId(null);
      } else {
        const res = await fetch(`${API_URL}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            salary: parseFloat(salary),
            startDate,
            endDate,
          }),
        });
        if (!res.ok) throw new Error("Failed to save");
        savedEmployee = await res.json();
        if (!savedEmployee.id) savedEmployee.id = Date.now();
        setEmployees((prev) => [savedEmployee, ...prev]);
        await logAction(currentUser, "Add Employee", `Added employee ${name}`);
        toast({ title: "✅ Employee Added", description: `Added ${name}` });
      }

      setFormData({ name: "", salary: "", startDate: "", endDate: "" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save employee.", variant: "destructive" });
      console.error(err);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      salary: employee.salary.toString(),
      startDate: employee.startDate,
      endDate: employee.endDate,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`${API_URL}/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      await logAction(currentUser, "Delete Employee", `Deleted employee ID: ${id}`);
      toast({ title: "✅ Employee Deleted" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete employee.", variant: "destructive" });
      console.error(err);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/employees/${id}/pay`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to update payment");
      const updatedEmployee = await res.json();
      setEmployees((prev) => prev.map((e) => (e.id === id ? updatedEmployee : e)));
      await logAction(currentUser, "Mark Salary Paid", `Marked salary paid for employee ID: ${id}`);
      toast({ title: "✅ Salary Paid", description: "Marked as paid." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to mark as paid.", variant: "destructive" });
      console.error(err);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Salaries Dashboard</h1>
        <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={exportToCSV}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white/90 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-slate-600">Paid Salaries</h3>
            <p className="text-xl font-bold text-green-600">Rs.{summary.paid.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-slate-600">Unpaid Salaries</h3>
            <p className="text-xl font-bold text-red-600">Rs.{summary.unpaid.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-slate-600">Total Employees</h3>
            <p className="text-xl font-bold text-slate-900">{summary.totalRecords}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Employee Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Employee" : "Add Employee"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
              min="0"
            />
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              max={today}
            />
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <Button type="submit" className="col-span-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" /> {editingId ? "Update Employee" : "Add Employee"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table & Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <CardTitle>Employees</CardTitle>
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
              {(dateFrom || dateTo) && (
                <Button variant="outline" size="sm" onClick={resetDateFilter}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Paid</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>Rs.{emp.salary.toFixed(2)}</TableCell>
                  <TableCell>{emp.startDate}</TableCell>
                  <TableCell>{emp.endDate || "-"}</TableCell>
                  <TableCell className="capitalize">{emp.status}</TableCell>
                  <TableCell>{emp.lastPaid || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(emp)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(emp.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {emp.status === "unpaid" && (
                        <Button variant="secondary" size="sm" onClick={() => handleMarkAsPaid(emp.id)}>
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Salaries;