import { createClient } from "@libsql/client";
import dotenv from "dotenv";

// Load .env in the same folder
dotenv.config();

// Check environment variables
if (!process.env.TURSO_URL || !process.env.TURSO_API_KEY) {
  throw new Error("❌ TURSO_URL or TURSO_API_KEY is missing in .env!");
}

// Turso Client Setup
export const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// -------------------- TABLE CREATION --------------------
export async function initializeTables() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        color TEXT NOT NULL,
        supplier TEXT NOT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS pettycash (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL NOT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        cost REAL NOT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS production (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        kilosIn REAL NOT NULL,
        kilosOut REAL NOT NULL,
        surplus REAL NOT NULL,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS pos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poNumber TEXT UNIQUE NOT NULL,
        date TEXT NOT NULL,
        totalKilos REAL NOT NULL,
        remainingKilos REAL NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS primatransactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        kilosDelivered REAL NOT NULL,
        amount REAL NOT NULL,
        paymentStatus TEXT NOT NULL,
        poId INTEGER NOT NULL,
        poNumber TEXT,
        dateOfExpiration TEXT,
        productCode TEXT,
        batchCode TEXT,
        numberOfBoxes INTEGER,
        truckNo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (poId) REFERENCES pos(id) ON DELETE CASCADE,
        FOREIGN KEY (poNumber) REFERENCES pos(poNumber) ON DELETE SET NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        salary REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'unpaid',
        startDate TEXT,
        endDate TEXT,
        lastPaid TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        position TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add new columns if they don't exist
    try {
      await db.execute(`ALTER TABLE employees ADD COLUMN email TEXT UNIQUE`);
    } catch (err) {
      if (!err.message.includes("duplicate column name")) {
        console.error("❌ Failed to add email column:", err.message);
      }
    }
    try {
      await db.execute(`ALTER TABLE employees ADD COLUMN phone TEXT`);
    } catch (err) {
      if (!err.message.includes("duplicate column name")) {
        console.error("❌ Failed to add phone column:", err.message);
      }
    }
    try {
      await db.execute(`ALTER TABLE employees ADD COLUMN position TEXT`);
    } catch (err) {
      if (!err.message.includes("duplicate column name")) {
        console.error("❌ Failed to add position column:", err.message);
      }
    }

    console.log("✅ All tables initialized successfully on Turso!");
  } catch (err) {
    console.error("❌ Table initialization failed:", err.message);
    throw err;
  }
}

// Initialize tables on startup
initializeTables().catch((err) => {
  console.error("❌ Failed to initialize tables on startup:", err.message);
});