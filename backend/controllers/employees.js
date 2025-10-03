// controllers/salary.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Get all salaries
export const getSalaries = async () => {
  const { rows } = await client.execute("SELECT * FROM salaries ORDER BY date DESC");
  return rows;
};

// Add a new salary
export const addSalary = async (salary) => {
  const { date, employee_id, amount } = salary;

  if (!date || !employee_id || amount === undefined) {
    throw new Error("Date, employee_id, and amount are required");
  }

  const { lastInsertRowid } = await client.execute(
    "INSERT INTO salaries (date, employee_id, amount) VALUES (?, ?, ?)",
    [date, employee_id, amount]
  );

  const { rows } = await client.execute("SELECT * FROM salaries WHERE id = ?", [lastInsertRowid]);
  return rows[0];
};

// Update an existing salary
export const updateSalary = async (id, salary) => {
  const { date, employee_id, amount } = salary;

  await client.execute(
    "UPDATE salaries SET date = ?, employee_id = ?, amount = ? WHERE id = ?",
    [date, employee_id, amount, id]
  );

  const { rows } = await client.execute("SELECT * FROM salaries WHERE id = ?", [id]);
  return rows[0];
};

// Delete a salary
export const deleteSalary = async (id) => {
  await client.execute("DELETE FROM salaries WHERE id = ?", [id]);
  return { message: "Salary deleted successfully", id };
};

// Get total salary summary
export const getSalarySummary = async () => {
  const { rows } = await client.execute("SELECT SUM(amount) as totalSalary FROM salaries");
  return rows[0] || { totalSalary: 0 };
};