// controllers/stock.js
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// ✅ Get total stock (sum of quantity purchased)
export const getStock = async () => {
  const { rows } = await client.execute(`SELECT SUM(quantity) as totalQuantity FROM purchases`);
  const totalQuantity = rows[0]?.totalQuantity || 0;
  return { totalQuantity };
};

// ✅ Get stock history (all purchases)
export const getStockHistory = async () => {
  const { rows } = await client.execute(`
    SELECT 
      id, 
      date, 
      quantity, 
      price, 
      paymentMethod, 
      (quantity * price) as totalValue 
    FROM purchases 
    ORDER BY date DESC
  `);
  return rows || [];
};

// ✅ Add new stock (purchase record)
export const addStock = async (stockData) => {
  const { date, quantity, price, paymentMethod } = stockData;
  if (!quantity || !price) throw new Error("Quantity and price are required");

  const { lastInsertRowid } = await client.execute(
    `INSERT INTO purchases (date, quantity, price, paymentMethod) VALUES (?, ?, ?, ?)`,
    [date, quantity, price, paymentMethod]
  );

  const { rows } = await client.execute("SELECT * FROM purchases WHERE id = ?", [lastInsertRowid]);
  return rows[0];
};

// ✅ Update stock (purchase record)
export const updateStock = async (id, updates) => {
  const { date, quantity, price, paymentMethod } = updates;

  await client.execute(
    `UPDATE purchases SET
      date = COALESCE(?, date),
      quantity = COALESCE(?, quantity),
      price = COALESCE(?, price),
      paymentMethod = COALESCE(?, paymentMethod),
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [date, quantity, price, paymentMethod, id]
  );

  const { rows } = await client.execute("SELECT * FROM purchases WHERE id = ?", [id]);
  return rows[0];
};

// ✅ Delete stock (purchase record)
export const deleteStock = async (id) => {
  await client.execute("DELETE FROM purchases WHERE id = ?", [id]);
  return { message: "Stock record deleted successfully", id };
};
