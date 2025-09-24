// controllers/pos.js
import { db } from "../db.js";

// Create a new PO
export const addPO = (poData, callback) => {
  const { poNumber, date, totalKilos, amount } = poData;
  const query = `
    INSERT INTO pos (poNumber, date, totalKilos, remainingKilos, amount, status)
    VALUES (?, ?, ?, ?, ?, 'Pending')
  `;
  
  db.run(query, [poNumber, date, totalKilos, totalKilos, amount], function (err) {
    if (err) return callback(err);
    callback(null, { 
      id: this.lastID, 
      poNumber, 
      date, 
      totalKilos, 
      remainingKilos: totalKilos, 
      amount, 
      status: "Pending" 
    });
  });
};

// Get all POs
export const getPOs = (callback) => {
  db.all(`SELECT * FROM pos ORDER BY date DESC`, [], callback);
};

// Get PO by poNumber
export const getPOByNumber = (poNumber, callback) => {
  db.get(`SELECT * FROM pos WHERE poNumber = ?`, [poNumber], (err, row) => {
    if (err) return callback(err);
    callback(null, row || null);
  });
};

// Update PO by poNumber
export const updatePO = (poNumber, updates, callback) => {
  const { totalKilos, remainingKilos, status, amount } = updates;
  const query = `
    UPDATE pos SET 
      totalKilos = COALESCE(?, totalKilos), 
      remainingKilos = COALESCE(?, remainingKilos), 
      amount = COALESCE(?, amount),
      status = COALESCE(?, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE poNumber = ?
  `;
  
  db.run(query, [totalKilos, remainingKilos, amount, status, poNumber], function(err) {
    if (err) return callback(err);
    db.get(`SELECT * FROM pos WHERE poNumber = ?`, [poNumber], (err, row) => {
      if (err) return callback(err);
      callback(null, row);
    });
  });
};

// Delete PO by poNumber
export const deletePO = (poNumber, callback) => {
  const query = `DELETE FROM pos WHERE poNumber = ?`;
  db.run(query, [poNumber], function (err) {
    if (err) return callback(err);
    callback(null, { message: "PO deleted successfully", poNumber });
  });
};
