import React, { useState, useEffect } from "react";
import { Plus, Eye, Check, X, Truck, DollarSign, Clock, Package, Download, Pencil, Trash2 } from "lucide-react";


const API_URL = "https://chili-track-dash.onrender.com";

interface PO {
  id: number;
  poNumber: string;
  date: string;
  totalKilos: number;
  amount: number;
  status: "Pending" | "Completed";
}

interface PrimaTransaction {
  id: number;
  poNumber: string;
  date: string;
  kilosDelivered: number;
  amount: number;
  paymentStatus: "Pending" | "Approved" | "Paid" | "Rejected";
}

interface Production {
  id: number;
  date: string;
  kilosIn: number;
  kilosOut: number;
  surplus: number;
  color: "red" | "green";
}

// -------------------- UI Components --------------------
const Button = ({ children, onClick, size = "default", variant = "default", className = "", disabled = false, type = "button" }) => {
  const sizeClasses = { sm: "px-3 py-1.5 text-sm", default: "px-4 py-2", lg: "px-6 py-3 text-lg" };
  const variantClasses: { [key: string]: string } = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, type = "text", placeholder = "", required = false, min, max, step, readOnly = false, className = "" }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    min={min}
    step={step}
    readOnly={readOnly}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${readOnly ? 'bg-gray-100' : ''} ${className}`}
  />
);

const Label = ({ children, className = "" }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

const Card = ({ children, className = "" }) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;

// -------------------- Main Component --------------------
const PrimaPage = () => {
  const [pos, setPOs] = useState<PO[]>([]);
  const [transactions, setTransactions] = useState<PrimaTransaction[]>([]);
  const [production, setProduction] = useState<Production[]>([]);
  const [newPO, setNewPO] = useState({ poNumber: "", date: "", totalKilos: "", amount: "" });
  const [expandedPO, setExpandedPO] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<{ [poNumber: string]: { date: string; kilosDelivered: string; amount: string } }>({});
  const [confirmModal, setConfirmModal] = useState<{ 
    show: boolean; 
    type: "status" | "delete" | "edit";
    id?: number; 
    status?: "Approved" | "Paid" | "Rejected";
    recordType?: "po" | "transaction" | "production";
    data?: any;
  }>({ show: false, type: "status" });
  const [editModal, setEditModal] = useState<{
    show: boolean;
    type: "po" | "transaction" | "production";
    data: any;
  }>({ show: false, type: "po", data: null });
  const [toast, setToast] = useState<{ title: string; description: string; variant?: string } | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const today = new Date().toISOString().split("T")[0];

  // -------------------- Filter Functions --------------------
  const filteredPOs = pos.filter(po => {
    const poDate = new Date(po.date);
    const fromMatch = !dateFrom || poDate >= new Date(dateFrom + "T00:00:00");
    const toMatch = !dateTo || poDate <= new Date(dateTo + "T23:59:59");
    return fromMatch && toMatch;
  });

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    const fromMatch = !dateFrom || txDate >= new Date(dateFrom + "T00:00:00");
    const toMatch = !dateTo || txDate <= new Date(dateTo + "T23:59:59");
    return fromMatch && toMatch;
  });

  const resetDateFilter = () => { setDateFrom(""); setDateTo(""); };

  // -------------------- Toast --------------------
  const showToast = (toastData: { title: string; description: string; variant?: string }) => {
    setToast(toastData);
    setTimeout(() => setToast(null), 3000);
  };

  // -------------------- Stock --------------------
  const getAvailableStock = () => {
    const totalProduced = production.reduce((sum, p) => sum + p.kilosOut, 0);
    const totalDelivered = transactions.filter(t => t.paymentStatus === "Pending" || t.paymentStatus === "Approved" || t.paymentStatus === "Paid").reduce((sum, t) => sum + t.kilosDelivered, 0);
    return Math.max(totalProduced - totalDelivered, 0);
  };

  // -------------------- Fetch Data --------------------
  const fetchPOs = async () => { 
    try { 
      const res = await fetch(`${API_URL}/pos`); 
      setPOs(await res.json() || []); 
    } catch { 
      showToast({ title: "Error", description: "Failed to fetch POs", variant: "destructive" }); 
    } 
  };

  const fetchTransactions = async () => { 
    try { 
      const res = await fetch(`${API_URL}/primatransactions`); 
      setTransactions(await res.json() || []); 
    } catch { 
      showToast({ title: "Error", description: "Failed to fetch transactions", variant: "destructive" }); 
    } 
  };

  const fetchProduction = async () => { 
    try { 
      const res = await fetch(`${API_URL}/production`); 
      setProduction(await res.json() || []); 
    } catch { 
      showToast({ title: "Error", description: "Failed to fetch production data", variant: "destructive" }); 
    } 
  };

  useEffect(() => { fetchPOs(); fetchTransactions(); fetchProduction(); }, []);

  // -------------------- Auto Update PO Status Function --------------------
  const updatePOStatusBasedOnDeliveries = async (poNumber: string) => {
    try {
      // Get fresh data
      const [freshTransactionsRes, freshPOsRes] = await Promise.all([
        fetch(`${API_URL}/primatransactions`), 
        fetch(`${API_URL}/pos`)
      ]);
      const [freshTransactions, freshPOs] = await Promise.all([
        freshTransactionsRes.json(), 
        freshPOsRes.json()
      ]);
      
      const relatedPO = freshPOs.find(po => po.poNumber === poNumber);
      if (!relatedPO) return null;
      
      const totalDelivered = freshTransactions
        .filter(t => t.poNumber === poNumber && t.paymentStatus !== "Rejected")
        .reduce((sum, t) => sum + t.kilosDelivered, 0);
      
      const newPOStatus = totalDelivered >= relatedPO.totalKilos ? "Completed" : "Pending";
      
      if (newPOStatus !== relatedPO.status) {
        await fetch(`${API_URL}/pos/${relatedPO.poNumber}`, { 
          method: "PUT", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ 
            status: newPOStatus, 
            remainingKilos: Math.max(relatedPO.totalKilos - totalDelivered, 0) 
          }) 
        });
        
        // Refresh local state
        await fetchPOs();
        
        return `PO ${poNumber} status changed to ${newPOStatus}`;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to update PO status:", error);
      return null;
    }
  };

  // -------------------- PO Functions --------------------
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const { poNumber, date, totalKilos, amount } = newPO;
    if (!poNumber || !date || !totalKilos || !amount) { 
      showToast({ title: "Error", description: "Please fill all fields", variant: "destructive" }); 
      return; 
    }
    try {
      const res = await fetch(`${API_URL}/pos`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ poNumber, date, totalKilos: Number(totalKilos), amount: Number(amount), status: "Pending" }) 
      });
      const savedPO = await res.json();
      
      // Refresh all data to ensure summary cards update
      await Promise.all([fetchPOs(), fetchTransactions(), fetchProduction()]);
      
      showToast({ title: "PO Created", description: `PO ${poNumber} created successfully` });
      setNewPO({ poNumber: "", date: "", totalKilos: "", amount: "" });
    } catch { 
      showToast({ title: "Error", description: "Failed to create PO", variant: "destructive" }); 
    }
  };

  const getRemainingKilos = (po: PO) => {
    const deliveredForPO = transactions.filter(t => t.poNumber === po.poNumber && t.paymentStatus !== "Rejected").reduce((sum, t) => sum + t.kilosDelivered, 0);
    return Math.max(po.totalKilos - deliveredForPO, 0);
  };

  const getMaxDeliverable = (po: PO) => Math.min(getRemainingKilos(po), getAvailableStock());

  const handleAddDelivery = async (po: PO) => {
    if (po.status === "Completed") { 
      showToast({ title: "PO Completed", description: "Cannot add deliveries to a completed PO", variant: "destructive" }); 
      return; 
    }
    const { date = "", kilosDelivered = "", amount = "" } = deliveryForm[po.poNumber] || {};
    const kilos = parseFloat(kilosDelivered), amt = parseFloat(amount);
    if (!date || !kilos || !amt) { 
      showToast({ title: "Error", description: "Please fill delivery date, kilos, and amount", variant: "destructive" }); 
      return; 
    }
    if (kilos > getMaxDeliverable(po)) { 
      showToast({ title: "Error", description: "Exceeds max deliverable or available stock", variant: "destructive" }); 
      return; 
    }
    try {
      const res = await fetch(`${API_URL}/primatransactions`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ poNumber: po.poNumber, date, kilosDelivered: kilos, amount: amt, paymentStatus: "Pending" }) 
      });
      const savedTransaction = await res.json();
      setTransactions(prev => [...prev, savedTransaction]);
      setDeliveryForm(prev => ({ ...prev, [po.poNumber]: { date: "", kilosDelivered: "", amount: "" } }));
      
      // Check and update PO status
      const statusMessage = await updatePOStatusBasedOnDeliveries(po.poNumber);
      const message = statusMessage 
        ? `${kilos}kg delivered for PO ${po.poNumber}. ${statusMessage}`
        : `${kilos}kg delivered for PO ${po.poNumber}`;
        
      showToast({ title: "Delivery Added", description: message });
    } catch { 
      showToast({ title: "Error", description: "Failed to add delivery", variant: "destructive" }); 
    }
  };

  // -------------------- Edit Functions --------------------
  const handleEditPO = (po: PO) => {
    setEditModal({ 
      show: true, 
      type: "po", 
      data: { ...po }
    });
  };

  const handleEditTransaction = (transaction: PrimaTransaction) => {
    setEditModal({ 
      show: true, 
      type: "transaction", 
      data: { ...transaction }
    });
  };

  const handleEditProduction = (prod: Production) => {
    setEditModal({ 
      show: true, 
      type: "production", 
      data: { ...prod }
    });
  };

  // Auto-calculate amount function for transactions
  const calculateAmountForTransaction = (kilos: number, poNumber: string) => {
    const relatedPO = pos.find(po => po.poNumber === poNumber);
    if (!relatedPO) return 0;
    return (kilos / relatedPO.totalKilos) * relatedPO.amount;
  };

  const handleSaveEdit = async () => {
    const { type, data } = editModal;
    try {
      let endpoint = "";
      let successMessage = "";
      
      switch (type) {
        case "po":
          endpoint = `${API_URL}/pos/${data.poNumber}`;  // Use poNumber for PO updates
          successMessage = "PO updated successfully";
          break;
        case "transaction":
          endpoint = `${API_URL}/primatransactions/${data.id}`;
          successMessage = "Transaction updated successfully";
          break;
        case "production":
          endpoint = `${API_URL}/production/${data.id}`;
          successMessage = "Production record updated successfully";
          break;
      }

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Failed to update record");

      // Special handling for transaction updates - check if PO status needs to change
      if (type === "transaction") {
        const statusMessage = await updatePOStatusBasedOnDeliveries(data.poNumber);
        if (statusMessage) {
          successMessage += `. ${statusMessage}`;
        }
      }

      // Refresh data
      if (type === "po") {
        fetchPOs();
      } else if (type === "transaction") {
        fetchTransactions();
      } else if (type === "production") {
        fetchProduction();
      }

      showToast({ title: "Success", description: successMessage });
      setEditModal({ show: false, type: "po", data: null });
    } catch (error: any) {
      showToast({ title: "Error", description: `Failed to update: ${error.message}`, variant: "destructive" });
    }
  };

  // -------------------- Delete Functions --------------------
  const confirmDelete = (id: number, type: "po" | "transaction" | "production", data?: any) => {
    // Check if PO has transactions before allowing deletion
    if (type === "po" && data) {
      const poTransactions = transactions.filter(t => t.poNumber === data.poNumber);
      if (poTransactions.length > 0) {
        showToast({ 
          title: "Cannot Delete PO", 
          description: `PO ${data.poNumber} has ${poTransactions.length} transaction(s). Delete all transactions first.`, 
          variant: "destructive" 
        });
        return;
      }
    }
    
    setConfirmModal({ 
      show: true, 
      type: "delete",
      id, 
      recordType: type,
      data
    });
  };

  const handleDelete = async () => {
    const { id, recordType, data } = confirmModal;
    if (!id || !recordType) return;

    try {
      let endpoint = "";
      let successMessage = "";
      
      switch (recordType) {
        case "po":
          endpoint = `${API_URL}/pos/${data.poNumber}`;  // Use poNumber instead of id
          successMessage = "PO deleted successfully";
          break;
        case "transaction":
          endpoint = `${API_URL}/primatransactions/${id}`;
          successMessage = "Transaction deleted successfully";
          break;
        case "production":
          endpoint = `${API_URL}/production/${id}`;
          successMessage = "Production record deleted successfully";
          break;
      }

      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete record");

      // Special handling for transaction deletion - check if PO status needs to change
      if (recordType === "transaction" && data) {
        const statusMessage = await updatePOStatusBasedOnDeliveries(data.poNumber);
        if (statusMessage) {
          successMessage += `. ${statusMessage}`;
        }
      }

      // Refresh data
      if (recordType === "po") {
        fetchPOs();
      } else if (recordType === "transaction") {
        fetchTransactions();
      } else if (recordType === "production") {
        fetchProduction();
      }

      showToast({ title: "Success", description: successMessage });
    } catch (error: any) {
      showToast({ title: "Error", description: `Failed to delete: ${error.message}`, variant: "destructive" });
    }
    setConfirmModal({ show: false, type: "status" });
  };

  // -------------------- Status Update Functions --------------------
  const confirmStatusUpdate = (id: number, status: "Approved" | "Paid" | "Rejected") => {
    setConfirmModal({ show: true, type: "status", id, status });
  };

  const updateStatus = async () => {
    if (!confirmModal.id || !confirmModal.status) return;
    try {
      const transactionRes = await fetch(`${API_URL}/primatransactions/${confirmModal.id}/status`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ paymentStatus: confirmModal.status }) 
      });
      if (!transactionRes.ok) throw new Error("Failed to update transaction status");
      
      const updatedTransaction = await transactionRes.json();
      
      // Check and update PO status
      const statusMessage = await updatePOStatusBasedOnDeliveries(updatedTransaction.poNumber);
      
      setTransactions(prev => prev.map(t => t.id === confirmModal.id ? updatedTransaction : t));
      
      const message = statusMessage 
        ? `Transaction marked as ${confirmModal.status}. ${statusMessage}`
        : `Transaction marked as ${confirmModal.status}`;
        
      showToast({ title: "Status Updated", description: message });
    } catch (error: any) { 
      showToast({ title: "Error", description: `Failed to update status: ${error.message}`, variant: "destructive" }); 
    }
    setConfirmModal({ show: false, type: "status" });
  };

  // -------------------- Summary --------------------
  const totalDelivered = filteredTransactions.reduce((sum, t) => sum + t.kilosDelivered, 0);
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const paidAmount = filteredTransactions.filter(t => t.paymentStatus === "Paid").reduce((sum, t) => sum + t.amount, 0);
  const pendingApproval = filteredTransactions.filter(t => t.paymentStatus === "Approved").reduce((sum, t) => sum + t.amount, 0);
  const rejectedPowder = filteredTransactions.filter(t => t.paymentStatus === "Rejected").reduce((sum, t) => sum + t.kilosDelivered, 0);
  const availableStock = getAvailableStock();

  const SummaryCard = ({ title, value, icon: Icon, description }: { title: string; value: string; icon: any; description: string }) => (
    <div className="bg-white/90 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );

  const exportTransactions = () => {
    const csvContent = [
      ["PO Number", "Date", "Kilos Delivered", "Amount", "Payment Status"],
      ...filteredTransactions.map(t => [t.poNumber, t.date, t.kilosDelivered, t.amount, t.paymentStatus])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prima_transactions_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${toast.variant === "destructive" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
          <h4 className="font-semibold">{toast.title}</h4>
          <p className="text-sm">{toast.description}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
        <Package className="w-5 h-5 text-white" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Production Dashboard</h1>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto mt-2 sm:mt-0 gap-2"
        onClick={exportTransactions}
      >
        <Download className="w-4 h-4" /> Export
      </Button>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Delivered" value={`${totalDelivered}kg`} icon={Truck} description="All deliveries including paid, pending, and rejected" />
        <SummaryCard title="Total Revenue" value={`Rs${totalRevenue.toLocaleString()}`} icon={DollarSign} description="Expected revenue" />
        <SummaryCard title="Paid Amount" value={`Rs${paidAmount.toLocaleString()}`} icon={DollarSign} description="Cash received" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <SummaryCard title="Pending Approval" value={`Rs${pendingApproval.toLocaleString()}`} icon={Clock} description="Awaiting payment after approval" />
        <SummaryCard title="Rejected Powder" value={`${rejectedPowder}kg`} icon={X} description="Returned stock" />
        <SummaryCard title="Available Stock" value={`${availableStock.toFixed(2)}kg`} icon={Package} description="Usable stock" />
      </div>

      {/* Create PO Form */}
      <Card className="p-6 bg-white/90 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Create PO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col space-y-1">
              <Label>PO Number</Label>
              <Input value={newPO.poNumber} onChange={e => setNewPO({ ...newPO, poNumber: e.target.value })} required min={undefined} max={undefined} step={undefined} />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>Date</Label>
              <Input type="date" max={today} value={newPO.date} onChange={e => setNewPO({ ...newPO, date: e.target.value })} required min={undefined} step={undefined} />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>Total Kilos</Label>
              <Input type="number" min={1} value={newPO.totalKilos} onChange={e => setNewPO({ ...newPO, totalKilos: e.target.value })} required max={undefined} step={undefined} />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>Amount (Rs)</Label>
              <Input type="number" min={1} value={newPO.amount} onChange={e => setNewPO({ ...newPO, amount: e.target.value })} required max={undefined} step={undefined} />
              <Button type="submit" className="mt-2 flex items-center justify-center" onClick={handleCreatePO}>
                <Plus className="w-4 h-4 mr-2" />Create PO
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PO List */}
      <Card className="p-6 bg-white/90 rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <CardTitle>PO List</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <Input 
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                placeholder="From"
                className="w-full sm:w-40" min={undefined} max={undefined} step={undefined}              />
              <Input 
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                placeholder="To"
                className="w-full sm:w-40" min={undefined} max={undefined} step={undefined}              />
              {(dateFrom || dateTo) && 
                <Button variant="outline" size="sm" onClick={resetDateFilter} className="w-full sm:w-auto">
                  Reset
                </Button>
              }
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="w-full border border-slate-200 rounded-xl overflow-hidden shadow-sm min-w-[600px]">
            <div className="bg-slate-100 sticky top-0 z-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4 font-semibold text-sm">
                <div>PO Number</div>
                <div>Date</div>
                <div className="hidden md:block">Total Kilos</div>
                <div className="hidden md:block">Remaining Kilos</div>
                <div className="hidden lg:block">Amount (Rs)</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
                <div className="hidden sm:block text-right">Edit/Delete</div>
              </div>
            </div>
            <div>
              {filteredPOs.map(po => (
                <React.Fragment key={po.id}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-200 text-sm">
                    <div className="font-medium">{po.poNumber}</div>
                    <div>{new Date(po.date).toLocaleDateString()}</div>
                    <div className="hidden md:block">{po.totalKilos}</div>
                    <div className="hidden md:block">{getRemainingKilos(po)}</div>
                    <div className="hidden lg:block">Rs {po.amount.toLocaleString()}</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${po.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {po.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <Button size="sm" className="gap-1" onClick={() => setExpandedPO(expandedPO === po.poNumber ? null : po.poNumber)}>
                        <Eye className="w-4 h-4" /> View
                      </Button>
                    </div>
                    <div className="hidden sm:flex justify-end space-x-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditPO(po)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => confirmDelete(po.id, "po", po)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded section remains same, wrapped in responsive classes */}
                  {expandedPO === po.poNumber && (
                    <div className="col-span-8 bg-slate-50 p-4 border-b border-slate-200 overflow-x-auto">
                      {/* Delivery Form */}
                      {po.status === "Pending" && getRemainingKilos(po) > 0 && (
                        <div className="mb-4">
                          {availableStock < getRemainingKilos(po) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center gap-2 text-yellow-800">
                                <Package className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Limited Stock: Only {availableStock}kg available (PO needs {getRemainingKilos(po)}kg)
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <Input 
                              type="date"
                              value={deliveryForm[po.poNumber]?.date || ""}
                              onChange={e => setDeliveryForm(prev => ({
                                ...prev,
                                [po.poNumber]: { ...prev[po.poNumber], date: e.target.value }
                              }))} min={undefined} max={undefined} step={undefined}                            />
                            <Input 
                              type="number" 
                              min={0.01}
                              max={getMaxDeliverable(po)} 
                              step="0.01"
                              placeholder={`Max ${getMaxDeliverable(po)}kg`} 
                              value={deliveryForm[po.poNumber]?.kilosDelivered || ""} 
                              onChange={e => {
                                const kilos = parseFloat(e.target.value) || 0;
                                const maxAllowed = getMaxDeliverable(po);
                                if (kilos <= maxAllowed) {
                                  const amount = ((kilos / po.totalKilos) * po.amount).toFixed(2);
                                  setDeliveryForm(prev => ({ 
                                    ...prev, 
                                    [po.poNumber]: { 
                                      ...prev[po.poNumber], 
                                      kilosDelivered: e.target.value, 
                                      amount 
                                    } 
                                  }));
                                }
                              }} 
                            />
                            <Input readOnly placeholder="Amount (Rs)" value={deliveryForm[po.poNumber]?.amount || ""} onChange={undefined} min={undefined} max={undefined} step={undefined} />
                            <Button onClick={() => handleAddDelivery(po)} disabled={getMaxDeliverable(po) <= 0} className="w-full md:w-auto">
                              {getMaxDeliverable(po) <= 0 ? "No Stock" : "Add Delivery"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Transactions Table */}
                      <div className="w-full border border-slate-200 rounded-lg overflow-x-auto min-w-[500px]">
                        <div className="bg-slate-200/60 sticky top-0 z-10">
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 p-3 font-semibold text-sm">
                            <div>Date</div>
                            <div>Kilos</div>
                            <div className="hidden sm:block">Amount</div>
                            <div>Status</div>
                            <div className="text-right">Actions</div>
                            <div className="hidden sm:block text-right">Edit/Delete</div>
                          </div>
                        </div>
                        <div>
                          {transactions.filter(t => t.poNumber === po.poNumber).map(tx => (
                            <div key={tx.id} className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 text-sm">
                              <div>{tx.date}</div>
                              <div>{tx.kilosDelivered}</div>
                              <div className="hidden sm:block">Rs {tx.amount.toLocaleString()}</div>
                              <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.paymentStatus === "Pending" ? "bg-yellow-100 text-yellow-700" : tx.paymentStatus === "Approved" ? "bg-blue-100 text-blue-700" : tx.paymentStatus === "Rejected" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                  {tx.paymentStatus}
                                </span>
                              </div>
                              <div className="text-right space-x-2 flex flex-wrap gap-2 justify-end">
                                {tx.paymentStatus === "Pending" && (
                                  <>
                                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto" onClick={() => confirmStatusUpdate(tx.id, "Approved")}>Approve</Button>
                                    <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={() => confirmStatusUpdate(tx.id, "Rejected")}>Reject</Button>
                                  </>
                                )}
                                {tx.paymentStatus === "Approved" && (
                                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto" onClick={() => confirmStatusUpdate(tx.id, "Paid")}>Mark Paid</Button>
                                )}
                              </div>
                              <div className="hidden sm:flex justify-end space-x-1">
                                <Button size="sm" variant="outline" onClick={() => handleEditTransaction(tx)}>
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => confirmDelete(tx.id, "transaction", tx)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              Edit {editModal.type === "po" ? "PO" : editModal.type === "transaction" ? "Transaction" : "Production"}
            </h2>
            
            {editModal.type === "po" && (
              <div className="space-y-4">
                <div>
                  <Label>PO Number</Label>
                  <Input 
                    value={editModal.data.poNumber}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, poNumber: e.target.value }
                    }))} min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={editModal.data.date}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, date: e.target.value }
                    }))} min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Total Kilos</Label>
                  <Input 
                    type="number"
                    value={editModal.data.totalKilos}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, totalKilos: parseFloat(e.target.value) || 0 }
                    }))} min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Amount (Rs)</Label>
                  <Input 
                    type="number"
                    value={editModal.data.amount}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, amount: parseFloat(e.target.value) || 0 }
                    }))} min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editModal.data.status} 
                    onChange={e => setEditModal(prev => ({ 
                      ...prev, 
                      data: { ...prev.data, status: e.target.value } 
                    }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            )}

            {editModal.type === "transaction" && (
              <div className="space-y-4">
                <div>
                  <Label>PO Number</Label>
                  <Input 
                    value={editModal.data.poNumber}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, poNumber: e.target.value }
                    }))} min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={editModal.data.date}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, date: e.target.value }
                    }))} min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Kilos Delivered</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editModal.data.kilosDelivered}
                    onChange={e => {
                      const kilos = parseFloat(e.target.value) || 0;
                      const calculatedAmount = calculateAmountForTransaction(kilos, editModal.data.poNumber);

                      setEditModal(prev => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          kilosDelivered: kilos,
                          amount: parseFloat(calculatedAmount.toFixed(2))
                        }
                      }));
                    } } min={undefined} max={undefined}                  />
                </div>
                <div>
                  <Label>Amount (Rs) - Auto-calculated</Label>
                  <Input 
                    type="number"
                    value={editModal.data.amount}
                    readOnly
                    className="bg-gray-100" onChange={undefined} min={undefined} max={undefined} step={undefined}                  />
                  <p className="text-xs text-gray-500 mt-1">Amount is calculated based on kilos and PO rate</p>
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editModal.data.paymentStatus} 
                    onChange={e => setEditModal(prev => ({ 
                      ...prev, 
                      data: { ...prev.data, paymentStatus: e.target.value } 
                    }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            )}

            {editModal.type === "production" && (
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={editModal.data.date}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, date: e.target.value }
                    }))} min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Kilos In</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editModal.data.kilosIn}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, kilosIn: parseFloat(e.target.value) || 0 }
                    }))} min={undefined} max={undefined}                  />
                </div>
                <div>
                  <Label>Kilos Out</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editModal.data.kilosOut}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, kilosOut: parseFloat(e.target.value) || 0 }
                    }))} min={undefined} max={undefined}                  />
                </div>
                <div>
                  <Label>Surplus</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editModal.data.surplus}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, surplus: parseFloat(e.target.value) || 0 }
                    }))} min={undefined} max={undefined}                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editModal.data.color} 
                    onChange={e => setEditModal(prev => ({ 
                      ...prev, 
                      data: { ...prev.data, color: e.target.value } 
                    }))}
                  >
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditModal({ show: false, type: "po", data: null })}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">
              {confirmModal.type === "delete" ? "Confirm Delete" : "Confirm Status Update"}
            </h2>
            <p className="mb-4">
              {confirmModal.type === "delete" 
                ? `Are you sure you want to delete this ${confirmModal.recordType}? This action cannot be undone.`
                : `Are you sure you want to mark this transaction as ${confirmModal.status}?`
              }
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmModal({ show: false, type: "status" })}>
                Cancel
              </Button>
              <Button 
                variant={confirmModal.type === "delete" ? "destructive" : "default"}
                onClick={confirmModal.type === "delete" ? handleDelete : updateStatus}
              >
                {confirmModal.type === "delete" ? "Delete" : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimaPage;