// controllers/pos.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Create a new PO
export const addPO = async (poData) => {
  const { poNumber, date, totalKilos, amount } = poData;
  if (!poNumber || !date || totalKilos === undefined || amount === undefined) {
    throw new Error("All fields are required");
  }

  const remainingKilos = totalKilos;

  const { lastInsertRowid } = await client.execute(
    `INSERT INTO pos (poNumber, date, totalKilos, remainingKilos, amount, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [poNumber, date, totalKilos, remainingKilos, amount]
  );

  return { id: lastInsertRowid, poNumber, date, totalKilos, remainingKilos, amount, status: "Pending" };
};

// Get all POs
export const getPOs = async () => {
  const { rows } = await client.execute(`SELECT * FROM pos ORDER BY date DESC`);
  return rows;
};

// Get PO by poNumber
export const getPOByNumber = async (poNumber) => {
  const { rows } = await client.execute(`SELECT * FROM pos WHERE poNumber = ?`, [poNumber]);
  return rows[0] || null;
};

// Update PO by poNumber
export const updatePO = async (poNumber, updates) => {
  const { totalKilos, remainingKilos, status, amount } = updates;

  await client.execute(
    `UPDATE pos SET 
       totalKilos = COALESCE(?, totalKilos), 
       remainingKilos = COALESCE(?, remainingKilos), 
       amount = COALESCE(?, amount), 
       status = COALESCE(?, status), 
       updated_at = CURRENT_TIMESTAMP
     WHERE poNumber = ?`,
    [totalKilos, remainingKilos, amount, status, poNumber]
  );

  const { rows } = await client.execute(`SELECT * FROM pos WHERE poNumber = ?`, [poNumber]);
  return rows[0];
};

// Delete PO by poNumber
export const deletePO = async (poNumber) => {
  await client.execute(`DELETE FROM pos WHERE poNumber = ?`, [poNumber]);
  return { message: "PO deleted successfully", poNumber };
};
