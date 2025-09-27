import express from "express";
import cors from "cors";
import path from "path";
import { initializeTables } from "./db.js"; // Import initializeTables from db.js

// =================== Controllers ===================
import { 
  addPurchase, getPurchases, getSummary, updatePurchase, deletePurchase, markAsPaid 
} from "./controllers/purchases.js";

import { 
  addPettyCash, getPettyCash, getPettyCashSummary, updatePettyCash, deletePettyCash 
} from "./controllers/pettycash.js";

import { 
  addExpense, getExpenses, getExpensesSummary, updateExpense, deleteExpense 
} from "./controllers/expenses.js";

import { 
  addProduction, getProduction, getProductionSummary, getProductionByDateRange, 
  updateProduction, deleteProduction 
} from "./controllers/production.js";

import { addPO, getPOs, updatePO, getPOByNumber, deletePO } from "./controllers/po.js";

import { addPrimaTransaction, getPrimaTransactions, updatePrimaTransaction, updatePrimaTransactionStatus, deletePrimaTransaction, getPrimaTransactionsSummary, getPrimaTransactionsByDateRange } from "./controllers/primatransactions.js";


import { 
  getEmployees, addEmployee, markSalaryPaid, resetSalaryStatus, 
  updateEmployee, deleteEmployee 
} from "./controllers/employees.js";

import { getStock, getStockHistory, addStock, updateStock, deleteStock } from "./controllers/stock.js";

const app = express();
const PORT = process.env.PORT || 5000;

// =================== Middleware ===================
app.use(cors());
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =================== Helper for async handlers ===================
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(error => {
    console.error(`Error in ${req.method} ${req.url}:`, error.message);
    next(error);
  });
};

// =================== Initialize Database ===================
const startServer = async () => {
  try {
    await initializeTables(); // Ensure tables are created before starting server
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error.message);
    process.exit(1); // Exit if database initialization fails
  }

  // =================== Root Route ===================
  app.get("/", (req, res) => {
    res.send("✅ Backend server is running!");
  });

  // =================== Purchases Routes ===================
  app.get("/purchases", asyncHandler(async (req, res) => {
    const rows = await getPurchases();
    res.json(rows);
  }));

  app.post("/purchases", asyncHandler(async (req, res) => {
    const result = await addPurchase(req.body);
    res.status(201).json(result);
  }));

  app.put("/purchases/:id", asyncHandler(async (req, res) => {
    const result = await updatePurchase(req.params.id, req.body);
    res.json(result);
  }));

  app.delete("/purchases/:id", asyncHandler(async (req, res) => {
    const result = await deletePurchase(req.params.id);
    res.json(result);
  }));

  app.get("/summary", asyncHandler(async (req, res) => {
    const summary = await getSummary();
    res.json(summary);
  }));

  app.put("/purchases/:id/pay", asyncHandler(async (req, res) => {
    const updatedPurchase = await markAsPaid(req.params.id);
    res.json(updatedPurchase);
  }));

  // =================== Petty Cash Routes ===================
  app.get("/pettycash", asyncHandler(async (req, res) => {
    const rows = await getPettyCash();
    res.json(rows);
  }));

  app.post("/pettycash", asyncHandler(async (req, res) => {
    const result = await addPettyCash(req.body);
    res.status(201).json(result);
  }));

  app.put("/pettycash/:id", asyncHandler(async (req, res) => {
    const result = await updatePettyCash(req.params.id, req.body);
    res.json(result);
  }));

  app.delete("/pettycash/:id", asyncHandler(async (req, res) => {
    const result = await deletePettyCash(req.params.id);
    res.json(result);
  }));

  app.get("/pettycash/summary", asyncHandler(async (req, res) => {
    const summary = await getPettyCashSummary();
    res.json(summary);
  }));

  // =================== Expenses Routes ===================
  app.get("/expenses", asyncHandler(async (req, res) => {
    const rows = await getExpenses();
    res.json(rows);
  }));

  app.post("/expenses", asyncHandler(async (req, res) => {
    const result = await addExpense(req.body);
    res.status(201).json(result);
  }));

  app.put("/expenses/:id", asyncHandler(async (req, res) => {
    const result = await updateExpense(req.params.id, req.body);
    res.json(result);
  }));

  app.delete("/expenses/:id", asyncHandler(async (req, res) => {
    const result = await deleteExpense(req.params.id);
    res.json(result);
  }));

  app.get("/expenses/summary", asyncHandler(async (req, res) => {
    const summary = await getExpensesSummary();
    res.json(summary);
  }));

  // =================== Production Routes ===================
  app.get("/production", asyncHandler(async (req, res) => {
    const rows = await getProduction();
    res.json(rows);
  }));

  app.get("/production/summary", asyncHandler(async (req, res) => {
    const summary = await getProductionSummary();
    res.json(summary);
  }));

  app.post("/production", asyncHandler(async (req, res) => {
    const result = await addProduction(req.body);
    res.status(201).json(result);
  }));

  app.get("/production/range", asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }
    const rows = await getProductionByDateRange(startDate, endDate);
    res.json(rows);
  }));

  app.put("/production/:id", asyncHandler(async (req, res) => {
    const result = await updateProduction(req.params.id, req.body);
    res.json(result);
  }));

  app.delete("/production/:id", asyncHandler(async (req, res) => {
    const result = await deleteProduction(req.params.id);
    res.json(result);
  }));

  // Prima Transaction Routes
app.get("/primatransactions", async (req, res) => {
  try {
    const transactions = await getPrimaTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message, path: req.path, method: req.method, timestamp: new Date().toISOString() });
  }
});

app.post("/primatransactions", async (req, res) => {
  try {
    const transaction = await addPrimaTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message, path: req.path, method: req.method, timestamp: new Date().toISOString() });
  }
});

app.put("/primatransactions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new Error("Invalid transaction ID");
    const transaction = await updatePrimaTransaction(id, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message, path: req.path, method: req.method, timestamp: new Date().toISOString() });
  }
});

app.put("/primatransactions/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new Error("Invalid transaction ID");
    const { paymentStatus } = req.body;
    const transaction = await updatePrimaTransactionStatus(id, paymentStatus);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message, path: req.path, method: req.method, timestamp: new Date().toISOString() });
  }
});

app.delete("/primatransactions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new Error("Invalid transaction ID");
    const result = await deletePrimaTransaction(id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message, path: req.path, method: req.method, timestamp: new Date().toISOString() });
  }
});

// Add routes for getPrimaTransactionsSummary and getPrimaTransactionsByDateRange if needed
app.get("/primatransactions/summary", async (req, res) => {
  try {
    const summary = await getPrimaTransactionsSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message, path: req.path, method: req.method, timestamp: new Date().toISOString() });
  }
});

app.get("/primatransactions/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new Error("startDate and endDate are required");
    }
    const transactions = await getPrimaTransactionsByDateRange(startDate, endDate);
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message, path: req.path, method: req.method, timestamp: new Date().toISOString() });
  }
});


  // =================== Employees Routes ===================
  app.get("/employees", asyncHandler(async (req, res) => {
    const rows = await getEmployees();
    res.json(rows);
  }));

  app.post("/employees", asyncHandler(async (req, res) => {
    const result = await addEmployee(req.body);
    res.status(201).json(result);
  }));

  app.put("/employees/:id", asyncHandler(async (req, res) => {
    const result = await updateEmployee(req.params.id, req.body);
    res.json(result);
  }));

  app.put("/employees/:id/pay", asyncHandler(async (req, res) => {
    const result = await markSalaryPaid(req.params.id);
    res.json(result);
  }));

  app.put("/employees/:id/reset", asyncHandler(async (req, res) => {
    const result = await resetSalaryStatus(req.params.id);
    res.json(result);
  }));

  app.delete("/employees/:id", asyncHandler(async (req, res) => {
    const result = await deleteEmployee(req.params.id);
    res.json(result);
  }));

  // =================== Stock Routes ===================
  app.get("/stock", asyncHandler(async (req, res) => {
    const stock = await getStock();
    res.json(stock);
  }));

  app.get("/stock/history", asyncHandler(async (req, res) => {
    const rows = await getStockHistory();
    res.json(rows);
  }));

  app.post("/stock", asyncHandler(async (req, res) => {
    const result = await addStock(req.body);
    res.status(201).json(result);
  }));

  app.put("/stock/:id", asyncHandler(async (req, res) => {
    const result = await updateStock(req.params.id, req.body);
    res.json(result);
  }));

  app.delete("/stock/:id", asyncHandler(async (req, res) => {
    const result = await deleteStock(req.params.id);
    res.json(result);
  }));

  // =================== Purchase Orders Routes ===================
  app.post("/po", asyncHandler(async (req, res) => {
    const result = await addPO(req.body);
    res.status(201).json(result);
  }));

  app.get("/pos", asyncHandler(async (req, res) => {
    const rows = await getPOs();
    res.json(rows);
  }));

  app.get("/pos/:poNumber", asyncHandler(async (req, res) => {
    const po = await getPOByNumber(req.params.poNumber);
    if (!po) {
      return res.status(404).json({ error: `PO ${req.params.poNumber} not found` });
    }
    res.json(po);
  }));

  app.put("/pos/:poNumber", asyncHandler(async (req, res) => {
    const result = await updatePO(req.params.poNumber, req.body);
    res.json(result);
  }));

  app.delete("/pos/:poNumber", asyncHandler(async (req, res) => {
    const result = await deletePO(req.params.poNumber);
    res.json(result);
  }));

  // =================== Global Error Handler ===================
  app.use((error, req, res, next) => {
    console.error(`[ERROR ${new Date().toISOString()}] ${req.method} ${req.url}:`, error.stack);
    res.status(error.status || 500).json({
      error: error.message || "Internal Server Error",
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  });

  // =================== Start Server ===================
  app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
  });
};

// Start the server with database initialization
startServer();