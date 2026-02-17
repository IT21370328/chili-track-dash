// controllers/employees.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load environment variables

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Get all employees
export const getEmployees = async () => {
  try {
    const { rows } = await client.execute(
      "SELECT * FROM employees ORDER BY id DESC"
    );
    return rows;
  } catch (error) {
    throw new Error(`Error fetching employees: ${error.message}`);
  }
};

// Add new employee
export const addEmployee = async (employee) => {
  try {
    const { name, salary, startDate, endDate } = employee;
    if (!name || salary === undefined) {
      throw new Error("Name and salary are required");
    }

    const { lastInsertRowid } = await client.execute(
      `INSERT INTO employees (name, salary, startDate, endDate, status, created_at) 
       VALUES (?, ?, ?, ?, 'unpaid', CURRENT_TIMESTAMP)`,
      [name, salary, startDate, endDate]
    );

    const { rows } = await client.execute(
      "SELECT * FROM employees WHERE id = ?",
      [lastInsertRowid]
    );
    return rows[0];
  } catch (error) {
    throw new Error(`Error adding employee: ${error.message}`);
  }
};

// Update employee
export const updateEmployee = async (id, employee) => {
  try {
    const { name, salary, startDate, endDate } = employee;
    await client.execute(
      `UPDATE employees 
       SET name = ?, salary = ?, startDate = ?, endDate = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, salary, startDate, endDate, id]
    );

    const { rows } = await client.execute("SELECT * FROM employees WHERE id = ?", [id]);
    return rows[0];
  } catch (error) {
    throw new Error(`Error updating employee: ${error.message}`);
  }
};

// Delete employee
export const deleteEmployee = async (id) => {
  try {
    await client.execute("DELETE FROM employees WHERE id = ?", [id]);
    return { message: "Employee deleted successfully", id };
  } catch (error) {
    throw new Error(`Error deleting employee: ${error.message}`);
  }
};

// Mark salary as paid
export const markSalaryPaid = async (id) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    await client.execute(
      `UPDATE employees 
       SET status = 'paid', lastPaid = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [today, id]
    );

    const { rows } = await client.execute("SELECT * FROM employees WHERE id = ?", [id]);
    return rows[0];
  } catch (error) {
    throw new Error(`Error marking salary as paid: ${error.message}`);
  }
};

// Reset salary status to unpaid
export const resetSalaryStatus = async (id) => {
  try {
    await client.execute(
      `UPDATE employees 
       SET status = 'unpaid', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    );

    const { rows } = await client.execute("SELECT * FROM employees WHERE id = ?", [id]);
    return rows[0];
  } catch (error) {
    throw new Error(`Error resetting salary status: ${error.message}`);
  }
};
