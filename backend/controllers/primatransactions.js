import { db } from "../db.js";

// Add Prima Transaction (with poId lookup)
export const addPrimaTransaction = (transactionData, callback) => {
  const { date, kilosDelivered, amount, paymentStatus, poNumber } = transactionData;

  if (!poNumber) return callback(new Error("poNumber is required"));

  db.get("SELECT id FROM pos WHERE poNumber = ?", [poNumber], (err, po) => {
    if (err) return callback(err);
    if (!po) return callback(new Error(`PO number ${poNumber} not found`));

    const poId = po.id;

    const query = `
      INSERT INTO primatransactions 
        (date, kilosDelivered, amount, paymentStatus, poId, poNumber)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [date, kilosDelivered, amount, paymentStatus, poId, poNumber], function(err) {
      if (err) return callback(err);
      db.get("SELECT * FROM primatransactions WHERE id = ?", [this.lastID], callback);
    });
  });
};

// Get all Prima Transactions
export const getPrimaTransactions = (callback) => {
  db.all("SELECT * FROM primatransactions ORDER BY date DESC", [], callback);
};

// Update Prima Transaction (general update)
export const updatePrimaTransaction = (id, transactionData, callback) => {
  const { date, kilosDelivered, amount, paymentStatus, poNumber } = transactionData;

  db.get("SELECT id FROM pos WHERE poNumber = ?", [poNumber], (err, po) => {
    if (err) return callback(err);
    if (!po) return callback(new Error(`PO number ${poNumber} not found`));

    const poId = po.id;

    const query = `
      UPDATE primatransactions 
      SET date = ?, kilosDelivered = ?, amount = ?, paymentStatus = ?, poId = ?, poNumber = ?
      WHERE id = ?
    `;

    db.run(query, [date, kilosDelivered, amount, paymentStatus, poId, poNumber, id], function(err) {
      if (err) return callback(err);
      db.get("SELECT * FROM primatransactions WHERE id = ?", [id], callback);
    });
  });
};

// Update transaction status only (with allowed transitions)
export const updatePrimaTransactionStatus = (id, newStatus, callback) => {
  db.get("SELECT * FROM primatransactions WHERE id = ?", [id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error("Transaction not found"));

    const currentStatus = row.paymentStatus;
    const allowedTransitions = { Pending: ["Approved", "Rejected"], Approved: ["Paid"] };

    if (!allowedTransitions[currentStatus]?.includes(newStatus))
      return callback(new Error(`Cannot change status from ${currentStatus} to ${newStatus}`));

    db.run("UPDATE primatransactions SET paymentStatus = ? WHERE id = ?", [newStatus, id], (err) => {
      if (err) return callback(err);
      db.get("SELECT * FROM primatransactions WHERE id = ?", [id], callback);
    });
  });
};

// Delete a Prima Transaction
export const deletePrimaTransaction = (id, callback) => {
  db.run("DELETE FROM primatransactions WHERE id = ?", [id], function(err) {
    if (err) return callback(err);
    callback(null, { message: "Prima transaction deleted successfully", id });
  });
};
