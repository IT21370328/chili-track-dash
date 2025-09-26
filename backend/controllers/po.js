// controllers/pos.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Create a new PO
export const addPO = async (poData) => {
  try {
    const { poNumber, date, totalKilos, amount } = poData;
    
    if (!poNumber || !date || totalKilos === undefined || amount === undefined) {
      throw new Error("All fields are required");
    }

    // Check if PO number already exists
    const { rows: existingPO } = await client.execute(
      `SELECT poNumber FROM pos WHERE poNumber = ?`, 
      [poNumber]
    );
    
    if (existingPO.length > 0) {
      throw new Error(`PO number ${poNumber} already exists`);
    }

    const remainingKilos = totalKilos;

    const result = await client.execute(
      `INSERT INTO pos (poNumber, date, totalKilos, remainingKilos, amount, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [poNumber, date, totalKilos, remainingKilos, amount]
    );

    // Return the created PO with all fields
    return {
      id: Number(result.lastInsertRowid),
      poNumber,
      date,
      totalKilos: Number(totalKilos),
      remainingKilos: Number(remainingKilos),
      amount: Number(amount),
      status: "Pending"
    };
  } catch (error) {
    console.error('Error adding PO:', error);
    throw error; // Re-throw to be handled by the route handler
  }
};

// Get all POs
export const getPOs = async () => {
  try {
    const { rows } = await client.execute(`SELECT * FROM pos ORDER BY date DESC`);
    return rows.map(row => ({
      ...row,
      totalKilos: Number(row.totalKilos),
      remainingKilos: Number(row.remainingKilos),
      amount: Number(row.amount),
      id: Number(row.id)
    }));
  } catch (error) {
    console.error('Error getting POs:', error);
    throw error;
  }
};

// Get PO by poNumber
export const getPOByNumber = async (poNumber) => {
  try {
    const { rows } = await client.execute(`SELECT * FROM pos WHERE poNumber = ?`, [poNumber]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      ...row,
      totalKilos: Number(row.totalKilos),
      remainingKilos: Number(row.remainingKilos),
      amount: Number(row.amount),
      id: Number(row.id)
    };
  } catch (error) {
    console.error('Error getting PO by number:', error);
    throw error;
  }
};

// Update PO by poNumber
export const updatePO = async (poNumber, updates) => {
  try {
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
    if (rows.length === 0) {
      throw new Error(`PO with number ${poNumber} not found`);
    }
    
    const row = rows[0];
    return {
      ...row,
      totalKilos: Number(row.totalKilos),
      remainingKilos: Number(row.remainingKilos),
      amount: Number(row.amount),
      id: Number(row.id)
    };
  } catch (error) {
    console.error('Error updating PO:', error);
    throw error;
  }
};

// Delete PO by poNumber
export const deletePO = async (poNumber) => {
  try {
    const result = await client.execute(`DELETE FROM pos WHERE poNumber = ?`, [poNumber]);
    
    if (result.rowsAffected === 0) {
      throw new Error(`PO with number ${poNumber} not found`);
    }
    
    return { message: "PO deleted successfully", poNumber };
  } catch (error) {
    console.error('Error deleting PO:', error);
    throw error;
  }
};