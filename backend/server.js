import express from "express";
import cors from "cors";

// =================== Controllers ===================
import { addPurchase, getPurchases, getSummary, updatePurchase, deletePurchase, markAsPaid  } from "./controllers/purchases.js";
import { addPettyCash, getPettyCash, getPettyCashSummary, updatePettyCash, deletePettyCash } from "./controllers/pettycash.js";
import { addExpense, getExpenses, getExpensesSummary, updateExpense, deleteExpense } from "./controllers/expenses.js";
import { 
  addProduction, 
  getProduction, 
  getProductionSummary, 
  getProductionByDateRange, 
  updateProduction, 
  deleteProduction 
} from "./controllers/production.js";
import { addPO, getPOs, updatePO, getPOByNumber, deletePO } from "./controllers/po.js";
import { 
  addPrimaTransaction, 
  getPrimaTransactions, 
  updatePrimaTransactionStatus, 
  updatePrimaTransaction, 
  deletePrimaTransaction 
} from "./controllers/primatransactions.js";
import { 
  getEmployees, 
  addEmployees, 
  markSalaryPaid, 
  resetSalaryStatus, 
  updateEmployee, 
  deleteEmployee 
} from "./controllers/employees.js";
import { getStock, getStockHistory, addStock, updateStock, deleteStock } from "./controllers/stock.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/* =================== Purchases Routes =================== */
app.get("/purchases", (req, res) => {
  getPurchases((err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.post("/purchases", (req, res) => {
  addPurchase(req.body, (err, result) => err ? res.status(500).json({ error: err.message }) : res.status(201).json(result));
});

app.put("/purchases/:id", (req, res) => {
  updatePurchase(req.params.id, req.body, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.delete("/purchases/:id", (req, res) => {
  deletePurchase(req.params.id, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.get("/summary", (req, res) => {
  getSummary((err, summary) => err ? res.status(500).json({ error: err.message }) : res.json(summary));
});

/* =================== Petty Cash Routes =================== */
app.get("/pettycash", (req, res) => {
  getPettyCash((err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.post("/pettycash", (req, res) => {
  addPettyCash(req.body, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

app.put("/pettycash/:id", (req, res) => {
  updatePettyCash(req.params.id, req.body, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.delete("/pettycash/:id", (req, res) => {
  deletePettyCash(req.params.id, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.get("/pettycash/summary", (req, res) => {
  getPettyCashSummary((err, summary) => err ? res.status(500).json({ error: err.message }) : res.json(summary));
});

/* =================== Expenses Routes =================== */
app.get("/expenses", (req, res) => {
  getExpenses((err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.post("/expenses", (req, res) => {
  addExpense(req.body, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

app.put("/expenses/:id", (req, res) => {
  updateExpense(req.params.id, req.body, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.delete("/expenses/:id", (req, res) => {
  deleteExpense(req.params.id, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.get("/expenses/summary", (req, res) => {
  getExpensesSummary((err, summary) => err ? res.status(500).json({ error: err.message }) : res.json(summary));
});

/* =================== Production Routes =================== */
app.get("/production", (req, res) => {
  getProduction((err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.get("/production/summary", (req, res) => {
  getProductionSummary((err, summary) => err ? res.status(500).json({ error: err.message }) : res.json(summary));
});

app.post("/production", (req, res) => {
  addProduction(req.body, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

app.get("/production/range", (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) return res.status(400).json({ error: "startDate and endDate are required" });

  getProductionByDateRange(startDate, endDate, (err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.put("/production/:id", (req, res) => {
  updateProduction(req.params.id, req.body, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

app.delete("/production/:id", (req, res) => {
  deleteProduction(req.params.id, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

/* =================== Prima Transactions Routes =================== */
app.get("/primatransactions", (req, res) => {
  getPrimaTransactions((err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.post("/primatransactions", (req, res) => {
  addPrimaTransaction(req.body, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

app.put("/primatransactions/:id", (req, res) => {
  updatePrimaTransaction(req.params.id, req.body, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.put("/primatransactions/:id/status", (req, res) => {
  const { paymentStatus } = req.body;
  if (!paymentStatus) return res.status(400).json({ error: "paymentStatus is required" });

  updatePrimaTransactionStatus(req.params.id, paymentStatus, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.delete("/primatransactions/:id", (req, res) => {
  deletePrimaTransaction(req.params.id, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

/* =================== Employees Routes =================== */
app.get("/employees", (req, res) => {
  getEmployees((err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.post("/employees", (req, res) => {
  addEmployees(req.body, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.put("/employees/:id", (req, res) => {
  updateEmployee(req.params.id, req.body, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.put("/employees/:id/pay", (req, res) => {
  markSalaryPaid(req.params.id, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.put("/employees/:id/reset", (req, res) => {
  resetSalaryStatus(req.params.id, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.delete("/employees/:id", (req, res) => {
  deleteEmployee(req.params.id, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

/* =================== Stock Routes =================== */
app.get("/stock", (req, res) => {
  getStock((err, stock) => err ? res.status(500).json({ error: err.message }) : res.json(stock));
});

app.get("/stock/history", (req, res) => {
  getStockHistory((err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.post("/stock", (req, res) => {
  addStock(req.body, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.put("/stock/:id", (req, res) => {
  updateStock(req.params.id, req.body, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

app.delete("/stock/:id", (req, res) => {
  deleteStock(req.params.id, (err, result) => err ? res.status(400).json({ error: err.message }) : res.json(result));
});

/* =================== Purchase Orders =================== */
app.post("/pos", (req, res) => {
  addPO(req.body, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

app.get("/pos", (req, res) => {
  getPOs((err, rows) => err ? res.status(500).json({ error: err.message }) : res.json(rows));
});

app.get("/pos/:poNumber", (req, res) => {
  getPOByNumber(req.params.poNumber, (err, po) => err ? res.status(500).json({ error: err.message }) : res.json(po));
});

app.put("/pos/:poNumber", (req, res) => {
  updatePO(req.params.poNumber, req.body, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

app.delete("/pos/:poNumber", (req, res) => {
  deletePO(req.params.poNumber, (err, result) => err ? res.status(500).json({ error: err.message }) : res.json(result));
});

app.put("/purchases/:id/pay", (req, res) => {
  const { id } = req.params;
  markAsPaid(id, (err, updatedPurchase) => {
    if (err) return res.status(500).json({ error: "Failed to mark as paid" });
    res.json(updatedPurchase);
  });
});

/* =================== Start Server =================== */
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
