// controllers/expenses.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});


// Get all expenses
export const getExpenses = async () => {
  const { rows } = await client.execute("SELECT * FROM expenses ORDER BY date DESC");
  return rows;
};

// Add a new expense
export const addExpense = async (expense) => {
  const { date, category, description, cost } = expense;

  if (!date || !category || !description || cost === undefined) {
    throw new Error("All fields are required");
  }

  const { lastInsertRowid } = await client.execute(
    "INSERT INTO expenses (date, category, description, cost) VALUES (?, ?, ?, ?)",
    [date, category, description, cost]
  );

  const { rows } = await client.execute("SELECT * FROM expenses WHERE id = ?", [lastInsertRowid]);
  return rows[0];
};

// Update an existing expense
export const updateExpense = async (id, expense) => {
  const { date, category, description, cost } = expense;

  await client.execute(
    "UPDATE expenses SET date = ?, category = ?, description = ?, cost = ? WHERE id = ?",
    [date, category, description, cost, id]
  );

  const { rows } = await client.execute("SELECT * FROM expenses WHERE id = ?", [id]);
  return rows[0];
};

// Delete an expense
export const deleteExpense = async (id) => {
  await client.execute("DELETE FROM expenses WHERE id = ?", [id]);
  return { message: "Expense deleted successfully", id };
};

// Get total expenses summary
export const getExpensesSummary = async () => {
  const { rows } = await client.execute("SELECT SUM(cost) as totalExpenses FROM expenses");
  return rows[0] || { totalExpenses: 0 };
};
