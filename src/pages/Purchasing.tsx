import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Package,
  DollarSign,
  Download,
  TrendingUp,
  Calendar,
  AlertCircle,
  Pencil,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Purchase {
  id: number;
  date: string;
  quantity: number;
  price: number;
  paymentMethod: "cash" | "credit";
  color: "red" | "green";
  supplier: string;
}

const API_URL = "https://chili-track-dash.onrender.com";

const Purchasing = () => {
  const [formData, setFormData] = useState({
    date: "",
    quantity: "",
    price: "",
    paymentMethod: "",
    color: "",
    supplier: ""
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/purchases`);
      const data = await res.json();
      setPurchases(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch purchases.", variant: "destructive" });
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const purchaseDate = new Date(p.date);
      const fromMatch = !dateFrom || purchaseDate >= new Date(dateFrom + "T00:00:00");
      const toMatch = !dateTo || purchaseDate <= new Date(dateTo + "T23:59:59");
      return fromMatch && toMatch;
    });
  }, [purchases, dateFrom, dateTo]);

  const exportToCSV = () => {
    if (filteredPurchases.length === 0) {
      toast({ title: "No Data", description: "No purchases to export.", variant: "destructive" });
      return;
    }

    const headers = ["Date", "Quantity (kg)", "Price/kg", "Payment Method", "Color", "Supplier", "Total"];
    const rows = filteredPurchases.map(p => [
      new Date(p.date).toLocaleDateString(),
      p.quantity,
      p.price.toFixed(2),
      p.paymentMethod,
      p.color,
      p.supplier,
      (p.quantity * p.price).toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `purchases_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
  };

  const summary = useMemo(() => {
    let cash = 0, credit = 0, redKg = 0, greenKg = 0;
    filteredPurchases.forEach(p => {
      const total = (p.quantity || 0) * (p.price || 0);
      if (p.paymentMethod === "cash") cash += total;
      else credit += total;
      if (p.color === "red") redKg += p.quantity || 0;
      else if (p.color === "green") greenKg += p.quantity || 0;
    });
    return { cash, credit, total: cash + credit, redKg, greenKg, totalRecords: filteredPurchases.length };
  }, [filteredPurchases]);

  const resetDateFilter = () => { setDateFrom(""); setDateTo(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { date, quantity, price, paymentMethod, color, supplier } = formData;

    if (!date || !quantity || !price || !paymentMethod || !color || !supplier) {
      toast({ title: "Error", description: "Fill all fields.", variant: "destructive" });
      return;
    }

    try {
      let savedPurchase: Purchase;
      if (editingId) {
        const res = await fetch(`${API_URL}/purchases/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            paymentMethod,
            color,
            supplier
          })
        });
        if (!res.ok) throw new Error("Failed to update");
        savedPurchase = await res.json();
        setPurchases(prev => prev.map(p => p.id === editingId ? savedPurchase : p));
        toast({ title: "✅ Purchase Updated", description: `Updated ${quantity} kg (${color}) from ${supplier}` });
        setEditingId(null);
        setIsEditingModalOpen(false);
      } else {
        const res = await fetch(`${API_URL}/purchases`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            paymentMethod,
            color,
            supplier
          })
        });
        if (!res.ok) throw new Error("Failed to save");
        savedPurchase = await res.json();
        if (!savedPurchase.id) savedPurchase.id = Date.now();
        setPurchases(prev => [savedPurchase, ...prev]);
        toast({ title: "✅ Purchase Recorded", description: `Added ${quantity} kg (${color}) from ${supplier}` });
      }

      setFormData({ date: "", quantity: "", price: "", paymentMethod: "", color: "", supplier: "" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save purchase.", variant: "destructive" });
      console.error(err);
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingId(purchase.id);
    setFormData({
      date: purchase.date,
      quantity: purchase.quantity.toString(),
      price: purchase.price.toString(),
      paymentMethod: purchase.paymentMethod,
      color: purchase.color,
      supplier: purchase.supplier
    });
    setIsEditingModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this purchase?")) return;
    try {
      const res = await fetch(`${API_URL}/purchases/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPurchases(prev => prev.filter(p => p.id !== id));
      toast({ title: "✅ Purchase Deleted" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete purchase.", variant: "destructive" });
      console.error(err);
    }
  };

  // Mark as Paid
  const handleMarkAsPaid = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/purchases/${id}/pay`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to update payment");
      const updatedPurchase = await res.json();
      setPurchases(prev =>
        prev.map(p => (p.id === id ? { ...p, paymentMethod: "cash" } : p))
      );
      toast({
        title: "✅ Payment Updated",
        description: "Purchase marked as paid (cash).",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update payment.",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white/80 rounded-2xl p-4 md:p-6 shadow-lg flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 flex-1">Purchasing Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 sm:mt-0 gap-2"
          onClick={exportToCSV}
        >
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: "Cash Purchases", value: `Rs.${summary.cash.toLocaleString()}`, icon: DollarSign, color: "emerald-600" },
          { title: "Credit Purchases", value: `Rs.${summary.credit.toLocaleString()}`, icon: AlertCircle, color: "orange-600" },
          { title: "Total Purchases", value: `Rs.${summary.total.toLocaleString()}`, icon: Package, color: "blue-600" },
          { title: "Total Records", value: summary.totalRecords, icon: Calendar, color: "purple-600" },
          { title: "Red Bonnets (kg)", value: `${summary.redKg.toLocaleString()} kg`, icon: Package, color: "red-600" },
          { title: "Green Bonnets (kg)", value: `${summary.greenKg.toLocaleString()} kg`, icon: Package, color: "green-600" },
        ].map((card, idx) => (
          <Card key={idx} className="bg-white/90 shadow-lg rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className={`w-5 h-5 text-${card.color}`} />
            </div>
            <h3 className="text-sm font-medium text-slate-600">{card.title}</h3>
            <p className="text-xl font-bold text-slate-900">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* Add Purchase Form */}
      <Card>
        <CardHeader><CardTitle>Add Purchase</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required placeholder="Quantity (kg)" />
            <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required placeholder="Price/kg" />
            <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} required className="w-full">
              <option value="">Select payment</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
            <select value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required className="w-full">
              <option value="">Select color</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
            </select>
            <Input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} required placeholder="Supplier" />
            <Button type="submit" className="col-span-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center gap-2 justify-center">
              <Plus className="w-4 h-4" /> Record Purchase
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table & Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full flex-wrap">
            <CardTitle>Purchase History</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" className="w-full sm:w-40" />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" className="w-full sm:w-40" />
              {(dateFrom || dateTo) && <Button variant="outline" size="sm" onClick={resetDateFilter}>Reset</Button>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[700px] md:min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price/kg</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                  <TableCell>{p.quantity} kg</TableCell>
                  <TableCell>Rs.{p.price.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{p.paymentMethod}</TableCell>
                  <TableCell className="capitalize">{p.color}</TableCell>
                  <TableCell>{p.supplier}</TableCell>
                  <TableCell className="text-right">Rs.{(p.quantity * p.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                      {p.paymentMethod === "credit" && <Button variant="secondary" size="sm" onClick={() => handleMarkAsPaid(p.id)}>Mark as Paid</Button>}
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

export default Purchasing;
