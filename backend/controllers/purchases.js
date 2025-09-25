import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Add a purchase
export const addPurchase = async (purchase) => {
  const { date, quantity, price, paymentMethod, color, supplier } = purchase;

  const { lastInsertRowid } = await client.execute(
    `INSERT INTO purchases 
       (date, quantity, price, paymentMethod, color, supplier) 
       VALUES (?, ?, ?, ?, ?, ?)`,
    [date, quantity, price, paymentMethod, color, supplier]
  );

  const { rows } = await client.execute(
    "SELECT * FROM purchases WHERE id = ?",
    [lastInsertRowid]
  );

  return rows[0];
};

// Get all purchases
export const getPurchases = async () => {
  const { rows } = await client.execute(
    "SELECT * FROM purchases ORDER BY date DESC"
  );
  return rows;
};

// Get purchase summary
export const getSummary = async () => {
  const { rows } = await client.execute(
    `SELECT paymentMethod, color, 
            SUM(quantity * price) as total, 
            SUM(quantity) as totalQuantity 
     FROM purchases 
     GROUP BY paymentMethod, color`
  );

  let summary = {
    totalCreditPurchases: 0,
    totalCashPurchases: 0,
    red: { quantity: 0, totalValue: 0 },
    green: { quantity: 0, totalValue: 0 },
  };

  rows.forEach((row) => {
    // By payment method
    if (row.paymentMethod === "credit") summary.totalCreditPurchases += row.total;
    else if (row.paymentMethod === "cash") summary.totalCashPurchases += row.total;

    // By color
    if (row.color === "red") summary.red = { quantity: row.totalQuantity, totalValue: row.total };
    else if (row.color === "green") summary.green = { quantity: row.totalQuantity, totalValue: row.total };
  });

  return summary;
};

// Update a purchase
export const updatePurchase = async (id, purchase) => {
  const { date, quantity, price, paymentMethod, color, supplier } = purchase;

  await client.execute(
    `UPDATE purchases 
     SET date = ?, quantity = ?, price = ?, paymentMethod = ?, color = ?, supplier = ?
     WHERE id = ?`,
    [date, quantity, price, paymentMethod, color, supplier, id]
  );

  const { rows } = await client.execute("SELECT * FROM purchases WHERE id = ?", [id]);
  return rows[0];
};

// Mark a purchase as paid (credit → cash)
export const markAsPaid = async (id) => {
  await client.execute(
    `UPDATE purchases 
     SET paymentMethod = 'cash' 
     WHERE id = ? AND paymentMethod = 'credit'`,
    [id]
  );

  const { rows } = await client.execute("SELECT * FROM purchases WHERE id = ?", [id]);
  return rows[0];
};

// Delete a purchase
export const deletePurchase = async (id) => {
  await client.execute("DELETE FROM purchases WHERE id = ?", [id]);
  return { message: "Purchase deleted successfully", id };
};
