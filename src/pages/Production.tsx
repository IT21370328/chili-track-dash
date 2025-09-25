import { useState, useEffect, useMemo } from "react";
import { Plus, Package, Truck, Pencil, Trash2, Download } from "lucide-react";
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

interface Production {
  id: number;
  date: string;
  kilosIn: number;
  kilosOut: number;
  surplus: number;
  color: "red" | "green";
}

interface Stock {
  red: number;
  green: number;
}

const API_URL = "https://chili-track-dash.onrender.com";
const DRY_RATIO = 0.1;

const ProductionPage = () => {
  const [records, setRecords] = useState<Production[]>([]);
  const [stock, setStock] = useState<Stock>({ red: 0, green: 0 });
  const [formData, setFormData] = useState({
    date: "",
    kilosIn: "",
    kilosOut: "",
    color: "" as "red" | "green" | ""
  });
  const [filters, setFilters] = useState({ search: "", dateFrom: "", dateTo: "" });

  // Edit dialog state
  const [editingRecord, setEditingRecord] = useState<Production | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = () => {
  if (filteredRecords.length === 0) {
    toast({ title: "No data", description: "No production records to export.", variant: "destructive" });
    return;
  }

  const headers = ["Date", "Kilos In", "Green Dry Kilos", "Red Dry Kilos", "Surplus", "Color"];
  const rows = filteredRecords.map(r => [
    new Date(r.date).toLocaleDateString(),
    r.kilosIn.toFixed(2),
    r.color === "green" ? r.kilosOut.toFixed(2) : "0",
    r.color === "red" ? r.kilosOut.toFixed(2) : "0",
    r.surplus.toFixed(2),
    r.color
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `production_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast({ title: "✅ Exported", description: "Production records exported successfully." });
};


  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  // Fetch production
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/production`);
      const data = await res.json();
      setRecords((data || []).map((r: any) => ({
        id: r.id,
        date: r.date,
        kilosIn: Number(r.kilosIn || 0),
        kilosOut: Number(r.kilosOut || 0),
        surplus: Number(r.surplus || 0),
        color: r.color
      })));
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch production data", variant: "destructive" });
    }
  };

  // Calculate stock
  const fetchStock = async () => {
    try {
      const res = await fetch(`${API_URL}/purchases`);
      const data = await res.json();
      const stockData: Stock = { red: 0, green: 0 };
      data.forEach((p: any) => {
        if (p.color === "red") stockData.red += Number(p.quantity || 0);
        if (p.color === "green") stockData.green += Number(p.quantity || 0);
      });
      records.forEach(r => {
        if (r.color === "red") stockData.red -= r.kilosIn;
        if (r.color === "green") stockData.green -= r.kilosIn;
      });
      setStock(stockData);
    } catch {
      toast({ title: "Error", description: "Failed to fetch stock data", variant: "destructive" });
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchStock(); }, [records]);

  // Add new production
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { date, kilosIn, kilosOut, color } = formData;
    if (!date || !kilosIn || !kilosOut || !color) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const kilosInValue = parseFloat(kilosIn);
    const kilosOutValue = parseFloat(kilosOut);

    if ((color === "red" && kilosInValue > stock.red) || (color === "green" && kilosInValue > stock.green)) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${color === "red" ? stock.red : stock.green} kg of ${color} available`,
        variant: "destructive"
      });
      return;
    }

    const surplus = kilosOutValue - kilosInValue * DRY_RATIO;

    try {
      const res = await fetch(`${API_URL}/production`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, kilosIn: kilosInValue, kilosOut: kilosOutValue, color, surplus: parseFloat(surplus.toFixed(2)) })
      });
      const saved = await res.json();
      setRecords(prev => [...prev, { id: saved.id ?? Date.now(), date, kilosIn: kilosInValue, kilosOut: kilosOutValue, color, surplus: parseFloat(surplus.toFixed(2)) }]);
      toast({ title: "✅ Production Recorded", description: `In: ${kilosInValue} → Out: ${kilosOutValue} (Surplus: ${surplus.toFixed(2)} kg)` });
      setFormData({ date: "", kilosIn: "", kilosOut: "", color: "" });
    } catch {
      toast({ title: "Error", description: "Failed to add production record", variant: "destructive" });
    }
  };

  // Edit
  const handleEditClick = (record: Production) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;
    const surplus = editingRecord.kilosOut - editingRecord.kilosIn * DRY_RATIO;
    try {
      await fetch(`${API_URL}/production/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingRecord, surplus: parseFloat(surplus.toFixed(2)) })
      });
      toast({ title: "✏️ Updated", description: `Record updated successfully` });
      setIsDialogOpen(false);
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to update record", variant: "destructive" });
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`${API_URL}/production/${id}`, { method: "DELETE" });
      toast({ title: "🗑️ Deleted", description: "Record removed successfully" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to delete record", variant: "destructive" });
    }
  };

  const filteredRecords = useMemo(() => records.filter(r => {
    const date = new Date(r.date);
    const searchMatch = !filters.search || r.color.includes(filters.search.toLowerCase());
    const fromMatch = !filters.dateFrom || date >= new Date(filters.dateFrom);
    const toMatch = !filters.dateTo || date <= new Date(filters.dateTo);
    return searchMatch && fromMatch && toMatch;
  }), [records, filters]);

  const totals = useMemo(() => {
    let totalIn = 0, totalGreenOut = 0, totalRedOut = 0, totalSurplus = 0;
    filteredRecords.forEach(r => {
      totalIn += r.kilosIn;
      totalSurplus += r.surplus;
      if (r.color === "green") totalGreenOut += r.kilosOut;
      else totalRedOut += r.kilosOut;
    });
    return { totalIn, totalGreenOut, totalRedOut, totalSurplus, totalQuantity: totalGreenOut + totalRedOut };
  }, [filteredRecords]);

  const SummaryCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: any }) => (
    <div className="bg-white/90 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Purchasing Dashboard</h1>
        <Button
  variant="outline"
  size="sm"
  className="ml-auto gap-2"
  onClick={handleExport}
>
  <Download className="w-4 h-4" /> Export
</Button>

      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Total Kilos In" value={`${totals.totalIn.toFixed(2)}kg`} icon={Package} />
          <SummaryCard title="Green Dry Kilos" value={`${totals.totalGreenOut.toFixed(2)}kg`} icon={Truck} />
          <SummaryCard title="Red Dry Kilos" value={`${totals.totalRedOut.toFixed(2)}kg`} icon={Truck} />
          <SummaryCard title="Total Surplus" value={`${totals.totalSurplus.toFixed(2)}kg`} icon={Plus} />
          <SummaryCard title="Total Quantity" value={`${totals.totalQuantity.toFixed(2)}kg`} icon={Package} />
        </div>

        {/* Form */}
        <Card className="bg-white/90 shadow-lg rounded-2xl p-6">
          <CardHeader>
            <CardTitle>Record Production</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-1">
                <Label>Date</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="flex flex-col space-y-1">
                <Label>Color</Label>
                <select className="w-full border rounded-lg p-2" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value as "red" | "green"})}>
                  <option value="">Select color</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1">
                <Label>Kilos In</Label>
                <Input type="number" min="0" value={formData.kilosIn} onChange={e => setFormData({...formData, kilosIn: e.target.value})} required />
                {formData.color && <p className={`text-xs mt-1 font-medium ${formData.color === "red" ? "text-red-600" : "text-green-600"}`}>Max available: {formData.color === "red" ? stock.red : stock.green} kg</p>}
              </div>
              <div className="flex flex-col space-y-1">
                <Label>Kilos Out</Label>
                <Input type="number" min="0" value={formData.kilosOut} onChange={e => setFormData({...formData, kilosOut: e.target.value})} required />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl h-11 font-medium flex items-center justify-center mt-2">
                  <Plus className="w-4 h-4 mr-2" /> Record Production
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white/90 shadow-lg rounded-2xl p-6">
          {/* Table Header with Filters */}
<CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
    <Input
      type="date"
      value={filters.dateFrom}
      onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
      className="sm:w-40"
      placeholder="From"
    />
    <Input
      type="date"
      value={filters.dateTo}
      onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
      className="sm:w-40"
      placeholder="To"
    />
    {(filters.search || filters.dateFrom || filters.dateTo) && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setFilters({ search: "", dateFrom: "", dateTo: "" })}
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
                  <TableHead>Kilos In</TableHead>
                  <TableHead>Green Dry Kilos</TableHead>
                  <TableHead>Red Dry Kilos</TableHead>
                  <TableHead>Surplus</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.kilosIn.toFixed(2)}</TableCell>
                    <TableCell className="text-green-700 font-semibold">{r.color === "green" ? r.kilosOut.toFixed(2) : 0}</TableCell>
                    <TableCell className="text-red-600 font-semibold">{r.color === "red" ? r.kilosOut.toFixed(2) : 0}</TableCell>
                    <TableCell className="text-blue-700 font-semibold">{r.surplus.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{r.color}</TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditClick(r)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Production</DialogTitle>
            </DialogHeader>
            {editingRecord && (
              <div className="grid gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={editingRecord.date} max={today} onChange={e => setEditingRecord({ ...editingRecord, date: e.target.value })} />
                </div>
                <div>
                  <Label>Color</Label>
                  <select className="w-full border rounded-lg p-2" value={editingRecord.color} onChange={e => setEditingRecord({ ...editingRecord, color: e.target.value as "red" | "green" })}>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                  </select>
                </div>
                <div>
                  <Label>Kilos In</Label>
                  <Input type="number" min="0" value={editingRecord.kilosIn} onChange={e => setEditingRecord({ ...editingRecord, kilosIn: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Kilos Out</Label>
                  <Input type="number" min="0" value={editingRecord.kilosOut} onChange={e => setEditingRecord({ ...editingRecord, kilosOut: Number(e.target.value) })} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default ProductionPage;
