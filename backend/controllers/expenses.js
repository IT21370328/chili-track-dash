import { db } from "../db.js";

// Get all expenses
export const getExpenses = (callback) => {
  db.all("SELECT * FROM expenses ORDER BY date DESC", [], callback);
};

// Add a new expense
export const addExpense = (expense, callback) => {
  const { date, category, description, cost } = expense;
  db.run(
    "INSERT INTO expenses (date, category, description, cost) VALUES (?, ?, ?, ?)",
    [date, category, description, cost],
    function (err) {
      if (err) callback(err);
      else callback(null, { id: this.lastID });
    }
  );
};

// Update an existing expense
export const updateExpense = (id, expense, callback) => {
  const { date, category, description, cost } = expense;
  db.run(
    "UPDATE expenses SET date = ?, category = ?, description = ?, cost = ? WHERE id = ?",
    [date, category, description, cost, id],
    function (err) {
      if (err) return callback(err);

      // Return the updated row
      db.get("SELECT * FROM expenses WHERE id = ?", [id], (err, row) => {
        if (err) return callback(err);
        callback(null, row);
      });
    }
  );
};

// Delete an expense
export const deleteExpense = (id, callback) => {
  db.run("DELETE FROM expenses WHERE id = ?", [id], function (err) {
    if (err) return callback(err);
    callback(null, { message: "Expense deleted successfully", id });
  });
};

// Get total expenses summary
export const getExpensesSummary = (callback) => {
  db.get(
    "SELECT SUM(cost) as totalExpenses FROM expenses",
    [],
    (err, row) => {
      if (err) callback(err);
      else callback(null, row || { totalExpenses: 0 });
    }
  );
};
