// controllers/primatransactions.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});


// Add Prima Transaction (with poId lookup)
export const addPrimaTransaction = async (transactionData) => {
  const { date, kilosDelivered, amount, paymentStatus, poNumber } = transactionData;

  if (!poNumber) throw new Error("poNumber is required");

  const { rows: poRows } = await client.execute(
    "SELECT id FROM pos WHERE poNumber = ?",
    [poNumber]
  );

  if (!poRows[0]) throw new Error(`PO number ${poNumber} not found`);

  const poId = poRows[0].id;

  const { lastInsertRowid } = await client.execute(
    `INSERT INTO primatransactions 
      (date, kilosDelivered, amount, paymentStatus, poId, poNumber)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [date, kilosDelivered, amount, paymentStatus, poId, poNumber]
  );

  const { rows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [lastInsertRowid]
  );

  return rows[0];
};

// Get all Prima Transactions
export const getPrimaTransactions = async () => {
  const { rows } = await client.execute(
    "SELECT * FROM primatransactions ORDER BY date DESC"
  );
  return rows;
};

// Update Prima Transaction (general update)
export const updatePrimaTransaction = async (id, transactionData) => {
  const { date, kilosDelivered, amount, paymentStatus, poNumber } = transactionData;

  const { rows: poRows } = await client.execute(
    "SELECT id FROM pos WHERE poNumber = ?",
    [poNumber]
  );

  if (!poRows[0]) throw new Error(`PO number ${poNumber} not found`);
  const poId = poRows[0].id;

  await client.execute(
    `UPDATE primatransactions 
     SET date = ?, kilosDelivered = ?, amount = ?, paymentStatus = ?, poId = ?, poNumber = ?
     WHERE id = ?`,
    [date, kilosDelivered, amount, paymentStatus, poId, poNumber, id]
  );

  const { rows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [id]
  );

  return rows[0];
};

// Update transaction status only (with allowed transitions)
export const updatePrimaTransactionStatus = async (id, newStatus) => {
  const { rows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [id]
  );

  if (!rows[0]) throw new Error("Transaction not found");

  const currentStatus = rows[0].paymentStatus;
  const allowedTransitions = { Pending: ["Approved", "Rejected"], Approved: ["Paid"] };

  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Cannot change status from ${currentStatus} to ${newStatus}`);
  }

  await client.execute(
    "UPDATE primatransactions SET paymentStatus = ? WHERE id = ?",
    [newStatus, id]
  );

  const { rows: updatedRows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [id]
  );

  return updatedRows[0];
};

// Delete a Prima Transaction
export const deletePrimaTransaction = async (id) => {
  await client.execute("DELETE FROM primatransactions WHERE id = ?", [id]);
  return { message: "Prima transaction deleted successfully", id };
};
