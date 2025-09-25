import { useState, useEffect, useMemo } from "react";
import { Plus, DollarSign, Pencil, Trash2, Download } from "lucide-react";
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

interface PettyCash {
  id: number;
  date: string;
  amount: number;
  description: string;
  type: "inflow" | "outflow";
  balance: number;
}

const API_URL = "https://chili-track-dash.onrender.com";

const PettyCashDashboard = () => {
  const [transactions, setTransactions] = useState<PettyCash[]>([]);
  const [formData, setFormData] = useState({ amount: "", description: "", type: "inflow" });
  const [editingTx, setEditingTx] = useState<PettyCash | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();

  // Fetch transactions
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/pettycash`);
      const data = await res.json();
      setTransactions(data);
    } catch {
      toast({ title: "Error", description: "Failed to fetch petty cash", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Export to CSV
  const handleExport = () => {
    if (transactions.length === 0) {
      toast({ title: "No data", description: "No petty cash to export.", variant: "destructive" });
      return;
    }

    const headers = ["Date", "Description", "Type", "Amount", "Balance"];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.type,
      t.amount.toFixed(2),
      t.balance.toFixed(2),
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pettycash_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "✅ Exported", description: "Petty cash exported successfully." });
  };

  // Add transaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.type) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      await fetch(`${API_URL}/pettycash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) }),
      });
      toast({ title: "✅ Transaction Added", description: `${formData.description} recorded` });
      setFormData({ amount: "", description: "", type: "inflow" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to save transaction", variant: "destructive" });
    }
  };

  // Edit transaction
  const handleEditClick = (tx: PettyCash) => {
    setEditingTx(tx);
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingTx) return;
    try {
      await fetch(`${API_URL}/pettycash/${editingTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingTx,
          amount: parseFloat(editingTx.amount.toString()),
        }),
      });
      toast({ title: "✏️ Updated", description: `${editingTx.description} updated successfully` });
      setIsDialogOpen(false);
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to update transaction", variant: "destructive" });
    }
  };

  // Delete transaction
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await fetch(`${API_URL}/pettycash/${id}`, { method: "DELETE" });
      toast({ title: "🗑️ Deleted", description: "Transaction removed successfully" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete transaction", variant: "destructive" });
    }
  };

  const totalInflow = useMemo(() => transactions.filter(t => t.type === "inflow").reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalOutflow = useMemo(() => transactions.filter(t => t.type === "outflow").reduce((s, t) => s + t.amount, 0), [transactions]);
  const latestBalance = transactions.length > 0 ? transactions[0].balance : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Petty Cash Dashboard</h1>
        <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="p-4"><h2 className="text-sm">Total Inflow</h2><p className="text-xl font-bold text-green-600">Rs.{totalInflow.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><h2 className="text-sm">Total Outflow</h2><p className="text-xl font-bold text-red-600">Rs.{totalOutflow.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><h2 className="text-sm">Current Balance</h2><p className="text-xl font-bold text-slate-900">Rs.{latestBalance.toLocaleString()}</p></CardContent></Card>
      </div>

      {/* Add Form */}
      <Card>
        <CardHeader><CardTitle>Add Transaction</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
            </div>
            <div>
              <Label>Type</Label>
              <select className="w-full border rounded-lg p-2" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="inflow">Inflow</option>
                <option value="outflow">Outflow</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <Button type="submit" className="w-full bg-gradient-to-br from-green-500 to-green-700">Record Transaction</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount (Rs)</TableHead>
                <TableHead className="text-right">Balance (Rs)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className="text-right">{tx.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{tx.balance.toLocaleString()}</TableCell>
                  <TableCell className="flex justify-center gap-3">
                    <Button size="sm" variant="outline" onClick={() => handleEditClick(tx)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(tx.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No petty cash records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          {editingTx && (
            <div className="grid gap-4">
              <div>
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={editingTx.amount} onChange={e => setEditingTx({ ...editingTx, amount: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={editingTx.description} onChange={e => setEditingTx({ ...editingTx, description: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <select className="w-full border rounded-lg p-2" value={editingTx.type} onChange={e => setEditingTx({ ...editingTx, type: e.target.value as "inflow" | "outflow" })}>
                  <option value="inflow">Inflow</option>
                  <option value="outflow">Outflow</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PettyCashDashboard;
