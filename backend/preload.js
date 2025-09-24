import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  // =================== Purchases ===================
  addPurchase: (purchase) => ipcRenderer.invoke("add-purchase", purchase),
  getPurchases: () => ipcRenderer.invoke("get-purchases"),
  updatePurchase: (id, purchase) => ipcRenderer.invoke("update-purchase", id, purchase),
  deletePurchase: (id) => ipcRenderer.invoke("delete-purchase", id),
  getSummary: () => ipcRenderer.invoke("get-summary"),

  // =================== Petty Cash ===================
  addPettyCash: (pc) => ipcRenderer.invoke("add-pettycash", pc),
  getPettyCash: () => ipcRenderer.invoke("get-pettycash"),
  updatePettyCash: (id, pc) => ipcRenderer.invoke("update-pettycash", id, pc),
  deletePettyCash: (id) => ipcRenderer.invoke("delete-pettycash", id),
  getPettyCashSummary: () => ipcRenderer.invoke("get-pettycash-summary"),

  // =================== Expenses ===================
  addExpense: (expense) => ipcRenderer.invoke("add-expense", expense),
  getExpenses: () => ipcRenderer.invoke("get-expenses"),
  updateExpense: (id, expense) => ipcRenderer.invoke("update-expense", id, expense),
  deleteExpense: (id) => ipcRenderer.invoke("delete-expense", id),
  getExpensesSummary: () => ipcRenderer.invoke("get-expenses-summary"),

  // =================== Production ===================
  addProduction: (production) => ipcRenderer.invoke("add-production", production),
  getProduction: () => ipcRenderer.invoke("get-production"),
  getProductionByRange: (startDate, endDate) => ipcRenderer.invoke("get-production-by-range", startDate, endDate),
  updateProduction: (id, production) => ipcRenderer.invoke("update-production", id, production),
  deleteProduction: (id) => ipcRenderer.invoke("delete-production", id),
  getProductionSummary: () => ipcRenderer.invoke("get-production-summary"),

  // =================== Prima Transactions ===================
  addPrimaTransaction: (transaction) => ipcRenderer.invoke("add-prima-transaction", transaction),
  getPrimaTransactions: () => ipcRenderer.invoke("get-prima-transactions"),
  updatePrimaTransaction: (id, transaction) => ipcRenderer.invoke("update-prima-transaction", id, transaction),
  updatePrimaTransactionStatus: (id, paymentStatus) => ipcRenderer.invoke("update-prima-transaction-status", id, paymentStatus),
  deletePrimaTransaction: (id) => ipcRenderer.invoke("delete-prima-transaction", id),

  // =================== Employees ===================
  getEmployees: () => ipcRenderer.invoke("get-employees"),
  addEmployee: (employee) => ipcRenderer.invoke("add-employee", employee),
  updateEmployee: (id, employee) => ipcRenderer.invoke("update-employee", id, employee),
  markSalaryPaid: (id) => ipcRenderer.invoke("mark-salary-paid", id),
  resetSalaryStatus: (id) => ipcRenderer.invoke("reset-salary-status", id),
  deleteEmployee: (id) => ipcRenderer.invoke("delete-employee", id),

  // =================== Stock ===================
  getStock: () => ipcRenderer.invoke("get-stock"),
  getStockHistory: () => ipcRenderer.invoke("get-stock-history"),
  addStock: (stock) => ipcRenderer.invoke("add-stock", stock),
  updateStock: (id, stock) => ipcRenderer.invoke("update-stock", id, stock),
  deleteStock: (id) => ipcRenderer.invoke("delete-stock", id),

  // =================== Purchase Orders ===================
  addPO: (po) => ipcRenderer.invoke("add-po", po),
  getPOs: () => ipcRenderer.invoke("get-pos"),
  getPOByNumber: (poNumber) => ipcRenderer.invoke("get-po-by-number", poNumber),
  updatePO: (poNumber, po) => ipcRenderer.invoke("update-po", poNumber, po),
  deletePO: (poNumber) => ipcRenderer.invoke("delete-po", poNumber),
});