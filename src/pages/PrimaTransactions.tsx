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
const Button = ({ children, onClick, size = "default", variant = "default", className = "", disabled = false, type = "button" }: any) => {
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
      type={type}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, type = "text", placeholder = "", required = false, min, max, step, readOnly = false, className = "" }: any) => (
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

const Label = ({ children, className = "" }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

const Card = ({ children, className = "" }: any) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }: any) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;

// -------------------- Main Component --------------------
const PrimaPage = () => {
  const [pos, setPOs] = useState<PO[]>([]);
  const [transactions, setTransactions] = useState<PrimaTransaction[]>([]);
  const [production, setProduction] = useState<Production[]>([]);
  const [newPO, setNewPO] = useState({ poNumber: "", date: "", totalKilos: "", amount: "" });
  const [expandedPO, setExpandedPO] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<{ [poNumber: string]: { date: string; kilosDelivered: string; amount: string } }>({});
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; type: "status" | "delete" | "edit"; id?: number; status?: "Approved" | "Paid" | "Rejected"; recordType?: "po" | "transaction" | "production"; data?: any }>({ show: false, type: "status" });
  const [editModal, setEditModal] = useState<{ show: boolean; type: "po" | "transaction" | "production"; data: any }>({ show: false, type: "po", data: null });
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
    const totalDelivered = transactions.filter(t => t.paymentStatus !== "Rejected").reduce((sum, t) => sum + t.kilosDelivered, 0);
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

  // -------------------- PO Status Update --------------------
  const updatePOStatusBasedOnDeliveries = async (poNumber: string) => {
    try {
      const [freshTransactionsRes, freshPOsRes] = await Promise.all([
        fetch(`${API_URL}/primatransactions`), 
        fetch(`${API_URL}/pos`)
      ]);
      const [freshTransactions, freshPOs] = await Promise.all([freshTransactionsRes.json(), freshPOsRes.json()]);
      
      const relatedPO = freshPOs.find((po: PO) => po.poNumber === poNumber);
      if (!relatedPO) return null;
      
      const totalDelivered = freshTransactions.filter((t: PrimaTransaction) => t.poNumber === poNumber && t.paymentStatus !== "Rejected").reduce((sum, t) => sum + t.kilosDelivered, 0);
      
      const newPOStatus = totalDelivered >= relatedPO.totalKilos ? "Completed" : "Pending";
      if (newPOStatus !== relatedPO.status) {
        await fetch(`${API_URL}/pos/${relatedPO.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newPOStatus }) });
      }
      fetchPOs();
    } catch (error) { console.error(error); }
  };

  // -------------------- Event Handlers --------------------
  const handleAddDelivery = async (po: PO) => {
    const form = deliveryForm[po.poNumber];
    if (!form?.date || !form?.kilosDelivered) return showToast({ title: "Error", description: "Please fill delivery form", variant: "destructive" });

    const newTx: Partial<PrimaTransaction> = { poNumber: po.poNumber, date: form.date, kilosDelivered: parseFloat(form.kilosDelivered), amount: parseFloat(form.amount), paymentStatus: "Pending" };
    try {
      await fetch(`${API_URL}/primatransactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTx) });
      showToast({ title: "Success", description: "Delivery added" });
      setDeliveryForm(prev => ({ ...prev, [po.poNumber]: { date: "", kilosDelivered: "", amount: "" } }));
      fetchTransactions();
      updatePOStatusBasedOnDeliveries(po.poNumber);
    } catch { showToast({ title: "Error", description: "Failed to add delivery", variant: "destructive" }); }
  };

  const handleDelete = async (type: "po" | "transaction" | "production", id: number) => {
    try { 
      await fetch(`${API_URL}/${type === "po" ? "pos" : type === "transaction" ? "primatransactions" : "production"}/${id}`, { method: "DELETE" }); 
      showToast({ title: "Deleted", description: `${type} deleted` });
      fetchPOs(); fetchTransactions(); fetchProduction();
    } catch { showToast({ title: "Error", description: "Delete failed", variant: "destructive" }); }
  };

  const handleEditSave = async () => {
    if (!editModal.data) return;
    const type = editModal.type;
    try {
      await fetch(`${API_URL}/${type === "po" ? "pos" : type === "transaction" ? "primatransactions" : "production"}/${editModal.data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editModal.data)
      });
      showToast({ title: "Updated", description: `${type} updated` });
      setEditModal({ show: false, type: "po", data: null });
      fetchPOs(); fetchTransactions(); fetchProduction();
    } catch { showToast({ title: "Error", description: "Update failed", variant: "destructive" }); }
  };

  // -------------------- CSV Export --------------------
  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["PO Number,Date,Kilos Delivered,Amount,Payment Status"].concat(
        filteredTransactions.map(t => [t.poNumber, t.date, t.kilosDelivered, t.amount, t.paymentStatus].join(","))
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "prima_transactions.csv");
    document.body.appendChild(link);
    link.click();
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-6 p-6">
      {/* ---------- Toast ---------- */}
      {toast && <div className={`fixed top-5 right-5 p-4 rounded-md ${toast.variant === "destructive" ? "bg-red-500" : "bg-green-500"} text-white`}>{toast.title}: {toast.description}</div>}

      {/* ---------- Filters ---------- */}
      <div className="flex space-x-3 items-end">
        <div><Label>Date From</Label><Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} max={today} /></div>
        <div><Label>Date To</Label><Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} max={today} /></div>
        <Button onClick={resetDateFilter}>Reset</Button>
        <Button onClick={exportCSV} variant="outline"><Download size={16} className="mr-1"/>Export CSV</Button>
      </div>

      {/* ---------- Summary Cards ---------- */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Total Delivered</CardTitle></CardHeader><CardContent>{transactions.reduce((sum,t)=>sum+t.kilosDelivered,0)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader><CardContent>{transactions.reduce((sum,t)=>sum+t.amount,0)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid Amount</CardTitle></CardHeader><CardContent>{transactions.filter(t=>t.paymentStatus==="Paid").reduce((sum,t)=>sum+t.amount,0)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Available Stock</CardTitle></CardHeader><CardContent>{getAvailableStock()}</CardContent></Card>
      </div>

      {/* ---------- PO List ---------- */}
      <div className="space-y-4">
        {filteredPOs.map(po => (
          <Card key={po.id}>
            <CardHeader className="flex justify-between items-center">
              <div>{po.poNumber} - {po.date} - Status: {po.status}</div>
              <div className="space-x-2">
                <Button size="sm" onClick={()=>setExpandedPO(expandedPO===po.poNumber?null:po.poNumber)}>{expandedPO===po.poNumber?<X size={16}/>:<Eye size={16}/>}</Button>
                <Button size="sm" onClick={()=>setEditModal({ show:true,type:"po",data:po })}><Pencil size={16}/></Button>
                <Button size="sm" variant="destructive" onClick={()=>handleDelete("po", po.id)}><Trash2 size={16}/></Button>
              </div>
            </CardHeader>
            {expandedPO===po.poNumber && (
              <CardContent className="space-y-3">
                <div className="flex space-x-2 items-end">
                  <Input type="date" value={deliveryForm[po.poNumber]?.date||""} onChange={e=>setDeliveryForm(prev=>({...prev,[po.poNumber]:{...prev[po.poNumber],date:e.target.value}}))}/>
                  <Input type="number" placeholder="Kilos Delivered" value={deliveryForm[po.poNumber]?.kilosDelivered||""} onChange={e=>{
                    const kilos = parseFloat(e.target.value)||0;
                    const amount = ((kilos/po.totalKilos)*po.amount).toFixed(2);
                    setDeliveryForm(prev=>({...prev,[po.poNumber]:{...prev[po.poNumber],kilosDelivered:e.target.value,amount}}));
                  }}/>
                  <Button onClick={()=>handleAddDelivery(po)}><Truck size={16}/>Add Delivery</Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* ---------- Edit Modal ---------- */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-96 space-y-4">
            <h3 className="text-lg font-semibold">Edit {editModal.type}</h3>
            {editModal.type==="po" && editModal.data && <>
              <Label>PO Number</Label>
              <Input value={editModal.data.poNumber} onChange={e=>setEditModal(prev=>({...prev,data:{...prev.data,poNumber:e.target.value}}))}/>
              <Label>Date</Label>
              <Input type="date" value={editModal.data.date} onChange={e=>setEditModal(prev=>({...prev,data:{...prev.data,date:e.target.value}}))}/>
              <Label>Total Kilos</Label>
              <Input type="number" value={editModal.data.totalKilos} onChange={e=>setEditModal(prev=>({...prev,data:{...prev.data,totalKilos:e.target.value}}))}/>
              <Label>Amount</Label>
              <Input type="number" value={editModal.data.amount} onChange={e=>setEditModal(prev=>({...prev,data:{...prev.data,amount:e.target.value}}))}/>
            </>}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={()=>setEditModal({ show:false,type:"po",data:null })}>Cancel</Button>
              <Button onClick={handleEditSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimaPage;
