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

interface Employee {
  id: number;
  name: string;
  salary: number;
  status: "paid" | "unpaid";
  startDate?: string;
  endDate?: string;
  lastPaid?: string;
}

const API_URL = "http://localhost:5000";

const Salaries = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({ name: "", salary: "", startDate: "", endDate: "" });
  const [editModal, setEditModal] = useState<Employee | null>(null);
  const [editData, setEditData] = useState({ name: "", salary: "", startDate: "", endDate: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null);
  const [filterRange, setFilterRange] = useState({ start: "", end: "" });
  const { toast } = useToast();

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/employees`);
      const data = await res.json();
      setEmployees(data);
    } catch {
      toast({ title: "Error", description: "Failed to fetch employees.", variant: "destructive" });
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
    try {
      await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          salary: Number(formData.salary),
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      });
      toast({ title: "Added", description: `Employee ${formData.name} added.` });
      setFormData({ name: "", salary: "", startDate: "", endDate: "" });
      fetchEmployees();
    } catch {
      toast({ title: "Error", description: "Failed to add employee.", variant: "destructive" });
    }
  };

  // Export employees as CSV
const exportEmployees = () => {
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
      e.lastPaid || "-"
    ])
  ]
    .map(row => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
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
    try {
      await fetch(`${API_URL}/employees/${editModal?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          salary: Number(editData.salary),
          startDate: editData.startDate,
          endDate: editData.endDate,
        }),
      });
      toast({ title: "Updated", description: "Employee updated successfully." });
      setEditModal(null);
      fetchEmployees();
    } catch {
      toast({ title: "Error", description: "Failed to update employee.", variant: "destructive" });
    }
  };

  const cancelEditModal = () => setEditModal(null);

  // Delete employee
  const deleteEmployee = async (emp: Employee) => {
    try {
      await fetch(`${API_URL}/employees/${emp.id}`, { method: "DELETE" });
      toast({ title: "Deleted", description: `Employee ${emp.name} deleted.` });
      setDeleteConfirm(null);
      fetchEmployees();
    } catch {
      toast({ title: "Error", description: "Failed to delete employee.", variant: "destructive" });
    }
  };

  // Mark paid
  const markPaid = async (emp: Employee) => {
    try {
      await fetch(`${API_URL}/employees/${emp.id}/pay`, { method: "PUT" });
      toast({ title: "Paid", description: `${emp.name} marked as paid.` });
      fetchEmployees();
    } catch {
      toast({ title: "Error", description: "Failed to mark as paid.", variant: "destructive" });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Prima Transactions</h1>
        <Button
  variant="outline"
  size="sm"
  className="ml-auto gap-2 border border-black/10 text-black"
  onClick={exportEmployees}
>
  <Download className="w-4 h-4" /> Export
</Button>

      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Salary", value: totalSalary, icon: DollarSign },
            { label: "Paid Salary", value: paidSalary, icon: Check },
            { label: "Unpaid Salary", value: unpaidSalary, icon: Clock },
          ].map((card, i) => (
            <Card key={i} className="p-6 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">Rs.{card.value.toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Employee Form */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Employee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div><Label>Name</Label><Input value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})}/></div>
            <div><Label>Salary</Label><Input type="number" value={formData.salary} onChange={e=>setFormData({...formData,salary:e.target.value})}/></div>
            <div><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={e=>setFormData({...formData,startDate:e.target.value})}/></div>
            <div><Label>End Date</Label><Input type="date" value={formData.endDate} onChange={e=>setFormData({...formData,endDate:e.target.value})}/></div>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-11 font-medium" onClick={handleAdd}><Plus className="w-4 h-4 mr-2"/>Add Employee</Button>
        </Card>

        {/* Filter */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg flex flex-col md:flex-row gap-4 items-end">
          <div><Label>Filter Start Date</Label><Input type="date" value={filterRange.start} onChange={e=>setFilterRange({...filterRange,start:e.target.value})}/></div>
          <div><Label>Filter End Date</Label><Input type="date" value={filterRange.end} onChange={e=>setFilterRange({...filterRange,end:e.target.value})}/></div>
          <Button variant="outline" onClick={()=>setFilterRange({start:"",end:""})}>Clear Filter</Button>
        </Card>

        {/* Employee Table */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200/50 shadow-lg">
          <Table>
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
                  <TableCell>{emp.startDate && emp.endDate ? `${emp.startDate} to ${emp.endDate}` : '-'}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-xs font-semibold ${emp.status==='paid' ? 'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{emp.status.toUpperCase()}</span></TableCell>
                  <TableCell>{emp.lastPaid||'-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {emp.status==='unpaid' && <Button size="sm" onClick={()=>markPaid(emp)}>Mark Paid</Button>}
                      <Button size="sm" variant="outline" onClick={()=>openEditModal(emp)}><Pencil className="w-3 h-3"/></Button>
                      <Button size="sm" variant="destructive" onClick={()=>setDeleteConfirm(emp)}><Trash2 className="w-3 h-3"/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 rounded-2xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div><Label>Name</Label><Input value={editData.name} onChange={e=>setEditData({...editData,name:e.target.value})}/></div>
              <div><Label>Salary</Label><Input type="number" value={editData.salary} onChange={e=>setEditData({...editData,salary:e.target.value})}/></div>
              <div><Label>Start Date</Label><Input type="date" value={editData.startDate} onChange={e=>setEditData({...editData,startDate:e.target.value})}/></div>
              <div><Label>End Date</Label><Input type="date" value={editData.endDate} onChange={e=>setEditData({...editData,endDate:e.target.value})}/></div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelEditModal}>Cancel</Button>
              <Button onClick={saveEditModal}>Save</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 rounded-2xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Employee</h3>
            <p className="mb-4">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={()=>setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={()=>deleteEmployee(deleteConfirm)}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Salaries;
