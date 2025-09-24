// controllers/employees.js
import { db } from "../db.js";

// Get all employees
export function getEmployees(callback) {
  const query = `SELECT * FROM employees ORDER BY id DESC`;
  db.all(query, [], callback);
}

// Add employee
export function addEmployee(employee, callback) {
  const { name, salary, startDate, endDate } = employee;
  if (!name || salary === undefined) return callback(new Error("Name and salary are required"));

  const query = `
    INSERT INTO employees (name, salary, startDate, endDate)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, [name, salary, startDate, endDate], function (err) {
    if (err) return callback(err);
    db.get(`SELECT * FROM employees WHERE id = ?`, [this.lastID], callback);
  });
}

// Update employee
export function updateEmployee(id, employee, callback) {
  const { name, salary, startDate, endDate } = employee;
  const query = `
    UPDATE employees
    SET name = ?, salary = ?, startDate = ?, endDate = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [name, salary, startDate, endDate, id], function (err) {
    if (err) return callback(err);
    db.get(`SELECT * FROM employees WHERE id = ?`, [id], callback);
  });
}

// Delete employee
export function deleteEmployee(id, callback) {
  const query = `DELETE FROM employees WHERE id = ?`;
  db.run(query, [id], function (err) {
    if (err) return callback(err);
    callback(null, { message: "Employee deleted successfully", id });
  });
}

// Mark salary as paid
export function markSalaryPaid(id, callback) {
  const today = new Date().toISOString().split("T")[0];
  const query = `
    UPDATE employees 
    SET status = 'paid', lastPaid = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  db.run(query, [today, id], function (err) {
    if (err) return callback(err);
    db.get(`SELECT * FROM employees WHERE id = ?`, [id], callback);
  });
}

// Reset to unpaid (optional)
export function resetSalaryStatus(id, callback) {
  const query = `
    UPDATE employees 
    SET status = 'unpaid', updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  db.run(query, [id], function (err) {
    if (err) return callback(err);
    db.get(`SELECT * FROM employees WHERE id = ?`, [id], callback);
  });
}
