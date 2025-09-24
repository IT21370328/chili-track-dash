import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import fs from "fs";

// =================== Controllers ===================
import { addPurchase, getPurchases, getSummary, updatePurchase, deletePurchase } from "./controllers/purchases.js";
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
  addEmployee, 
  markSalaryPaid, 
  resetSalaryStatus, 
  updateEmployee, 
  deleteEmployee 
} from "./controllers/employees.js";
import { getStock, getStockHistory, addStock, updateStock, deleteStock } from "./controllers/stock.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
let mainWindow;
const PORT = 5000;

// =================== Backend Server ===================
function startBackendServer() {
  const expressApp = express();

  expressApp.use(cors());
  expressApp.use(express.json());

  // Serve frontend build
  const distPath = path.join(__dirname, "../dist");
  if (fs.existsSync(distPath)) {
    expressApp.use(express.static(distPath));
    console.log(`Serving frontend from: ${distPath}`);
  } else {
    console.error("dist folder not found at:", distPath);
  }

  // =================== Purchases Routes ===================
  expressApp.get("/purchases", (req, res) => {
    getPurchases((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.post("/purchases", (req, res) => {
    console.log("Adding purchase:", req.body);
    addPurchase(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(result);
    });
  });

  expressApp.put("/purchases/:id", (req, res) => {
    console.log(`Updating purchase ${req.params.id}:`, req.body);
    updatePurchase(req.params.id, req.body, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.delete("/purchases/:id", (req, res) => {
    console.log(`Deleting purchase ${req.params.id}`);
    deletePurchase(req.params.id, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.get("/summary", (req, res) => {
    getSummary((err, summary) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(summary);
    });
  });

  // =================== Petty Cash Routes ===================
  expressApp.get("/pettycash", (req, res) => {
    getPettyCash((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.post("/pettycash", (req, res) => {
    console.log("Adding petty cash:", req.body);
    addPettyCash(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.put("/pettycash/:id", (req, res) => {
    console.log(`Updating petty cash ${req.params.id}:`, req.body);
    updatePettyCash(req.params.id, req.body, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.delete("/pettycash/:id", (req, res) => {
    console.log(`Deleting petty cash ${req.params.id}`);
    deletePettyCash(req.params.id, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.get("/pettycash/summary", (req, res) => {
    getPettyCashSummary((err, summary) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(summary);
    });
  });

  // =================== Expenses Routes ===================
  expressApp.get("/expenses", (req, res) => {
    getExpenses((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.post("/expenses", (req, res) => {
    console.log("Adding expense:", req.body);
    addExpense(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.put("/expenses/:id", (req, res) => {
    console.log(`Updating expense ${req.params.id}:`, req.body);
    updateExpense(req.params.id, req.body, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.delete("/expenses/:id", (req, res) => {
    console.log(`Deleting expense ${req.params.id}`);
    deleteExpense(req.params.id, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.get("/expenses/summary", (req, res) => {
    getExpensesSummary((err, summary) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(summary);
    });
  });

  // =================== Production Routes ===================
  expressApp.get("/production", (req, res) => {
    getProduction((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.get("/production/summary", (req, res) => {
    getProductionSummary((err, summary) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(summary);
    });
  });

  expressApp.post("/production", (req, res) => {
    console.log("Adding production record:", req.body);
    addProduction(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.get("/production/range", (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    getProductionByDateRange(startDate, endDate, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.put("/production/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Updating production record ${id}:`, req.body);
    updateProduction(id, req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.delete("/production/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Deleting production record ${id}`);
    deleteProduction(id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  // =================== Prima Transactions Routes ===================
  expressApp.get("/primatransactions", (req, res) => {
    getPrimaTransactions((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.post("/primatransactions", (req, res) => {
    console.log("Adding prima transaction:", req.body);
    addPrimaTransaction(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.put("/primatransactions/:id", (req, res) => {
    console.log(`Updating prima transaction ${req.params.id}:`, req.body);
    updatePrimaTransaction(req.params.id, req.body, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.put("/primatransactions/:id/status", (req, res) => {
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
      return res.status(400).json({ error: "paymentStatus is required" });
    }

    console.log(`Updating prima transaction ${req.params.id} status to:`, paymentStatus);
    updatePrimaTransactionStatus(req.params.id, paymentStatus, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.delete("/primatransactions/:id", (req, res) => {
    console.log(`Deleting prima transaction ${req.params.id}`);
    deletePrimaTransaction(req.params.id, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  // =================== Employees Routes ===================
  expressApp.get("/employees", (req, res) => {
    getEmployees((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.post("/employees", (req, res) => {
    console.log("Adding employee:", req.body);
    addEmployee(req.body, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.put("/employees/:id", (req, res) => {
    console.log(`Updating employee ${req.params.id}:`, req.body);
    updateEmployee(req.params.id, req.body, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.put("/employees/:id/pay", (req, res) => {
    console.log(`Marking salary paid for employee ${req.params.id}`);
    markSalaryPaid(req.params.id, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.put("/employees/:id/reset", (req, res) => {
    console.log(`Resetting salary status for employee ${req.params.id}`);
    resetSalaryStatus(req.params.id, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.delete("/employees/:id", (req, res) => {
    console.log(`Deleting employee ${req.params.id}`);
    deleteEmployee(req.params.id, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  // =================== Stock Routes ===================
  expressApp.get("/stock", (req, res) => {
    getStock((err, stock) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(stock);
    });
  });

  expressApp.get("/stock/history", (req, res) => {
    getStockHistory((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.post("/stock", (req, res) => {
    console.log("Adding stock:", req.body);
    addStock(req.body, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.put("/stock/:id", (req, res) => {
    console.log(`Updating stock ${req.params.id}:`, req.body);
    updateStock(req.params.id, req.body, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.delete("/stock/:id", (req, res) => {
    console.log(`Deleting stock ${req.params.id}`);
    deleteStock(req.params.id, (err, result) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(result);
    });
  });

  // =================== Purchase Orders Routes ===================
  expressApp.post("/pos", (req, res) => {
    console.log("Adding PO:", req.body);
    addPO(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.get("/pos", (req, res) => {
    getPOs((err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  expressApp.get("/pos/:poNumber", (req, res) => {
    getPOByNumber(req.params.poNumber, (err, po) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(po);
    });
  });

  expressApp.put("/pos/:poNumber", (req, res) => {
    console.log(`Updating PO ${req.params.poNumber}:`, req.body);
    updatePO(req.params.poNumber, req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  expressApp.delete("/pos/:poNumber", (req, res) => {
    console.log(`Deleting PO ${req.params.poNumber}`);
    deletePO(req.params.poNumber, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });

  // Health check
  expressApp.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Backend server is running", port: PORT });
  });

  // SPA fallback
  expressApp.get("*", (req, res) => {
    const indexPath = path.join(__dirname, "../dist/index.html");
    if (fs.existsSync(indexPath)) {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Frontend build not found. Please build your React app first.");
    }
  });

  return new Promise((resolve, reject) => {
    server = expressApp.listen(PORT, (err) => {
      if (err) {
        console.error("Failed to start backend server:", err);
        reject(err);
      } else {
        console.log(`🚀 Backend server running on http://localhost:${PORT}`);
        console.log(`📁 Frontend served from: ${distPath}`);
        console.log(`🔗 API endpoints available at: http://localhost:${PORT}/`);
        resolve(server);
      }
    });
  });
}

// =================== Electron Window ===================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
    titleBarStyle: "default",
    icon: path.join(__dirname, "assets/icon.png"),
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    console.log("🖥️  Electron window ready");
  });

  const appURL = `http://localhost:${PORT}`;
  console.log(`🔄 Loading app from: ${appURL}`);

  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.loadURL(appURL).catch((err) => {
      console.error("Failed to load app:", err);
      mainWindow.loadURL(
        'data:text/html,<h1>Error: Could not load application</h1><p>Please ensure your React app is built and the backend server is running.</p>'
      );
    });
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
}

// =================== App Lifecycle ===================
app.whenReady().then(async () => {
  try {
    console.log("🚀 Starting Electron app...");

    await startBackendServer();
    console.log("✅ Backend server started successfully");

    createWindow();
    console.log("✅ Electron window created");
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  console.log("🔄 All windows closed");
  if (server) server.close(() => console.log("✅ Backend server stopped"));
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("before-quit", () => {
  console.log("🔄 App shutting down...");
  if (server) server.close();
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// =================== IPC Handlers ===================

// =================== Purchases ===================
ipcMain.handle("add-purchase", (event, purchase) =>
  new Promise((resolve, reject) => {
    addPurchase(purchase, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-purchases", () =>
  new Promise((resolve, reject) => {
    getPurchases((err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("update-purchase", (event, id, purchase) =>
  new Promise((resolve, reject) => {
    updatePurchase(id, purchase, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("delete-purchase", (event, id) =>
  new Promise((resolve, reject) => {
    deletePurchase(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-summary", () =>
  new Promise((resolve, reject) => {
    getSummary((err, summary) => (err ? reject(err) : resolve(summary)));
  })
);

// =================== Petty Cash ===================
ipcMain.handle("add-pettycash", (event, pettycash) =>
  new Promise((resolve, reject) => {
    addPettyCash(pettycash, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-pettycash", () =>
  new Promise((resolve, reject) => {
    getPettyCash((err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("update-pettycash", (event, id, pettycash) =>
  new Promise((resolve, reject) => {
    updatePettyCash(id, pettycash, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("delete-pettycash", (event, id) =>
  new Promise((resolve, reject) => {
    deletePettyCash(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-pettycash-summary", () =>
  new Promise((resolve, reject) => {
    getPettyCashSummary((err, summary) => (err ? reject(err) : resolve(summary)));
  })
);

// =================== Expenses ===================
ipcMain.handle("add-expense", (event, expense) =>
  new Promise((resolve, reject) => {
    addExpense(expense, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-expenses", () =>
  new Promise((resolve, reject) => {
    getExpenses((err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("update-expense", (event, id, expense) =>
  new Promise((resolve, reject) => {
    updateExpense(id, expense, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("delete-expense", (event, id) =>
  new Promise((resolve, reject) => {
    deleteExpense(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-expenses-summary", () =>
  new Promise((resolve, reject) => {
    getExpensesSummary((err, summary) => (err ? reject(err) : resolve(summary)));
  })
);

// =================== Production ===================
ipcMain.handle("add-production", (event, production) =>
  new Promise((resolve, reject) => {
    addProduction(production, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-production", () =>
  new Promise((resolve, reject) => {
    getProduction((err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("get-production-by-range", (event, startDate, endDate) =>
  new Promise((resolve, reject) => {
    getProductionByDateRange(startDate, endDate, (err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("update-production", (event, id, production) =>
  new Promise((resolve, reject) => {
    updateProduction(id, production, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("delete-production", (event, id) =>
  new Promise((resolve, reject) => {
    deleteProduction(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-production-summary", () =>
  new Promise((resolve, reject) => {
    getProductionSummary((err, summary) => (err ? reject(err) : resolve(summary)));
  })
);

// =================== Prima Transactions ===================
ipcMain.handle("add-prima-transaction", (event, transaction) =>
  new Promise((resolve, reject) => {
    addPrimaTransaction(transaction, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-prima-transactions", () =>
  new Promise((resolve, reject) => {
    getPrimaTransactions((err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("update-prima-transaction", (event, id, transaction) =>
  new Promise((resolve, reject) => {
    updatePrimaTransaction(id, transaction, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("update-prima-transaction-status", (event, id, paymentStatus) =>
  new Promise((resolve, reject) => {
    updatePrimaTransactionStatus(id, paymentStatus, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("delete-prima-transaction", (event, id) =>
  new Promise((resolve, reject) => {
    deletePrimaTransaction(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

// =================== Employees ===================
ipcMain.handle("get-employees", () =>
  new Promise((resolve, reject) => {
    getEmployees((err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("add-employee", (event, employee) =>
  new Promise((resolve, reject) => {
    addEmployee(employee, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("update-employee", (event, id, employee) =>
  new Promise((resolve, reject) => {
    updateEmployee(id, employee, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("mark-salary-paid", (event, id) =>
  new Promise((resolve, reject) => {
    markSalaryPaid(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("reset-salary-status", (event, id) =>
  new Promise((resolve, reject) => {
    resetSalaryStatus(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("delete-employee", (event, id) =>
  new Promise((resolve, reject) => {
    deleteEmployee(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

// =================== Stock ===================
ipcMain.handle("get-stock", () =>
  new Promise((resolve, reject) => {
    getStock((err, stock) => (err ? reject(err) : resolve(stock)));
  })
);

ipcMain.handle("get-stock-history", () =>
  new Promise((resolve, reject) => {
    getStockHistory((err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("add-stock", (event, stock) =>
  new Promise((resolve, reject) => {
    addStock(stock, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("update-stock", (event, id, stock) =>
  new Promise((resolve, reject) => {
    updateStock(id, stock, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("delete-stock", (event, id) =>
  new Promise((resolve, reject) => {
    deleteStock(id, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

// =================== Purchase Orders ===================
ipcMain.handle("add-po", (event, po) =>
  new Promise((resolve, reject) => {
    addPO(po, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("get-pos", () =>
  new Promise((resolve, reject) => {
    getPOs((err, rows) => (err ? reject(err) : resolve(rows)));
  })
);

ipcMain.handle("get-po-by-number", (event, poNumber) =>
  new Promise((resolve, reject) => {
    getPOByNumber(poNumber, (err, po) => (err ? reject(err) : resolve(po)));
  })
);

ipcMain.handle("update-po", (event, poNumber, po) =>
  new Promise((resolve, reject) => {
    updatePO(poNumber, po, (err, result) => (err ? reject(err) : resolve(result)));
  })
);

ipcMain.handle("delete-po", (event, poNumber) =>
  new Promise((resolve, reject) => {
    deletePO(poNumber, (err, result) => (err ? reject(err) : resolve(result)));
  })
);