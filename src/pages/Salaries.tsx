import { useState, useEffect } from "react";
import { Users, Plus, Pencil, Trash2, Download } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { logAction } from "@/pages/logHelper";

interface Employee {
  id: number;
  name: string;
  salary: number;
  status: "paid" | "unpaid";
  startDate?: string;
  endDate?: string;
  lastPaid?: string;
  email: string;
  phone: string;
  position: string;
}

interface FormData {
  name: string;
  salary: string;
  startDate: string;
  endDate: string;
  email: string;
  phone: string;
  position: string;
}

const API_URL = "https://chili-track-dash.onrender.com";

const EmployeeProfiles = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    salary: "",
    startDate: "",
    endDate: "",
    email: "",
    phone: "",
    position: "",
  });
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const currentUser = localStorage.getItem("username") || "Unknown";
  const today = new Date().toISOString().split("T")[0];

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

  // Handle form submission (add/edit)
  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.salary ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.email ||
      !formData.phone ||
      !formData.position
    ) {
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
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
      };
      const url = editEmployee ? `${API_URL}/employees/${editEmployee.id}` : `${API_URL}/employees`;
      const method = editEmployee ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${editEmployee ? "update" : "add"} employee: ${res.statusText}`);
      }
      await fetchEmployees();
      try {
        await logAction(
          currentUser,
          editEmployee ? "Update Employee" : "Add Employee",
          `${editEmployee ? "Updated" : "Added"} employee ${formData.name} (ID: ${editEmployee?.id || "new"})`
        );
      } catch (error) {
        console.error(`Failed to log ${editEmployee ? "update" : "add"} employee action:`, error);
      }
      toast({
        title: editEmployee ? "Updated" : "Added",
        description: `Employee ${formData.name} ${editEmployee ? "updated" : "added"} successfully.`,
      });
      setFormData({ name: "", salary: "", startDate: "", endDate: "", email: "", phone: "", position: "" });
      setEditEmployee(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Open add/edit modal
  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditEmployee(employee);
      setFormData({
        name: employee.name,
        salary: employee.salary.toString(),
        startDate: employee.startDate || "",
        endDate: employee.endDate || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
      });
    } else {
      setEditEmployee(null);
      setFormData({ name: "", salary: "", startDate: "", endDate: "", email: "", phone: "", position: "" });
    }
    setIsDialogOpen(true);
  };

  // Reset salary status
  const resetSalaryStatus = async (employee: Employee) => {
    try {
      const res = await fetch(`${API_URL}/employees/${employee.id}/reset`, { method: "PUT" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to reset salary status: ${res.statusText}`);
      }
      await fetchEmployees();
      try {
        await logAction(
          currentUser,
          "Reset Employee Salary Status",
          `Reset salary status for employee ${employee.name} (ID: ${employee.id})`
        );
      } catch (error) {
        console.error("Failed to log reset salary status action:", error);
      }
      toast({ title: "Reset", description: `Salary status for ${employee.name} reset to unpaid.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Delete employee
  const deleteEmployee = async (employee: Employee) => {
    try {
      const res = await fetch(`${API_URL}/employees/${employee.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete employee: ${res.statusText}`);
      }
      await fetchEmployees();
      try {
        await logAction(
          currentUser,
          "Delete Employee",
          `Deleted employee ${employee.name} (ID: ${employee.id})`
        );
      } catch (error) {
        console.error("Failed to log delete employee action:", error);
      }
      toast({ title: "Deleted", description: `Employee ${employee.name} deleted.` });
      setDeleteConfirm(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Export employees as CSV
  const exportEmployees = async () => {
    if (employees.length === 0) {
      toast({ title: "No data", description: "No employees to export.", variant: "destructive" });
      return;
    }
    const csvContent = [
      ["ID", "Name", "Salary", "Start Date", "End Date", "Email", "Phone", "Position", "Status", "Last Paid"],
      ...employees.map((e) => [
        e.id,
        e.name,
        e.salary,
        e.startDate || "-",
        e.endDate || "-",
        e.email || "-",
        e.phone || "-",
        e.position || "-",
        e.status,
        e.lastPaid || "-",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employee_profiles_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    try {
      await logAction(currentUser, "Export Employee Profiles", `Exported ${employees.length} employee records`);
      toast({ title: "Success", description: "Employee profiles exported successfully." });
    } catch (error) {
      console.error("Failed to log export employees action:", error);
      toast({
        title: "Warning",
        description: "Employees exported, but failed to log action.",
        variant: "default",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Employee Profiles</h1>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto mt-2 sm:mt-0 gap-2 border border-black/10 text-black"
            onClick={exportEmployees}
          >
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>

        {/* Employee Table */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-x-auto border border-slate-200/50 shadow-lg">
          <div className="p-4 sm:p-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Employee Profiles</h3>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-11 font-medium flex items-center gap-2"
              onClick={() => openModal()}
            >
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          </div>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email || "-"}</TableCell>
                  <TableCell>{emp.phone || "-"}</TableCell>
                  <TableCell>{emp.position || "-"}</TableCell>
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
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {emp.status === "paid" && (
                        <Button size="sm" onClick={() => resetSalaryStatus(emp)}>
                          Reset Status
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openModal(emp)}>
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

        {/* Add/Edit Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editEmployee ? "Edit Employee Profile" : "Add Employee Profile"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Salary</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  min={0}
                  step="0.01"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    max={today}
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    max={today}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Employee</DialogTitle>
              </DialogHeader>
              <p className="mb-4">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => deleteEmployee(deleteConfirm)}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfiles;