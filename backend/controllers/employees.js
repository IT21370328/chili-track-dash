const { db } = require("../db");

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM employees ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM employees WHERE id = ?",
      args: [id],
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching employee:", err.message);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, salary, startDate, endDate, email, phone, position } = req.body;
    if (!name || !salary || !startDate || !endDate || !email || !phone || !position) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (isNaN(salary) || salary <= 0) {
      return res.status(400).json({ error: "Salary must be a positive number" });
    }
    if (startDate > endDate) {
      return res.status(400).json({ error: "End date cannot be before start date" });
    }
    const result = await db.execute({
      sql: `INSERT INTO employees (name, salary, startDate, endDate, email, phone, position) 
            VALUES (?, ?, ?, ?, ?, ?, ?) 
            RETURNING *`,
      args: [name, salary, startDate, endDate, email, phone, position],
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating employee:", err.message);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, salary, startDate, endDate, email, phone, position } = req.body;
    if (!name || !salary || !startDate || !endDate || !email || !phone || !position) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (isNaN(salary) || salary <= 0) {
      return res.status(400).json({ error: "Salary must be a positive number" });
    }
    if (startDate > endDate) {
      return res.status(400).json({ error: "End date cannot be before start date" });
    }
    const result = await db.execute({
      sql: `UPDATE employees 
            SET name = ?, salary = ?, startDate = ?, endDate = ?, email = ?, phone = ?, position = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? 
            RETURNING *`,
      args: [name, salary, startDate, endDate, email, phone, position, id],
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating employee:", err.message);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: "DELETE FROM employees WHERE id = ? RETURNING *",
      args: [id],
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err.message);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

// Mark employee as paid
exports.markEmployeePaid = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: `UPDATE employees 
            SET status = 'paid', lastPaid = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? 
            RETURNING *`,
      args: [id],
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error marking employee as paid:", err.message);
    res.status(500).json({ error: "Failed to mark employee as paid" });
  }
};