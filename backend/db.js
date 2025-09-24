import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "expenses.db");
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Database connection error:", err);
  else console.log("✅ Connected to SQLite database");
});

/** -------------------- TABLES -------------------- **/

// Purchases table
db.run(`CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  quantity REAL NOT NULL,
  price REAL NOT NULL,
  paymentMethod TEXT NOT NULL,
  color TEXT NOT NULL,
  supplier TEXT NOT NULL
)`);

// Pettycash table
db.run(`CREATE TABLE IF NOT EXISTS pettycash (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  balance REAL NOT NULL
)`);

// Expenses table
db.run(`CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  cost REAL NOT NULL
)`);

// Production table
db.run(`CREATE TABLE IF NOT EXISTS production (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  kilosIn REAL NOT NULL,
  kilosOut REAL NOT NULL,
  surplus REAL NOT NULL,
  color TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Purchase Orders (POs)
db.run(`CREATE TABLE IF NOT EXISTS pos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poNumber TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  totalKilos REAL NOT NULL,
  remainingKilos REAL NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Prima Transactions
db.run(`CREATE TABLE IF NOT EXISTS primatransactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  kilosDelivered REAL NOT NULL,
  amount REAL NOT NULL,
  paymentStatus TEXT NOT NULL,
  poId INTEGER NOT NULL,
  poNumber TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poId) REFERENCES pos(id) ON DELETE CASCADE
)`);

// Employees Table
db.run(`CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  salary REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  startDate TEXT,
  endDate TEXT,
  lastPaid TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
