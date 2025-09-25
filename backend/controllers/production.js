// controllers/production.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});


// Add a production record
export const addProduction = async (productionData) => {
  const { date, kilosIn, kilosOut, color } = productionData;
  const expectedOut = kilosIn / 10;
  const surplus = kilosOut - expectedOut;

  const { lastInsertRowid } = await client.execute(
    `INSERT INTO production (date, kilosIn, kilosOut, surplus, color) 
     VALUES (?, ?, ?, ?, ?)`,
    [date, kilosIn, kilosOut, surplus, color]
  );

  const { rows } = await client.execute(
    "SELECT * FROM production WHERE id = ?",
    [lastInsertRowid]
  );

  return rows[0];
};

// Get all production records
export const getProduction = async () => {
  const { rows } = await client.execute(
    "SELECT * FROM production ORDER BY date DESC"
  );
  return rows;
};

// Get production summary
export const getProductionSummary = async () => {
  const { rows } = await client.execute(
    `SELECT 
       COUNT(*) as totalRecords,
       SUM(kilosIn) as totalKilosIn,
       SUM(kilosOut) as totalKilosOut,
       SUM(surplus) as totalSurplus,
       MAX(surplus) as maxSurplus,
       MIN(surplus) as minSurplus
     FROM production`
  );

  const row = rows[0] || {};
  return {
    totalRecords: row.totalRecords || 0,
    totalKilosIn: row.totalKilosIn ? parseFloat(row.totalKilosIn).toFixed(2) : "0.00",
    totalKilosOut: row.totalKilosOut ? parseFloat(row.totalKilosOut).toFixed(2) : "0.00",
    totalSurplus: row.totalSurplus ? parseFloat(row.totalSurplus).toFixed(2) : "0.00",
    maxSurplus: row.maxSurplus ? parseFloat(row.maxSurplus).toFixed(2) : "0.00",
    minSurplus: row.minSurplus ? parseFloat(row.minSurplus).toFixed(2) : "0.00",
  };
};

// Get production by date range
export const getProductionByDateRange = async (startDate, endDate) => {
  const { rows } = await client.execute(
    `SELECT * FROM production 
     WHERE date BETWEEN ? AND ?
     ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows;
};

// Update production record
export const updateProduction = async (id, productionData) => {
  const { date, kilosIn, kilosOut, color } = productionData;
  const expectedOut = kilosIn / 10;
  const surplus = kilosOut - expectedOut;

  await client.execute(
    `UPDATE production
     SET date = ?, kilosIn = ?, kilosOut = ?, surplus = ?, color = ?
     WHERE id = ?`,
    [date, kilosIn, kilosOut, surplus, color, id]
  );

  const { rows } = await client.execute(
    "SELECT * FROM production WHERE id = ?",
    [id]
  );

  return rows[0];
};

// Delete production record
export const deleteProduction = async (id) => {
  await client.execute("DELETE FROM production WHERE id = ?", [id]);
  return { message: "Production record deleted successfully", id };
};
