// controllers/pettycash.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Helper: recalculate balances from a starting ID
const recalcBalances = async (startId) => {
  const prevResult = await client.execute(
    "SELECT balance FROM pettycash WHERE id < ? ORDER BY id DESC LIMIT 1",
    [startId]
  );
  let balance = prevResult.rows[0] ? Number(prevResult.rows[0].balance) : 0;

  const { rows: transactions } = await client.execute(
    "SELECT id, amount, type FROM pettycash WHERE id >= ? ORDER BY id ASC",
    [startId]
  );

  for (const t of transactions) {
    const amt = Number(t.amount);
    balance = t.type === "inflow" ? balance + amt : balance - amt;
    await client.execute("UPDATE pettycash SET balance = ? WHERE id = ?", [balance, t.id]);
  }
};

// Add petty cash transaction
export const addPettyCash = async (transaction) => {
  const { amount, description, type } = transaction;
  if (!amount || !description || !type) throw new Error("All fields are required");

  const amt = parseFloat(amount);
  const date = new Date().toISOString();

  const { rows: lastRow } = await client.execute(
    "SELECT balance FROM pettycash ORDER BY id DESC LIMIT 1"
  );
  const currentBalance = lastRow[0] ? Number(lastRow[0].balance) : 0;
  const newBalance = type === "inflow" ? currentBalance + amt : currentBalance - amt;

  await client.execute(
    "INSERT INTO pettycash (date, amount, description, type, balance) VALUES (?, ?, ?, ?, ?)",
    [date, amt, description, type, newBalance]
  );

  // Get the inserted row
  const { rows } = await client.execute("SELECT * FROM pettycash ORDER BY id DESC LIMIT 1");
  return rows[0];
};

// Get all petty cash transactions
export const getPettyCash = async () => {
  const { rows } = await client.execute("SELECT * FROM pettycash ORDER BY date DESC");
  return rows;
};

// Get petty cash summary
export const getPettyCashSummary = async () => {
  const { rows } = await client.execute(
    "SELECT type, SUM(amount) as total FROM pettycash GROUP BY type"
  );
  let totalInflow = 0, totalOutflow = 0;
  rows.forEach((row) => {
    if (row.type === "inflow") totalInflow = Number(row.total);
    if (row.type === "outflow") totalOutflow = Number(row.total);
  });

  const { rows: lastRow } = await client.execute(
    "SELECT balance FROM pettycash ORDER BY id DESC LIMIT 1"
  );
  const balance = lastRow[0] ? Number(lastRow[0].balance) : 0;

  return { totalInflow, totalOutflow, balance };
};

// Update a petty cash transaction
export const updatePettyCash = async (id, transaction) => {
  const { amount, description, type } = transaction;
  if (!amount || !description || !type) throw new Error("All fields are required");

  const amt = parseFloat(amount);

  const { rows: oldRow } = await client.execute(
    "SELECT * FROM pettycash WHERE id = ?",
    [id]
  );
  if (!oldRow[0]) throw new Error("Transaction not found");

  await client.execute(
    "UPDATE pettycash SET amount = ?, description = ?, type = ? WHERE id = ?",
    [amt, description, type, id]
  );

  await recalcBalances(id);

  const { rows } = await client.execute("SELECT * FROM pettycash WHERE id = ?", [id]);
  return rows[0];
};

// Delete a petty cash transaction
export const deletePettyCash = async (id) => {
  const { rows: rowToDelete } = await client.execute(
    "SELECT * FROM pettycash WHERE id = ?",
    [id]
  );
  if (!rowToDelete[0]) throw new Error("Transaction not found");

  await client.execute("DELETE FROM pettycash WHERE id = ?", [id]);

  await recalcBalances(id);

  return { message: "Transaction deleted successfully", id };
};
