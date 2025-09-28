const { db } = require("../db");

// Get all employees
exports.getEmployees = async () => {
  try {
    const result = await db.execute("SELECT * FROM employees ORDER BY id DESC");
    return result.rows;
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    throw new Error("Failed to fetch employees");
  }
};

// Add a new employee
exports.addEmployee = async (data) => {
  const { name, salary, startDate, endDate, email, phone, position } = data;
  if (!name || !salary || !startDate || !endDate || !email || !phone || !position) {
    throw new Error("All fields are required");
  }
  const salaryNum = Number(salary);
  if (isNaN(salaryNum) || salaryNum <= 0) {
    throw new Error("Salary must be a positive number");
  }
  if (startDate > endDate) {
    throw new Error("End date cannot be before start date");
  }
  try {
    const result = await db.execute({
      sql: `INSERT INTO employees (name, salary, startDate, endDate, email, phone, position) 
            VALUES (?, ?, ?, ?, ?, ?, ?) 
            RETURNING *`,
      args: [name, salaryNum, startDate, endDate, email, phone, position],
    });
    return result.rows[0];
  } catch (err) {
    console.error("Error creating employee:", err.message);
    throw new Error("Failed to create employee");
  }
};

// Update an employee
exports.updateEmployee = async (id, data) => {
  const { name, salary, startDate, endDate, email, phone, position } = data;
  if (!name || !salary || !startDate || !endDate || !email || !phone || !position) {
    throw new Error("All fields are required");
  }
  const salaryNum = Number(salary);
  if (isNaN(salaryNum) || salaryNum <= 0) {
    throw new Error("Salary must be a positive number");
  }
  if (startDate > endDate) {
    throw new Error("End date cannot be before start date");
  }
  try {
    const result = await db.execute({
      sql: `UPDATE employees 
            SET name = ?, salary = ?, startDate = ?, endDate = ?, email = ?, phone = ?, position = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? 
            RETURNING *`,
      args: [name, salaryNum, startDate, endDate, email, phone, position, id],
    });
    if (result.rows.length === 0) {
      throw new Error("Employee not found");
    }
    return result.rows[0];
  } catch (err) {
    console.error("Error updating employee:", err.message);
    throw new Error("Failed to update employee");
  }
};

// Mark employee salary as paid
exports.markSalaryPaid = async (id) => {
  try {
    const result = await db.execute({
      sql: `UPDATE employees 
            SET status = 'paid', lastPaid = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? 
            RETURNING *`,
      args: [id],
    });
    if (result.rows.length === 0) {
      throw new Error("Employee not found");
    }
    return result.rows[0];
  } catch (err) {
    console.error("Error marking employee as paid:", err.message);
    throw new Error("Failed to mark employee as paid");
  }
};

// Reset employee salary status
exports.resetSalaryStatus = async (id) => {
  try {
    const result = await db.execute({
      sql: `UPDATE employees 
            SET status = 'unpaid', lastPaid = NULL, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? 
            RETURNING *`,
      args: [id],
    });
    if (result.rows.length === 0) {
      throw new Error("Employee not found");
    }
    return result.rows[0];
  } catch (err) {
    console.error("Error resetting employee salary status:", err.message);
    throw new Error("Failed to reset employee salary status");
  }
};

// Delete an employee
exports.deleteEmployee = async (id) => {
  try {
    const result = await db.execute({
      sql: "DELETE FROM employees WHERE id = ? RETURNING *",
      args: [id],
    });
    if (result.rows.length === 0) {
      throw new Error("Employee not found");
    }
    return { message: "Employee deleted successfully" };
  } catch (err) {
    console.error("Error deleting employee:", err.message);
    throw new Error("Failed to delete employee");
  }
};