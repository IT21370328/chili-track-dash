import { useState, useEffect, useMemo } from "react";
import { Users, DollarSign, Clock, Check, Plus, Pencil, Trash2, X, Save, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logAction } from "@/pages/logHelper"; // Added logger import

interface Employee {
  id: number;
  name: string;
  salary: number;
  status: "paid" | "unpaid";
  startDate?: string;
  endDate?: string;
  lastPaid?: string;
}

const API_URL = "https://chili-track-dash.onrender.com";

const Salaries = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({ name: "", salary: "", startDate: "", endDate: "" });
  const [editModal, setEditModal] = useState<Employee | null>(null);
  const [editData, setEditData] = useState({ name: "", salary: "", startDate: "", endDate: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null);
  const [filterRange, setFilterRange] = useState({ start: "", end: "" });
  const { toast } = useToast();
  const currentUser = localStorage.getItem("username") || "Unknown"; // Added for logging
  const today = new Date().toISOString().split("T")[0]; // Added to restrict future dates

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/employees`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch employees: ${res.statusText}`);
      }
      const data = await res.json();
      setEmployees(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Add employee
  const handleAdd = async () => {
    if (!formData.name || !formData.salary || !formData.startDate || !formData.endDate) {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    if (formData.startDate > formData.endDate) {
      toast({ title: "Error", description: "End date cannot be before start date.", variant: "destructive" });
      return;
    }
    const salaryNum = Number(formData.salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      toast({ title: "Error", description: "Salary must be a positive number.", variant: "destructive" });
      return;
    }
    try {
      const employeeData = {
        name: formData.name,
        salary: salaryNum,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      const res = await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add employee: ${res.statusText}`);
      }
      await fetchEmployees();
      try {
        await logAction(
          currentUser,
          "Add Employee",
          `Added employee ${formData.name} with salary Rs${salaryNum}`
        );
      } catch (error) {
        console.error("Failed to log add employee action:", error);
      }
      toast({ title: "Added", description: `Employee ${formData.name} added.` });
      setFormData({ name: "", salary: "", startDate: "", endDate: "" });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to add employee: ${error.message}`, variant: "destructive" });
    }
  };

  // Export employees as CSV
  const exportEmployees = async () => {
    if (filteredEmployees.length === 0) {
      toast({ title: "No data", description: "No employees to export.", variant: "destructive" });
      return;
    }

    const csvContent = [
      ["ID", "Name", "Salary", "Start Date", "End Date", "Status", "Last Paid"],
      ...filteredEmployees.map(e => [
        e.id,
        e.name,
        e.salary,
        e.startDate || "-",
        e.endDate || "-",
        e.status,
        e.lastPaid || "-",
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    try {
      await logAction(
        currentUser,
        "Export Employees",
        `Exported ${filteredEmployees.length} employee records`
      );
      toast({ title: "Success", description: "Employees exported successfully." });
    } catch (error) {
      console.error("Failed to log export employees action:", error);
      toast({
        title: "Warning",
        description: "Employees exported, but failed to log action.",
        variant: "default",
      });
    }
  };

  // Open edit modal
  const openEditModal = (emp: Employee) => {
    setEditModal(emp);
    setEditData({
      name: emp.name,
      salary: emp.salary.toString(),
      startDate: emp.startDate || "",
      endDate: emp.endDate || "",
    });
  };

  // Save edit from modal
  const saveEditModal = async () => {
    if (!editData.name || !editData.salary || !editData.startDate || !editData.endDate) {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    if (editData.startDate > editData.endDate) {
      toast({ title: "Error", description: "End date cannot be before start date.", variant: "destructive" });
      return;
    }
    const salaryNum = Number(editData.salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      toast({ title: "Error", description: "Salary must be a positive number.", variant: "destructive" });
      return;
    }
    try {
      const employeeData = {
        name: editData.name,
        salary: salaryNum,
        startDate: editData.startDate,
        endDate: editData.endDate,
      };
      const res = await fetch(`${API_URL}/employees/${editModal?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update employee: ${res.statusText}`);
      }
      await fetchEmployees();
      try {
        await logAction(
          currentUser,
          "Update Employee",
          `Updated employee ${editData.name} (ID: ${editModal?.id}, Salary: Rs${salaryNum})`
        );
      } catch (error) {
        console.error("Failed to log update employee action:", error);
      }
      toast({ title: "Updated", description: "Employee updated successfully." });
      setEditModal(null);
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to update employee: ${error.message}`, variant: "destructive" });
    }
  };

  // Cancel edit modal
  const cancelEditModal = () => setEditModal(null);

  // Delete employee
  const deleteEmployee = async (emp: Employee) => {
    try {
      const res = await fetch(`${API_URL}/employees/${emp.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete employee: ${res.statusText}`);
      }
      await fetchEmployees();
      try {
        await logAction(
          currentUser,
          "Delete Employee",
          `Deleted employee ${emp.name} (ID: ${emp.id})`
        );
      } catch (error) {
        console.error("Failed to log delete employee action:", error);
      }
      toast({ title: "Deleted", description: `Employee ${emp.name} deleted.` });
      setDeleteConfirm(null);
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to delete employee: ${error.message}`, variant: "destructive" });
    }
  };

  // Mark paid
  const markPaid = async (emp: Employee) => {
    try {
      const res = await fetch(`${API_URL}/employees/${emp.id}/pay`, { method: "PUT" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to mark as paid: ${res.statusText}`);
      }
      await fetchEmployees();
      try {
        await logAction(
          currentUser,
          "Mark Employee Paid",
          `Marked employee ${emp.name} (ID: ${emp.id}) as paid`
        );
      } catch (error) {
        console.error("Failed to log mark paid action:", error);
      }
      toast({ title: "Paid", description: `${emp.name} marked as paid.` });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to mark as paid: ${error.message}`, variant: "destructive" });
    }
  };

  // Calculations
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
  const paidSalary = employees.filter(e => e.status === "paid").reduce((sum, e) => sum + e.salary, 0);
  const unpaidSalary = totalSalary - paidSalary;

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (!filterRange.start && !filterRange.end) return true;
      if (filterRange.start && emp.startDate && emp.startDate < filterRange.start) return false;
      if (filterRange.end && emp.endDate && emp.endDate > filterRange.end) return false;
      return true;
    });
  }, [employees, filterRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Employee Salary</h1>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto mt-2 sm:mt-0 gap-2 border border-black/10 text-black"
            onClick={exportEmployees}
          >
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 grid-rows-2">
          {[
            { label: "Total Salary", value: totalSalary, icon: DollarSign, description: "Total salary obligation" },
            { label: "Paid Salary", value: paidSalary, icon: Check, description: "Total amount paid" },
            { label: "Unpaid Salary", value: unpaidSalary, icon: Clock, description: "Pending salary payments" },
            { label: "Placeholder", value: "N/A", icon: Users, description: "Reserved for future metrics" },
          ].map((card, i) => (
            <Card
              key={i}
              className="p-6 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-lg flex items-center gap-4 min-w-[220px]"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value === "N/A" ? card.value : `Rs.${card.value.toLocaleString()}`}</p>
                <p className="text-xs text-slate-500 mt-1">{card.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Employee Form */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Employee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Salary</Label>
              <Input
                type="number"
                value={formData.salary}
                onChange={e => setFormData({ ...formData, salary: e.target.value })}
                min={0}
                step="0.01"
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                max={today}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                max={today}
              />
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-11 font-medium flex items-center justify-center gap-2"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </Card>

        {/* Filter */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200/50 shadow-lg flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <Label>Filter Start Date</Label>
            <Input
              type="date"
              value={filterRange.start}
              onChange={e => setFilterRange({ ...filterRange, start: e.target.value })}
              max={today}
            />
          </div>
          <div>
            <Label>Filter End Date</Label>
            <Input
              type="date"
              value={filterRange.end}
              onChange={e => setFilterRange({ ...filterRange, end: e.target.value })}
              max={today}
            />
          </div>
          <Button variant="outline" onClick={() => setFilterRange({ start: "", end: "" })} className="mt-2 sm:mt-0">
            Clear Filter
          </Button>
        </Card>

        {/* Employee Table */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-x-auto border border-slate-200/50 shadow-lg">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Paid</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>Rs.{emp.salary.toLocaleString()}</TableCell>
                  <TableCell>{emp.startDate && emp.endDate ? `${emp.startDate} to ${emp.endDate}` : "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        emp.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {emp.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{emp.lastPaid || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {emp.status === "unpaid" && (
                        <Button size="sm" onClick={() => markPaid(emp)}>
                          Mark Paid
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openEditModal(emp)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(emp)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 rounded-2xl max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div>
                  <Label>Salary</Label>
                  <Input
                    type="number"
                    value={editData.salary}
                    onChange={e => setEditData({ ...editData, salary: e.target.value })}
                    min={0}
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editData.startDate}
                    onChange={e => setEditData({ ...editData, startDate: e.target.value })}
                    max={today}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editData.endDate}
                    onChange={e => setEditData({ ...editData, endDate: e.target.value })}
                    max={today}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={cancelEditModal}>
                  Cancel
                </Button>
                <Button onClick={saveEditModal}>
                  Save
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 rounded-2xl max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">Delete Employee</h3>
              <p className="mb-4">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => deleteEmployee(deleteConfirm)}>
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salaries;