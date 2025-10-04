import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Eye, X, Truck, DollarSign, Clock, Package, Download, Pencil, Trash2 } from "lucide-react";
// import { generateInvoice } from './NewInvoice';
import { logAction } from "@/pages/logHelper"; // ✅ Added logger import

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || "https://chili-track-dash.onrender.com";

interface PO {
  id: number;
  poNumber: string;
  date: string;
  totalKilos: number;
  remainingKilos: number;
  amount: number;
  status: "Pending" | "Completed";
}

interface PrimaTransaction {
  id: number;
  poId: number;
  poNumber: string | null;
  date: string;
  kilosDelivered: number;
  amount: number;
  numberOfBoxes: number | null;
  dateOfExpiration: string | null;
  productCode: string | null;
  invoiceNo: string | null;
  batchCode: string | null;
  truckNo: string | null;
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

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "destructive";
  className?: string;
  disabled?: boolean;
  type?: "button" | "reset" | "submit";
}

// -------------------- UI Components --------------------
const Button = ({ children, onClick, size = "default", variant = "default", className = "", disabled = false, type = "button" }: ButtonProps) => {
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
      type={type}
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
    max={max}
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
  const navigate = useNavigate();
  const [pos, setPOs] = useState<PO[]>([]);
  const [transactions, setTransactions] = useState<PrimaTransaction[]>([]);
  const [production, setProduction] = useState<Production[]>([]);
  const [newPO, setNewPO] = useState({ poNumber: "", date: "", totalKilos: "", amount: "" });
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<{ 
    [poNumber: string]: { 
      date: string; 
      kilosDelivered: string; 
      amount: string; 
      numberOfBoxes: string;
      dateOfExpiration: string;
      productCode: string;
      invoiceNo: string;
      batchCode: string;
      truckNo: string;
    } 
  }>({});
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
  const currentUser = localStorage.getItem("username") || "Unknown"; // ✅ Added for logging

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
    const totalDelivered = transactions
      .filter(t => t.paymentStatus === "Pending" || t.paymentStatus === "Approved" || t.paymentStatus === "Paid")
      .reduce((sum, t) => sum + t.kilosDelivered, 0);
    return Math.max(totalProduced - totalDelivered, 0);
  };

  // -------------------- Fetch Data --------------------
  const fetchPOs = async () => { 
    try { 
      const res = await fetch(`${API_URL}/pos`); 
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch POs: ${res.statusText}`);
      }
      setPOs(await res.json() || []); 
    } catch (error: any) { 
      showToast({ title: "Error", description: error.message, variant: "destructive" }); 
    } 
  };

  const fetchTransactions = async () => { 
    try { 
      const res = await fetch(`${API_URL}/primatransactions`); 
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch transactions: ${res.statusText}`);
      }
      const data = await res.json() || [];
      setTransactions(data.map(tx => ({
        ...tx,
        numberOfBoxes: tx.numberOfBoxes != null ? Number(tx.numberOfBoxes) : null,
        poNumber: tx.poNumber,
      }))); 
    } catch (error: any) { 
      showToast({ title: "Error", description: error.message, variant: "destructive" }); 
    } 
  };

  const fetchProduction = async () => { 
    try { 
      const res = await fetch(`${API_URL}/production`); 
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch production data: ${res.statusText}`);
      }
      setProduction(await res.json() || []); 
    } catch (error: any) { 
      showToast({ title: "Error", description: error.message, variant: "destructive" }); 
    } 
  };

  useEffect(() => { 
    fetchPOs(); 
    fetchTransactions(); 
    fetchProduction(); 
  }, []);

  // -------------------- Auto Update PO Status Function --------------------
  const updatePOStatusBasedOnDeliveries = async (poNumber: string) => {
    try {
      console.log(`Updating PO status for: ${poNumber}`);
      
      const [freshTransactionsRes, freshPOsRes] = await Promise.all([
        fetch(`${API_URL}/primatransactions`), 
        fetch(`${API_URL}/pos`)
      ]);
      
      if (!freshTransactionsRes.ok || !freshPOsRes.ok) {
        const errorData = await Promise.all([
          freshTransactionsRes.json().catch(() => ({})),
          freshPOsRes.json().catch(() => ({}))
        ]);
        throw new Error(errorData[0].error || errorData[1].error || "Failed to fetch data for PO status update");
      }
      
      const [freshTransactions, freshPOs] = await Promise.all([
        freshTransactionsRes.json(), 
        freshPOsRes.json()
      ]);
      
      const relatedPO = freshPOs.find(po => po.poNumber === poNumber);
      if (!relatedPO) {
        console.log(`PO ${poNumber} not found`);
        return null;
      }
      
      console.log(`Found PO: ${relatedPO.poNumber}, Current Status: ${relatedPO.status}, Total: ${relatedPO.totalKilos}kg, Remaining: ${relatedPO.remainingKilos}kg`);
      
      const poTransactions = freshTransactions.filter(t => t.poNumber === poNumber);
      console.log(`Found ${poTransactions.length} transactions for PO ${poNumber}`);
      
      const totalDelivered = poTransactions
        .filter(t => t.paymentStatus !== "Rejected")
        .reduce((sum, t) => sum + t.kilosDelivered, 0);
      
      const approvedDelivered = poTransactions
        .filter(t => t.paymentStatus === "Approved" || t.paymentStatus === "Paid")
        .reduce((sum, t) => sum + t.kilosDelivered, 0);
      
      console.log(`Total delivered (excl. rejected): ${totalDelivered}kg`);
      console.log(`Approved/Paid delivered: ${approvedDelivered}kg`);
      
      const newRemainingKilos = Math.max(relatedPO.totalKilos - totalDelivered, 0);
      
      const allKilosDelivered = newRemainingKilos === 0;
      const allDeliveredAreApproved = totalDelivered > 0 && approvedDelivered >= totalDelivered;
      const newPOStatus = (allKilosDelivered && allDeliveredAreApproved) ? "Completed" : "Pending";
      
      console.log(`Status check: All kilos delivered: ${allKilosDelivered}, All delivered are approved: ${allDeliveredAreApproved}`);
      console.log(`New remaining kilos: ${newRemainingKilos}kg, New status: ${newPOStatus}`);
      
      const statusChanged = newPOStatus !== relatedPO.status;
      const remainingChanged = Math.abs(newRemainingKilos - relatedPO.remainingKilos) > 0.01;
      
      if (statusChanged || remainingChanged) {
        console.log(`Updating PO - Status changed: ${statusChanged}, Remaining changed: ${remainingChanged}`);
        
        const updatePayload = { 
          status: newPOStatus, 
          remainingKilos: newRemainingKilos 
        };
        
        console.log(`Update payload:`, updatePayload);
        
        const res = await fetch(`${API_URL}/pos/${relatedPO.poNumber}`, { 
          method: "PUT", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(updatePayload) 
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Update failed:`, errorText);
          throw new Error(`Failed to update PO status: ${res.statusText} - ${errorText}`);
        }
        
        console.log(`PO updated successfully`);
        
        await fetchPOs();
        
        let message = `PO ${poNumber} remaining kilos updated to ${newRemainingKilos}kg`;
        if (statusChanged) {
          message += `. Status changed to ${newPOStatus}`;
        }
        
        console.log(`Success message: ${message}`);
        return message;
      } else {
        console.log(`No changes needed for PO ${poNumber}`);
      }
      
      return null;
    } catch (error: any) {
      console.error("Failed to update PO status:", error.message);
      console.error("Stack trace:", error.stack);
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
    const totalKilosNum = parseFloat(totalKilos);
    const amountNum = parseFloat(amount);
    if (isNaN(totalKilosNum) || isNaN(amountNum) || totalKilosNum <= 0 || amountNum <= 0) {
      showToast({ title: "Error", description: "Total Kilos and Amount must be positive numbers", variant: "destructive" });
      return;
    }
    try {
      const poData = { 
        poNumber, 
        date, 
        totalKilos: totalKilosNum, 
        amount: amountNum, 
        status: "Pending",
        remainingKilos: totalKilosNum
      };
      
      console.log("Creating PO with data:", poData);
      
      const res = await fetch(`${API_URL}/po`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(poData) 
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create PO: ${res.statusText}`);
      }
      
      await Promise.all([fetchPOs(), fetchTransactions(), fetchProduction()]);
      
      try {
        await logAction(
          currentUser,
          "Create PO",
          `Created PO ${poNumber} with ${totalKilosNum}kg for Rs${amountNum}`
        );
      } catch (error) {
        console.error("Failed to log create PO action:", error);
      }
      
      showToast({ title: "PO Created", description: `PO ${poNumber} created successfully` });
      setNewPO({ poNumber: "", date: "", totalKilos: "", amount: "" });
    } catch (error: any) { 
      console.error("PO creation failed:", error.message);
      showToast({ title: "Error", description: error.message, variant: "destructive" }); 
    }
  };

  // Get remaining kilos with better accuracy
  const getRemainingKilos = (po: PO) => {
    const deliveredForPO = transactions
      .filter(t => t.poNumber === po.poNumber && t.paymentStatus !== "Rejected")
      .reduce((sum, t) => sum + t.kilosDelivered, 0);
    return Math.max(po.totalKilos - deliveredForPO, 0);
  };

  // Display remaining kilos with discrepancy check
  const getDisplayRemainingKilos = (po: PO) => {
    const deliveredForPO = transactions
      .filter(t => t.poNumber === po.poNumber && t.paymentStatus !== "Rejected")
      .reduce((sum, t) => sum + t.kilosDelivered, 0);
    const computed = Math.max(po.totalKilos - deliveredForPO, 0);
    
    if (Math.abs(computed - po.remainingKilos) > 0.01) {
      console.warn(`Remaining kilos mismatch for PO ${po.poNumber}: DB shows ${po.remainingKilos}kg, computed ${computed}kg`);
    }
    
    return computed;
  };

  const getMaxDeliverable = (po: PO) => Math.min(getRemainingKilos(po), getAvailableStock());

  const calculateNumberOfBoxes = (kilos: number) => {
    if (isNaN(kilos) || kilos <= 0) return 0;
    return Math.ceil(kilos / 10);
  };

  const calculateExpirationDate = (date: string) => {
    if (!date) return "";
    const expDate = new Date(date);
    expDate.setFullYear(expDate.getFullYear() + 1);
    return expDate.toISOString().split("T")[0];
  };

  const handleAddDelivery = async (po: PO) => {
    if (po.status === "Completed") { 
      showToast({ title: "PO Completed", description: "Cannot add deliveries to a completed PO", variant: "destructive" }); 
      return; 
    }
    const { date = "", kilosDelivered = "", amount = "", productCode = "", batchCode = "", truckNo = "", dateOfExpiration = "", invoiceNo = "" } = deliveryForm[po.poNumber] || {};
    const kilos = parseFloat(kilosDelivered);
    const amt = parseFloat(amount);
    if (!date || !kilos || !amt || !productCode || !batchCode || !truckNo || !dateOfExpiration || !invoiceNo) { 
      showToast({ title: "Error", description: "Please fill all required fields (date, kilos, product code, batch number, truck number, expiration date, invoice number)", variant: "destructive" }); 
      return; 
    }
    if (isNaN(kilos) || isNaN(amt) || kilos <= 0 || amt <= 0) {
      showToast({ title: "Error", description: "Kilos Delivered and Amount must be positive numbers", variant: "destructive" });
      return;
    }
    if (kilos > getMaxDeliverable(po)) { 
      showToast({ title: "Error", description: `Exceeds max deliverable (${getMaxDeliverable(po)}kg) or available stock (${getAvailableStock()}kg)`, variant: "destructive" }); 
      return; 
    }
    try {
      const numberOfBoxes = calculateNumberOfBoxes(kilos);
      const transactionData = { 
        poId: po.id,
        poNumber: po.poNumber, 
        date, 
        kilosDelivered: kilos, 
        amount: amt, 
        paymentStatus: "Pending",
        numberOfBoxes,
        invoiceNo,
        dateOfExpiration,
        productCode,
        batchCode,
        truckNo
      };
      
      console.log("Adding delivery:", transactionData);
      
      const res = await fetch(`${API_URL}/primatransactions`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(transactionData) 
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add delivery: ${res.statusText} (${res.status})`);
      }
      const savedTransaction = await res.json();
      
      await Promise.all([fetchTransactions(), fetchPOs()]);
      
      try {
        await logAction(
          currentUser,
          "Add Delivery",
          `Added delivery of ${kilos}kg for PO ${po.poNumber} (Transaction ID: ${savedTransaction.id})`
        );
      } catch (error) {
        console.error("Failed to log add delivery action:", error);
      }
      
      setDeliveryForm(prev => ({ 
        ...prev, 
        [po.poNumber]: { 
          date: "", 
          kilosDelivered: "", 
          amount: "", 
          numberOfBoxes: "", 
          dateOfExpiration: "",
          invoiceNo: "",
          productCode: "",
          batchCode: "",
          truckNo: ""
        } 
      }));
      
      const statusMessage = await updatePOStatusBasedOnDeliveries(po.poNumber);
      const message = statusMessage 
        ? `${kilos}kg delivered for PO ${po.poNumber}. ${statusMessage}`
        : `${kilos}kg delivered for PO ${po.poNumber}`;
        
      showToast({ title: "Delivery Added", description: message });
    } catch (error: any) { 
      console.error("Delivery addition failed:", error.message);
      showToast({ title: "Error", description: `Failed to add delivery: ${error.message}`, variant: "destructive" }); 
    }
  };

  // -------------------- Invoice Navigation --------------------
  const handleGenerateInvoice = (transaction: PrimaTransaction) => {
    // Navigate to the separate invoice page, passing the transaction data via state
    // This includes date, dateOfExpiration, invoiceNo, poNumber, and other relevant fields
    navigate('/invoice', { 
      state: { 
        transaction: {
          date: transaction.date,
          dateOfExpiration: transaction.dateOfExpiration,
          invoiceNo: transaction.invoiceNo,
          poNumber: transaction.poNumber,
          // Include other fields if needed for the invoice, e.g., amount, kilosDelivered, etc.
          amount: transaction.amount,
          kilosDelivered: transaction.kilosDelivered,
          productCode: transaction.productCode,
          batchCode: transaction.batchCode,
          truckNo: transaction.truckNo,
          numberOfBoxes: transaction.numberOfBoxes,
        }
      } 
    });

    try {
      logAction(
        currentUser,
        "Generate Invoice",
        `Generated invoice for transaction ID: ${transaction.id} (PO ${transaction.poNumber})`
      );
    } catch (error) {
      console.error("Failed to log generate invoice action:", error);
    }

    showToast({ 
      title: "Success", 
      description: `Navigating to invoice for delivery ${transaction.id}` 
    });
  };

   // -------------------- Invoice Navigation --------------------
  const handleGenerateAnalysis = (transaction: PrimaTransaction) => {
    // Navigate to the separate invoice page, passing the transaction data via state
    // This includes date, dateOfExpiration, invoiceNo, poNumber, and other relevant fields
    navigate('/analysis', { 
      state: { 
        transaction: {
          date: transaction.date,
          dateOfExpiration: transaction.dateOfExpiration,
          invoiceNo: transaction.invoiceNo,
          poNumber: transaction.poNumber,
          // Include other fields if needed for the invoice, e.g., amount, kilosDelivered, etc.
          amount: transaction.amount,
          kilosDelivered: transaction.kilosDelivered,
          productCode: transaction.productCode,
          batchCode: transaction.batchCode,
          truckNo: transaction.truckNo,
          numberOfBoxes: transaction.numberOfBoxes,
        }
      } 
    });

    try {
      logAction(
        currentUser,
        "Generate Invoice",
        `Generated invoice for transaction ID: ${transaction.id} (PO ${transaction.poNumber})`
      );
    } catch (error) {
      console.error("Failed to log generate invoice action:", error);
    }

    showToast({ 
      title: "Success", 
      description: `Navigating to invoice for delivery ${transaction.id}` 
    });
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

  const calculateAmountForTransaction = (kilos: number, poNumber: string | null) => {
    if (!poNumber) return 0;
    const relatedPO = pos.find(po => po.poNumber === poNumber);
    if (!relatedPO) return 0;
    return (kilos / relatedPO.totalKilos) * relatedPO.amount;
  };

  const handleSaveEdit = async () => {
    const { type, data } = editModal;
    if (!data) return;

    if (type === "transaction") {
      if (!data.date || !data.kilosDelivered || !data.amount || !data.productCode || !data.batchCode || !data.truckNo || !data.dateOfExpiration || !data.invoiceNo) {
        showToast({ title: "Error", description: "All fields (date, kilos delivered, amount, product code, batch number, truck number, expiration date, invoice number) are required", variant: "destructive" });
        return;
      }
      if (typeof data.kilosDelivered !== "number" || isNaN(data.kilosDelivered) || data.kilosDelivered <= 0) {
        showToast({ title: "Error", description: "Kilos Delivered must be a positive number", variant: "destructive" });
        return;
      }
      if (typeof data.amount !== "number" || isNaN(data.amount) || data.amount <= 0) {
        showToast({ title: "Error", description: "Amount must be a positive number", variant: "destructive" });
        return;
      }
      if (data.numberOfBoxes != null && (typeof data.numberOfBoxes !== "number" || !Number.isInteger(data.numberOfBoxes) || data.numberOfBoxes < 0)) {
        showToast({ title: "Error", description: "Number of Boxes must be a non-negative integer or null", variant: "destructive" });
        return;
      }
    }

    try {
      let endpoint = "";
      let successMessage = "";
      let logMessage = "";
      
      switch (type) {
        case "po":
          endpoint = `${API_URL}/pos/${data.poNumber}`;
          successMessage = "PO updated successfully";
          logMessage = `Updated PO ${data.poNumber} (${data.totalKilos}kg, Rs${data.amount})`;
          break;
        case "transaction":
          endpoint = `${API_URL}/primatransactions/${data.id}`;
          successMessage = "Transaction updated successfully";
          logMessage = `Updated transaction ID: ${data.id} for PO ${data.poNumber} (${data.kilosDelivered}kg)`;
          break;
        case "production":
          endpoint = `${API_URL}/production/${data.id}`;
          successMessage = "Production record updated successfully";
          logMessage = `Updated production record ID: ${data.id} (${data.kilosIn}kg in, ${data.kilosOut}kg out, ${data.color})`;
          break;
      }

      console.log(`Updating ${type} via ${endpoint}`);

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          poId: data.poNumber ? pos.find(po => po.poNumber === data.poNumber)?.id : null,
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update record: ${res.statusText}`);
      }

      if (type === "po") {
        await fetchPOs();
      } else if (type === "transaction") {
        await fetchTransactions();
      } else if (type === "production") {
        await fetchProduction();
      }

      if (type === "transaction" && data.poNumber) {
        console.log(`Updating PO status after transaction edit`);
        const statusMessage = await updatePOStatusBasedOnDeliveries(data.poNumber);
        if (statusMessage) {
          successMessage += `. ${statusMessage}`;
        }
      }

      try {
        await logAction(currentUser, `Update ${type.charAt(0).toUpperCase() + type.slice(1)}`, logMessage);
      } catch (error) {
        console.error(`Failed to log update ${type} action:`, error);
      }

      showToast({ title: "Success", description: successMessage });
      setEditModal({ show: false, type: "po", data: null });
    } catch (error: any) {
      console.error("Edit failed:", error.message);
      showToast({ title: "Error", description: `Failed to update: ${error.message}`, variant: "destructive" });
    }
  };

  // -------------------- Delete Functions --------------------
  const confirmDelete = (id: number, type: "po" | "transaction" | "production", data?: any) => {
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
      let logMessage = "";
      
      switch (recordType) {
        case "po":
          endpoint = `${API_URL}/pos/${data.poNumber}`;
          successMessage = "PO deleted successfully";
          logMessage = `Deleted PO ${data.poNumber}`;
          break;
        case "transaction":
          endpoint = `${API_URL}/primatransactions/${id}`;
          successMessage = "Transaction deleted successfully";
          logMessage = `Deleted transaction ID: ${id} for PO ${data.poNumber}`;
          break;
        case "production":
          endpoint = `${API_URL}/production/${id}`;
          successMessage = "Production record deleted successfully";
          logMessage = `Deleted production record ID: ${id}`;
          break;
      }

      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete record: ${res.statusText}`);
      }

      if (recordType === "transaction" && data) {
        const statusMessage = await updatePOStatusBasedOnDeliveries(data.poNumber);
        if (statusMessage) {
          successMessage += `. ${statusMessage}`;
        }
      }

      if (recordType === "po") {
        await fetchPOs();
      } else if (recordType === "transaction") {
        await fetchTransactions();
      } else if (recordType === "production") {
        await fetchProduction();
      }

      try {
        await logAction(currentUser, `Delete ${recordType.charAt(0).toUpperCase() + recordType.slice(1)}`, logMessage);
      } catch (error) {
        console.error(`Failed to log delete ${recordType} action:`, error);
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
      console.log(`Updating transaction ${confirmModal.id} to ${confirmModal.status}`);
      
      const transactionRes = await fetch(`${API_URL}/primatransactions/${confirmModal.id}/status`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ paymentStatus: confirmModal.status }) 
      });
      if (!transactionRes.ok) {
        const errorData = await transactionRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update transaction status: ${transactionRes.statusText}`);
      }
      
      const updatedTransaction = await transactionRes.json();
      
      await fetchTransactions();
      
      try {
        await logAction(
          currentUser,
          "Update Transaction Status",
          `Marked transaction ID: ${confirmModal.id} for PO ${updatedTransaction.poNumber} as ${confirmModal.status}`
        );
      } catch (error) {
        console.error("Failed to log update transaction status action:", error);
      }
      
      const statusMessage = await updatePOStatusBasedOnDeliveries(updatedTransaction.poNumber);
      
      const message = statusMessage 
        ? `Transaction marked as ${confirmModal.status}. ${statusMessage}`
        : `Transaction marked as ${confirmModal.status}`;
        
      showToast({ title: "Status Updated", description: message });
    } catch (error: any) { 
      console.error("Status update failed:", error.message);
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

  const exportTransactions = async () => {
    const csvContent = [
      ["PO Number", "Date", "Kilos Delivered", "Number of Boxes", "Expiration Date", "Product Code", "Batch Code", "Truck No", "Amount", "Payment Status", "Invoice Number"],
      ...filteredTransactions.map(t => [
        t.poNumber || "", 
        t.date, 
        t.kilosDelivered, 
        t.numberOfBoxes != null ? t.numberOfBoxes : "", 
        t.dateOfExpiration || "", 
        t.productCode || "", 
        t.invoiceNo || "",
        t.batchCode || "", 
        t.truckNo || "", 
        t.amount, 
        t.paymentStatus
      ])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prima_transactions_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    try {
      await logAction(
        currentUser,
        "Export Transactions",
        `Exported ${filteredTransactions.length} transaction records`
      );
      showToast({ title: "Success", description: "Transactions exported successfully" });
    } catch (error) {
      console.error("Failed to log export transactions action:", error);
      showToast({
        title: "Warning",
        description: "Transactions exported, but failed to log action",
        variant: "default",
      });
    }
  };

  // -------------------- Invoice Generation Wrapper --------------------
  // const handleGenerateInvoice = async (transaction: PrimaTransaction) => {
  //   try {
  //     await generateInvoice(transaction, () => {
  //       try {
  //         logAction(
  //           currentUser,
  //           "Generate Invoice",
  //           `Generated invoice for transaction ID: ${transaction.id} (PO ${transaction.poNumber})`
  //         );
  //       } catch (error) {
  //         console.error("Failed to log generate invoice action:", error);
  //       }
  //       showToast({ 
  //         title: "Success", 
  //         description: `Invoice for delivery ${transaction.id} generated and downloaded.` 
  //       });
  //     });
  //   } catch (error) {
  //     console.error("Invoice generation failed:", error);
  //     showToast({
  //       title: "Error",
  //       description: "Failed to generate invoice",
  //       variant: "destructive",
  //     });
  //   }
  // };

  return (
    <div className="min-h-screen p-6 bg-slate-50 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${toast.variant === "destructive" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
          <h4 className="font-semibold">{toast.title}</h4>
          <p className="text-sm">{toast.description}</p>
        </div>
      )}

      <div className="bg-white/80 rounded-2xl p-6 shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Prima Transactions</h1>
        <Button
          className="ml-auto gap-2 border border-black/10 text-black"
          onClick={exportTransactions}
        >
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 grid-rows-2">
        <SummaryCard title="Total Delivered" value={`${totalDelivered}kg`} icon={Truck} description="All deliveries including paid, pending, and rejected" />
        <SummaryCard title="Total Revenue" value={`Rs${totalRevenue.toLocaleString()}`} icon={DollarSign} description="Expected revenue" />
        <SummaryCard title="Paid Amount" value={`Rs${paidAmount.toLocaleString()}`} icon={DollarSign} description="Cash received" />
        <SummaryCard title="Pending Approval" value={`Rs${pendingApproval.toLocaleString()}`} icon={Clock} description="Awaiting payment after approval" />
        <SummaryCard title="Rejected Powder" value={`${rejectedPowder}kg`} icon={X} description="Returned stock" />
        <SummaryCard title="Available Stock" value={`${availableStock.toFixed(2)}kg`} icon={Package} description="Usable stock" />
      </div>

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
              <Input type="number" min={1} step="0.01" value={newPO.totalKilos} onChange={e => setNewPO({ ...newPO, totalKilos: e.target.value })} required max={undefined} />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>Amount (Rs)</Label>
              <Input type="number" min={1} step="0.01" value={newPO.amount} onChange={e => setNewPO({ ...newPO, amount: e.target.value })} required max={undefined} />
              <Button type="submit" className="mt-2 flex items-center justify-center" onClick={handleCreatePO}>
                <Plus className="w-4 h-4 mr-2" />Create PO
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 bg-white/90 rounded-2xl shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <CardTitle>PO List</CardTitle>
            <div className="flex items-center gap-3">
              <Input 
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                placeholder="From"
                className="w-40"
                max={today} min={undefined} step={undefined}              />
              <Input 
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                placeholder="To"
                className="w-40"
                max={today} min={undefined} step={undefined}              />
              {(dateFrom || dateTo) && 
                <Button variant="outline" size="sm" onClick={resetDateFilter}>
                  Reset
                </Button>
              }
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="w-full border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 sticky top-0 z-10">
              <div className="grid grid-cols-8 gap-4 p-4 font-semibold text-sm">
                <div>PO Number</div>
                <div>Date</div>
                <div>Total Kilos</div>
                <div>Remaining Kilos</div>
                <div>Amount (Rs)</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
                <div className="text-right">Edit/Delete</div>
              </div>
            </div>
            <div>
              {filteredPOs.map(po => (
                <div key={po.id} className="grid grid-cols-8 gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-200">
                  <div className="font-medium">{po.poNumber}</div>
                  <div>{new Date(po.date).toLocaleDateString()}</div>
                  <div>{po.totalKilos}</div>
                  <div>{getDisplayRemainingKilos(po)}</div>
                  <div>Rs {po.amount.toLocaleString()}</div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${po.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {po.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <Button size="sm" className="gap-1" onClick={() => setSelectedPO(po)}>
                      <Eye className="w-4 h-4" /> View
                    </Button>
                  </div>
                  <div className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleEditPO(po)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => confirmDelete(po.id, "po", po)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPO && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Deliveries for PO {selectedPO.poNumber}</h2>
              <Button variant="outline" onClick={() => setSelectedPO(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {selectedPO.status === "Pending" && getRemainingKilos(selectedPO) > 0 && (
              <div className="mb-6 space-y-4">
                {availableStock < getRemainingKilos(selectedPO) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Package className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Limited Stock: Only {availableStock}kg available (PO needs {getRemainingKilos(selectedPO)}kg)
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <Label>Date</Label>
                      <Input 
                        type="date"
                        value={deliveryForm[selectedPO.poNumber]?.date || ""}
                        onChange={e => {
                          const newDate = e.target.value;
                          const newExpiration = calculateExpirationDate(newDate);
                          setDeliveryForm(prev => ({
                            ...prev,
                            [selectedPO.poNumber]: {
                              ...prev[selectedPO.poNumber],
                              date: newDate,
                              dateOfExpiration: newExpiration
                            }
                          }));
                        } }
                        required
                        max={today} min={undefined} step={undefined}                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Label>Expiration Date</Label>
                      <Input 
                        type="date"
                        value={deliveryForm[selectedPO.poNumber]?.dateOfExpiration || ""}
                        onChange={e => setDeliveryForm(prev => ({
                          ...prev,
                          [selectedPO.poNumber]: { ...prev[selectedPO.poNumber], dateOfExpiration: e.target.value }
                        }))}
                        required min={undefined} max={undefined} step={undefined}                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-1">
                      <Label>Kilos Delivered</Label>
                      <Input 
                        type="number" 
                        min={0.01}
                        max={getMaxDeliverable(selectedPO)} 
                        step="0.01"
                        placeholder={`Max ${getMaxDeliverable(selectedPO)}kg`} 
                        value={deliveryForm[selectedPO.poNumber]?.kilosDelivered || ""} 
                        onChange={e => {
                          const kilos = parseFloat(e.target.value) || 0;
                          const maxAllowed = getMaxDeliverable(selectedPO);
                          if (kilos <= maxAllowed) {
                            const amount = calculateAmountForTransaction(kilos, selectedPO.poNumber);
                            const numberOfBoxes = calculateNumberOfBoxes(kilos);
                            setDeliveryForm(prev => ({ 
                              ...prev, 
                              [selectedPO.poNumber]: { 
                                ...prev[selectedPO.poNumber], 
                                kilosDelivered: e.target.value, 
                                amount: amount.toFixed(2),
                                numberOfBoxes: numberOfBoxes.toString()
                              } 
                            }));
                          }
                        }} 
                        required
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Label>Number of Boxes</Label>
                      <Input 
                        readOnly
                        placeholder="Number of Boxes"
                        value={deliveryForm[selectedPO.poNumber]?.numberOfBoxes || ""}
                        className="bg-gray-100" onChange={undefined} min={undefined} max={undefined} step={undefined}                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Label>Amount (Rs)</Label>
                      <Input 
                        readOnly
                        placeholder="Amount (Rs)"
                        value={deliveryForm[selectedPO.poNumber]?.amount || ""}
                        className="bg-gray-100" onChange={undefined} min={undefined} max={undefined} step={undefined}                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col space-y-1">
                      <Label>Product Code</Label>
                      <Input 
                        value={deliveryForm[selectedPO.poNumber]?.productCode || ""}
                        onChange={e => setDeliveryForm(prev => ({
                          ...prev,
                          [selectedPO.poNumber]: { ...prev[selectedPO.poNumber], productCode: e.target.value }
                        }))}
                        required min={undefined} max={undefined} step={undefined}                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Label>Batch Code</Label>
                      <Input 
                        value={deliveryForm[selectedPO.poNumber]?.batchCode || ""}
                        onChange={e => setDeliveryForm(prev => ({
                          ...prev,
                          [selectedPO.poNumber]: { ...prev[selectedPO.poNumber], batchCode: e.target.value }
                        }))}
                        required min={undefined} max={undefined} step={undefined}                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Label>Truck Number</Label>
                      <Input 
                        value={deliveryForm[selectedPO.poNumber]?.truckNo || ""}
                        onChange={e => setDeliveryForm(prev => ({
                          ...prev,
                          [selectedPO.poNumber]: { ...prev[selectedPO.poNumber], truckNo: e.target.value }
                        }))}
                        required min={undefined} max={undefined} step={undefined}                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Label>Invoice Number</Label>
                      <Input 
                        value={deliveryForm[selectedPO.poNumber]?.invoiceNo || ""}
                        onChange={e => setDeliveryForm(prev => ({
                          ...prev,
                          [selectedPO.poNumber]: { ...prev[selectedPO.poNumber], invoiceNo: e.target.value }
                        }))}
                        required min={undefined} max={undefined} step={undefined}                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleAddDelivery(selectedPO)}
                      disabled={getMaxDeliverable(selectedPO) <= 0}
                    >
                      {getMaxDeliverable(selectedPO) <= 0 ? "No Stock" : "Add Delivery"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {transactions.filter(t => t.poNumber === selectedPO.poNumber).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No deliveries recorded for this PO yet</p>
                </div>
              ) : (
                transactions.filter(t => t.poNumber === selectedPO.poNumber).map(tx => (
                  <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                              <Truck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-slate-800">{tx.date}</h4>
                              <p className="text-sm text-slate-600">Delivery #{tx.id}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tx.paymentStatus === "Pending" ? "bg-yellow-100 text-yellow-700" : tx.paymentStatus === "Approved" ? "bg-blue-100 text-blue-700" : tx.paymentStatus === "Rejected" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {tx.paymentStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-slate-500 font-medium">Kilos Delivered</p>
                            <p className="text-slate-800 font-semibold">{tx.kilosDelivered}kg</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Number of Boxes</p>
                            <p className="text-slate-800 font-semibold">{tx.numberOfBoxes != null ? tx.numberOfBoxes : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Amount</p>
                            <p className="text-slate-800 font-semibold">Rs {tx.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Expiration Date</p>
                            <p className="text-slate-800 font-semibold">{tx.dateOfExpiration || "N/A"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 font-medium">Product Code</p>
                            <p className="text-slate-800 font-semibold">{tx.productCode || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Batch Code</p>
                            <p className="text-slate-800 font-semibold">{tx.batchCode || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Truck No</p>
                            <p className="text-slate-800 font-semibold">{tx.truckNo || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 font-medium">Invoice No</p>
                            <p className="text-slate-800 font-semibold">{tx.invoiceNo || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-48 flex-shrink-0">
                        <div className="flex flex-col gap-2">
                          {tx.paymentStatus === "Pending" && (
                            <>
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white w-full" onClick={() => confirmStatusUpdate(tx.id, "Approved")}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="w-full" onClick={() => confirmStatusUpdate(tx.id, "Rejected")}>
                                Reject
                              </Button>
                            </>
                          )}
                          {tx.paymentStatus === "Approved" && (
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white w-full" onClick={() => confirmStatusUpdate(tx.id, "Paid")}>
                              Mark Paid
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleGenerateInvoice(tx)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Invoice
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleGenerateAnalysis(tx)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Analysis
                          </Button>
                          <Button size="sm" variant="outline" className="w-full" onClick={() => handleEditTransaction(tx)}>
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" className="w-full" onClick={() => confirmDelete(tx.id, "transaction", tx)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
                    }))}
                    required min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={editModal.data.date}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, date: e.target.value }
                    }))}
                    required
                    max={today} min={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Total Kilos</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editModal.data.totalKilos}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, totalKilos: parseFloat(e.target.value) || 0 }
                    }))}
                    required
                    min={0} max={undefined}                  />
                </div>
                <div>
                  <Label>Amount (Rs)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editModal.data.amount}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, amount: parseFloat(e.target.value) || 0 }
                    }))}
                    required
                    min={0} max={undefined}                  />
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
                    value={editModal.data.poNumber || ""}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, poNumber: e.target.value || null }
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
                    }))}
                    required
                    max={today} min={undefined} step={undefined}                  />
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
                      const calculatedNumberOfBoxes = calculateNumberOfBoxes(kilos);
                      setEditModal(prev => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          kilosDelivered: kilos,
                          amount: parseFloat(calculatedAmount.toFixed(2)),
                          numberOfBoxes: calculatedNumberOfBoxes
                        }
                      }));
                    } }
                    required
                    min={0} max={undefined}                  />
                </div>
                <div>
                  <Label>Number of Boxes</Label>
                  <Input 
                    type="number"
                    value={editModal.data.numberOfBoxes != null ? editModal.data.numberOfBoxes : ""}
                    readOnly
                    className="bg-gray-100"
                    placeholder="Calculated as kilos / 10" onChange={undefined} min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Expiration Date</Label>
                  <Input 
                    type="date"
                    value={editModal.data.dateOfExpiration || ""}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, dateOfExpiration: e.target.value || null }
                    }))}
                    required min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Product Code</Label>
                  <Input 
                    value={editModal.data.productCode || ""}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, productCode: e.target.value || null }
                    }))}
                    required min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Batch Code</Label>
                  <Input 
                    value={editModal.data.batchCode || ""}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, batchCode: e.target.value || null }
                    }))}
                    required min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Invoice Number</Label>
                  <Input 
                    value={editModal.data.invoiceNo || ""}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, invoiceNo: e.target.value || null }
                    }))}
                    required min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Truck Number</Label>
                  <Input 
                    value={editModal.data.truckNo || ""}
                    onChange={e => setEditModal(prev => ({
                      ...prev,
                      data: { ...prev.data, truckNo: e.target.value || null }
                    }))}
                    required min={undefined} max={undefined} step={undefined}                  />
                </div>
                <div>
                  <Label>Amount (Rs)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editModal.data.amount}
                    readOnly
                    className="bg-gray-100"
                    placeholder="Calculated based on kilos and PO rate" onChange={undefined} min={undefined} max={undefined}                  />
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <p className="text-sm text-gray-500">Use status buttons to change payment status</p>
                  <Input 
                    value={editModal.data.paymentStatus}
                    readOnly
                    className="bg-gray-100" onChange={undefined} min={undefined} max={undefined} step={undefined}                  />
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
                    }))}
                    required
                    max={today} min={undefined} step={undefined}                  />
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
                    }))}
                    required
                    min={0} max={undefined}                  />
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
                    }))}
                    required
                    min={0} max={undefined}                  />
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
                    }))}
                    required
                    min={0} max={undefined}                  />
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