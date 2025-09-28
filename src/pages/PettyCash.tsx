// src/pages/PettyCash.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Wallet,
  TrendingUp,
  Pencil,
  Trash2,
  X,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { logAction } from "@/pages/logHelper"; // ✅ import the logger

interface Transaction {
  id: number;
  date: string;
  amount: number;
  description: string;
  type: "inflow" | "outflow";
  balance: number;
}

interface Summary {
  totalInflow: number;
  totalOutflow: number;
  balance: number;
}

const API_URL = "https://chili-track-dash.onrender.com";

const PettyCash = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "inflow" as "inflow" | "outflow"
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalInflow: 0,
    totalOutflow: 0,
    balance: 0
  });
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    transaction?: Transaction;
  }>({ open: false });

  const { toast } = useToast();
  const currentUser = localStorage.getItem("username") || "Unknown";

  const handleExport = () => {
    if (transactions.length === 0) {
      toast({
        title: "No data",
        description: "No transactions to export.",
        variant: "destructive"
      });
      return;
    }
    const headers = ["Date", "Description", "Type", "Amount", "Balance"];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.type,
      t.amount.toFixed(2),
      t.balance.toFixed(2)
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `pettycash_transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "✅ Exported",
      description: "Transactions exported successfully."
    });
  };

  const fetchData = async () => {
    try {
      const resTransactions = await fetch(`${API_URL}/pettycash`);
      const dataTransactions = await resTransactions.json();
      setTransactions(dataTransactions);

      const resSummary = await fetch(`${API_URL}/pettycash/summary`);
      const dataSummary = await resSummary.json();
      setSummary(dataSummary);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch data from server.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const fromDate = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
      const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;

      const searchMatch =
        !search ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.amount.toString().includes(search);

      const dateFromMatch = !fromDate || transactionDate >= fromDate;
      const dateToMatch = !toDate || transactionDate <= toDate;

      return searchMatch && dateFromMatch && dateToMatch;
    });
  }, [transactions, search, dateFrom, dateTo]);

  const resetDateFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive"
      });
      return;
    }
    try {
      await fetch(`${API_URL}/pettycash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description,
          type: formData.type
        })
      });
      logAction(
        currentUser,
        "Add Transaction",
        `Added ${formData.type} of Rs.${formData.amount} (${formData.description})`
      );
      toast({
        title: "Transaction Recorded",
        description: `${formData.type === "inflow" ? "Added" : "Removed"} Rs.${parseFloat(formData.amount).toFixed(2)}`
      });
      setFormData({ amount: "", description: "", type: "inflow" });
      fetchData();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add transaction.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  const handleEdit = (transaction: Transaction) =>
    setEditDialog({ open: true, transaction });

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await fetch(`${API_URL}/pettycash/${id}`, { method: "DELETE" });
      logAction(currentUser, "Delete Transaction", `Deleted transaction ID: ${id}`);
      toast({ title: "Deleted", description: "Transaction has been deleted." });
      fetchData();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete transaction.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.transaction) return;
    const { id } = editDialog.transaction;
    try {
      await fetch(`${API_URL}/pettycash/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDialog.transaction)
      });
      logAction(
        currentUser,
        "Update Transaction",
        `Updated transaction: ${editDialog.transaction.description}`
      );
      toast({
        title: "Updated",
        description: "Transaction updated successfully."
      });
      setEditDialog({ open: false });
      fetchData();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update transaction.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200/50 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-800 truncate">
                Petty Cash Dashboard
              </h1>
              <p className="text-slate-600 text-sm truncate">
                Manage cash inflow & outflow
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" /> Export
          </Button>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Total Inflow</h3>
            <p className="text-2xl font-bold text-slate-900 truncate">Rs.{summary.totalInflow.toLocaleString()}</p>
          </Card>

                <Card className="p-4 sm:p-6 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-slate-600 mb-1">Current Balance</h3>
        <p className="text-2xl font-bold text-slate-900 truncate">Rs.{summary.balance.toLocaleString()}</p>
      </Card>

      <Card className="p-4 sm:p-6 bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-slate-600 mb-1">Total Transactions</h3>
        <p className="text-2xl font-bold text-slate-900 truncate">{transactions.length}</p>
      </Card>
    </div>

    {/* New Transaction Form */}
    <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200/50 shadow-lg">
      <div className="flex items-center gap-3 mb-4 sm:mb-6 flex-wrap sm:flex-nowrap">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 truncate">New Transaction</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <Label htmlFor="amount">Amount (Rs)</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as "inflow" | "outflow" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inflow">Inflow</SelectItem>
              <SelectItem value="outflow">Outflow</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg h-11 font-medium flex items-center justify-center">
          <Plus className="w-4 h-4 mr-2" /> Record Transaction
        </Button>
      </form>
    </Card>

    {/* Transaction History Table */}
    <Card className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex gap-2 flex-wrap">
          <Input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            placeholder="From"
            className="w-36 sm:w-40"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            placeholder="To"
            className="w-36 sm:w-40"
          />
          {(dateFrom || dateTo) && (
            <Button variant="outline" size="sm" onClick={resetDateFilter}>Reset</Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto mt-2">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="border-slate-200/50 bg-slate-50/50">
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    t.type === "inflow"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}>{t.type.toUpperCase()}</span>
                </TableCell>
                <TableCell className="text-right">{t.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">{t.balance.toFixed(2)}</TableCell>
                <TableCell className="flex gap-1 sm:gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(t)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No transactions found</h3>
            <p className="text-slate-500">Try adjusting your filters or add a new transaction.</p>
          </div>
        )}
      </div>
    </Card>

    {/* Edit Modal */}
    {editDialog.open && editDialog.transaction && (
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input
                value={editDialog.transaction.description}
                onChange={(e) =>
                  setEditDialog({ ...editDialog, transaction: { ...editDialog.transaction!, description: e.target.value } })
                }
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={editDialog.transaction.amount}
                onChange={(e) =>
                  setEditDialog({ ...editDialog, transaction: { ...editDialog.transaction!, amount: parseFloat(e.target.value) } })
                }
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={editDialog.transaction.type}
                onValueChange={(value) =>
                  setEditDialog({ ...editDialog, transaction: { ...editDialog.transaction!, type: value as "inflow" | "outflow" } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inflow">Inflow</SelectItem>
                  <SelectItem value="outflow">Outflow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex justify-end gap-2 flex-wrap">
              <Button type="button" variant="outline" onClick={() => setEditDialog({ open: false })}><X className="w-4 h-4 mr-1" />Cancel</Button>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )}

  </div>
</div>
);
};

export default PettyCash;

