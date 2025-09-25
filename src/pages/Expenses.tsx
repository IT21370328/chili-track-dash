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
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-white/80 rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg lg:rounded-xl flex items-center justify-center">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">Expenses Dashboard</h1>
        <button
          className="ml-auto mt-2 sm:mt-0 px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 text-xs sm:text-sm transition-colors"
          onClick={handleExport}
        >
          <Download className="w-3 h-3 sm:w-4 sm:h-4" /> Export
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-lg lg:rounded-2xl p-3 sm:p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg lg:rounded-xl flex items-center justify-center">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xs sm:text-sm lg:text-base font-medium text-slate-600">Total Expenses</h2>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
            Rs.{totalExpenses.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold">Add Expense</h3>
        </div>
        <div className="p-3 sm:p-4 lg:p-6">
          <div
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
          >
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                max={today}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              <label className="block text-xs sm:text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Cost (Rs)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white py-2.5 px-4 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-colors text-sm sm:text-base font-medium"
              >
                Record Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table with Date Filters */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold">Expenses</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full sm:w-32 lg:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full sm:w-32 lg:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="To"
            />
            {(filters.dateFrom || filters.dateTo) && (
              <button
                onClick={resetFilters}
                className="mt-2 sm:mt-0 px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-xs transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (Rs)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    Rs.{exp.cost.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(exp)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No expenses found for selected dates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="sm:hidden p-3">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No expenses found for selected dates.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((exp) => (
                <div key={exp.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{exp.category}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(exp.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-gray-900">Rs.{exp.cost.toLocaleString()}</div>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => handleEditClick(exp)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{exp.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold">Edit Expense</h3>
            </div>
            {editingExpense && (
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={editingExpense.date}
                    max={today}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                  <label className="block text-xs sm:text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={editingExpense.description}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Cost (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingExpense.cost}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        cost: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            )}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default Expenses;
