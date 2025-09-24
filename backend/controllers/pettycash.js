import { db } from "../db.js";

// Add petty cash transaction
export function addPettyCash(transaction, callback) {
  const { amount, description, type } = transaction;
  const date = new Date().toISOString();
  const amt = parseFloat(amount);

  db.get("SELECT balance FROM pettycash ORDER BY id DESC LIMIT 1", [], (err, row) => {
    if (err) return callback(err);

    let currentBalance = row ? row.balance : 0;
    let newBalance = type === "inflow" ? currentBalance + amt : currentBalance - amt;

    db.run(
      "INSERT INTO pettycash (date, amount, description, type, balance) VALUES (?, ?, ?, ?, ?)",
      [date, amt, description, type, newBalance],
      function (err) {
        callback(err, { id: this.lastID, balance: newBalance });
      }
    );
  });
}

// Get all petty cash transactions
export function getPettyCash(callback) {
  db.all("SELECT * FROM pettycash ORDER BY date DESC", (err, rows) => {
    callback(err, rows);
  });
}

// Get petty cash summary
export function getPettyCashSummary(callback) {
  db.all(
    "SELECT type, SUM(amount) as total FROM pettycash GROUP BY type",
    (err, rows) => {
      if (err) return callback(err);

      let totalInflow = 0;
      let totalOutflow = 0;

      rows.forEach(row => {
        if (row.type === "inflow") totalInflow = row.total;
        else if (row.type === "outflow") totalOutflow = row.total;
      });

      db.get("SELECT balance FROM pettycash ORDER BY id DESC LIMIT 1", [], (err, row) => {
        if (err) return callback(err);
        const balance = row ? row.balance : 0;
        callback(null, { totalInflow, totalOutflow, balance });
      });
    }
  );
}

// Update a petty cash transaction
export function updatePettyCash(id, transaction, callback) {
  const { amount, description, type } = transaction;
  const amt = parseFloat(amount);

  // Get the previous transaction to recalculate balances
  db.get("SELECT * FROM pettycash WHERE id = ?", [id], (err, oldRow) => {
    if (err) return callback(err);
    if (!oldRow) return callback(new Error("Transaction not found"));

    // Get the balance before this transaction
    db.get(
      "SELECT balance FROM pettycash WHERE id < ? ORDER BY id DESC LIMIT 1",
      [id],
      (err, prevRow) => {
        if (err) return callback(err);
        let prevBalance = prevRow ? prevRow.balance : 0;

        // New balance after update
        let newBalance = type === "inflow" ? prevBalance + amt : prevBalance - amt;

        // Update the transaction
        db.run(
          "UPDATE pettycash SET amount = ?, description = ?, type = ?, balance = ? WHERE id = ?",
          [amt, description, type, newBalance, id],
          function (err) {
            if (err) return callback(err);

            // Recalculate balances for following transactions
            db.all("SELECT id, amount, type FROM pettycash WHERE id > ? ORDER BY id ASC", [id], (err, rows) => {
              if (err) return callback(err);

              let balance = newBalance;
              rows.forEach(row => {
                balance = row.type === "inflow" ? balance + row.amount : balance - row.amount;
                db.run("UPDATE pettycash SET balance = ? WHERE id = ?", [balance, row.id]);
              });

              callback(null, { id, balance: newBalance });
            });
          }
        );
      }
    );
  });
}

// Delete a petty cash transaction
export function deletePettyCash(id, callback) {
  // Get the transaction to delete
  db.get("SELECT * FROM pettycash WHERE id = ?", [id], (err, rowToDelete) => {
    if (err) return callback(err);
    if (!rowToDelete) return callback(new Error("Transaction not found"));

    db.run("DELETE FROM pettycash WHERE id = ?", [id], function (err) {
      if (err) return callback(err);

      // Recalculate balances for following transactions
      db.all("SELECT id, amount, type FROM pettycash WHERE id > ? ORDER BY id ASC", [id], (err, rows) => {
        if (err) return callback(err);

        // Get previous balance
        db.get("SELECT balance FROM pettycash WHERE id < ? ORDER BY id DESC LIMIT 1", [id], (err, prevRow) => {
          if (err) return callback(err);
          let balance = prevRow ? prevRow.balance : 0;

          rows.forEach(row => {
            balance = row.type === "inflow" ? balance + row.amount : balance - row.amount;
            db.run("UPDATE pettycash SET balance = ? WHERE id = ?", [balance, row.id]);
          });

          callback(null, { message: "Transaction deleted successfully", id });
        });
      });
    });
  });
}
