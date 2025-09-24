// controllers/stock.js
import { db } from "../db.js";

// ✅ Get total stock (total quantity purchased)
export function getStock(callback) {
  const query = `SELECT SUM(quantity) as totalQuantity FROM purchases`;
  db.get(query, [], (err, row) => {
    if (err) return callback(err);
    const totalQuantity = row?.totalQuantity || 0;
    callback(null, { totalQuantity });
  });
}

// ✅ Get stock history (all purchases)
export function getStockHistory(callback) {
  const query = `
    SELECT 
      id, 
      date, 
      quantity, 
      price, 
      paymentMethod, 
      (quantity * price) as totalValue 
    FROM purchases 
    ORDER BY date DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows || []);
  });
}

// ✅ Add new stock (purchase record)
export function addStock(stockData, callback) {
  const { date, quantity, price, paymentMethod } = stockData;
  if (!quantity || !price) return callback(new Error("Quantity and price are required"));

  const query = `
    INSERT INTO purchases (date, quantity, price, paymentMethod)
    VALUES (?, ?, ?, ?)
  `;
  db.run(query, [date, quantity, price, paymentMethod], function (err) {
    if (err) return callback(err);
    db.get(`SELECT * FROM purchases WHERE id = ?`, [this.lastID], callback);
  });
}

// ✅ Update stock (purchase record)
export function updateStock(id, updates, callback) {
  const { date, quantity, price, paymentMethod } = updates;
  const query = `
    UPDATE purchases SET
      date = COALESCE(?, date),
      quantity = COALESCE(?, quantity),
      price = COALESCE(?, price),
      paymentMethod = COALESCE(?, paymentMethod),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [date, quantity, price, paymentMethod, id], function (err) {
    if (err) return callback(err);
    db.get(`SELECT * FROM purchases WHERE id = ?`, [id], callback);
  });
}

// ✅ Delete stock (purchase record)
export function deleteStock(id, callback) {
  const query = `DELETE FROM purchases WHERE id = ?`;
  db.run(query, [id], function (err) {
    if (err) return callback(err);
    callback(null, { message: "Stock record deleted successfully", id });
  });
}
