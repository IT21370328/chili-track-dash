// controllers/employees.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Get all employees
export const getEmployees = async () => {
  const { rows } = await client.execute("SELECT * FROM employees ORDER BY id DESC");
  return rows;
};

// Add employee
export const AddSalary = async (employee) => {
  const { name, salary, startDate, endDate } = employee;
  if (!name || salary === undefined) {
    throw new Error("Name and salary are required");
  }

  const { lastInsertRowid } = await client.execute(
    "INSERT INTO employees (name, salary, startDate, endDate) VALUES (?, ?, ?, ?)",
    [name, salary, startDate, endDate]
  );

  const { rows } = await client.execute("SELECT * FROM employees WHERE id = ?", [lastInsertRowid]);
  return rows[0];
};

// Update employee
export const updateEmployee = async (id, employee) => {
  const { name, salary, startDate, endDate } = employee;
  await client.execute(
    "UPDATE employees SET name = ?, salary = ?, startDate = ?, endDate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, salary, startDate, endDate, id]
  );

  const { rows } = await client.execute("SELECT * FROM employees WHERE id = ?", [id]);
  return rows[0];
};

// Delete employee
export const deleteEmployee = async (id) => {
  await client.execute("DELETE FROM employees WHERE id = ?", [id]);
  return { message: "Employee deleted successfully", id };
};

// Mark salary as paid
export const markSalaryPaid = async (id) => {
  const today = new Date().toISOString().split("T")[0];
  await client.execute(
    "UPDATE employees SET status = 'paid', lastPaid = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [today, id]
  );

  const { rows } = await client.execute("SELECT * FROM employees WHERE id = ?", [id]);
  return rows[0];
};

// Reset to unpaid (optional)
export const resetSalaryStatus = async (id) => {
  await client.execute(
    "UPDATE employees SET status = 'unpaid', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );

  const { rows } = await client.execute("SELECT * FROM employees WHERE id = ?", [id]);
  return rows[0];
};