import { useState, useEffect, useMemo } from "react";
import { Plus, DollarSign, Download, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  cost: number;
}

const API_URL = "https://chili-track-dash.onrender.com";

const Expenses = () => {
  const [formData, setFormData] = useState({ date: "", category: "", description: "", cost: "" });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const handleExport = () => {
    if (filteredExpenses.length === 0) {
      toast({ title: "No data", description: "No expenses to export.", variant: "destructive" });
      return;
    }

    const headers = ["Date", "Category", "Description", "Cost"];
    const rows = filteredExpenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.category,
      exp.description,
      exp.cost.toFixed(2),
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `expenses_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "✅ Exported", description: "Filtered expenses exported successfully." });
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/expenses`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch expenses", variant: "destructive" });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom + "T00:00:00") : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo + "T23:59:59") : null;
      return (!fromDate || expDate >= fromDate) && (!toDate || expDate <= toDate);
    });
  }, [expenses, filters]);

  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, exp) => sum + exp.cost, 0), [filteredExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.category || !formData.description || !formData.cost) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, cost: parseFloat(formData.cost) })
      });
      toast({ title: "✅ Expense Added", description: `${formData.description} recorded` });
      setFormData({ date: "", category: "", description: "", cost: "" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to save expense", variant: "destructive" });
    }
  };

  const handleEditClick = (exp: Expense) => {
    setEditingExpense(exp);
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingExpense) return;
    try {
      await fetch(`${API_URL}/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingExpense, cost: parseFloat(editingExpense.cost.toString()) })
      });
      toast({ title: "✏️ Expense Updated", description: `${editingExpense.description} updated successfully` });
      setIsDialogOpen(false);
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to update expense", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await fetch(`${API_URL}/expenses/${id}`, { method: "DELETE" });
      toast({ title: "🗑️ Deleted", description: "Expense removed successfully" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    }
  };

  const resetFilters = () => setFilters({ dateFrom: "", dateTo: "" });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
  {/* Header */}
  <div className="bg-white/80 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Expenses Dashboard</h1>
    <Button
      variant="outline"
      size="sm"
      className="ml-auto mt-2 sm:mt-0 gap-2"
      onClick={handleExport}
    >
      <Download className="w-4 h-4" /> Export
    </Button>
  </div>

  {/* Summary Card */}
  <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
      <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
    </div>
    <div>
      <h2 className="text-sm sm:text-base font-medium text-slate-600">Total Expenses</h2>
      <p className="text-xl sm:text-2xl font-bold text-slate-900">
        Rs.{totalExpenses.toLocaleString()}
      </p>
    </div>
  </Card>

  {/* Add Form */}
  <Card>
    <CardHeader>
      <CardTitle>Add Expense</CardTitle>
    </CardHeader>
    <CardContent>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      >
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Category</Label>
          <select
            className="w-full border rounded-lg p-2"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          >
            <option value="">Select category</option>
            <option value="Transport">Transport</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label>Cost (Rs)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) =>
              setFormData({ ...formData, cost: e.target.value })
            }
            required
          />
        </div>
        <div className="md:col-span-2">
          <Button
            type="submit"
            className="w-full bg-gradient-to-br from-blue-500 to-blue-700"
          >
            Record Expense
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>

  {/* Table with Date Filters */}
  <Card>
    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <CardTitle>Expenses</CardTitle>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="w-full sm:w-40"
          placeholder="From"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="w-full sm:w-40"
          placeholder="To"
        />
        {(filters.dateFrom || filters.dateTo) && (
          <Button
            size="sm"
            variant="outline"
            onClick={resetFilters}
            className="mt-2 sm:mt-0"
          >
            Reset
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Cost (Rs)</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExpenses.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
              <TableCell>{exp.category}</TableCell>
              <TableCell>{exp.description}</TableCell>
              <TableCell className="text-right">
                Rs.{exp.cost.toLocaleString()}
              </TableCell>
              <TableCell className="flex justify-center gap-2 sm:gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(exp)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(exp.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredExpenses.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-slate-500"
              >
                No expenses found for selected dates.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  {/* Edit Dialog */}
  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="max-w-lg w-full">
      <DialogHeader>
        <DialogTitle>Edit Expense</DialogTitle>
      </DialogHeader>
      {editingExpense && (
        <div className="grid gap-4">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={editingExpense.date}
              max={today}
              onChange={(e) =>
                setEditingExpense({ ...editingExpense, date: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="w-full border rounded-lg p-2"
              value={editingExpense.category}
              onChange={(e) =>
                setEditingExpense({
                  ...editingExpense,
                  category: e.target.value,
                })
              }
            >
              <option value="Transport">Transport</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={editingExpense.description}
              onChange={(e) =>
                setEditingExpense({
                  ...editingExpense,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>Cost (Rs)</Label>
            <Input
              type="number"
              step="0.01"
              value={editingExpense.cost}
              onChange={(e) =>
                setEditingExpense({
                  ...editingExpense,
                  cost: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      )}
      <DialogFooter>
        <Button onClick={handleUpdate} className="w-full sm:w-auto">
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>

  );
};

export default Expenses;
