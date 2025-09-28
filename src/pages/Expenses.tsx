// src/pages/Expenses.tsx
import { useState, useEffect, useMemo } from "react";
import { DollarSign, Download, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { logAction } from "../utils/loghelper";

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
  const currentUser = localStorage.getItem("username") || "Unknown";

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
      logAction(currentUser, "Add Expense", `Added expense: ${formData.description}`);
      toast({ title: "✅ Expense Added", description: `${formData.description} recorded` });
      setFormData({ date: "", category: "", description: "", cost: "" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to save expense", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editingExpense) return;
    try {
      await fetch(`${API_URL}/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingExpense, cost: parseFloat(editingExpense.cost.toString()) })
      });
      logAction(currentUser, "Update Expense", `Updated expense: ${editingExpense.description}`);
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
      logAction(currentUser, "Delete Expense", `Deleted expense ID: ${id}`);
      toast({ title: "🗑️ Deleted", description: "Expense removed successfully" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* ... keep your same UI code ... */}
    </div>
  );
};

export default Expenses;
