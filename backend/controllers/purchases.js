import { db } from "../db.js";

// Add a purchase
export function addPurchase(purchase, callback) {
  const { date, quantity, price, paymentMethod, color, supplier } = purchase;

  db.run(
    `INSERT INTO purchases 
       (date, quantity, price, paymentMethod, color, supplier) 
       VALUES (?, ?, ?, ?, ?, ?)`,
    [date, quantity, price, paymentMethod, color, supplier],
    function (err) {
      if (err) {
        console.error("Error inserting purchase:", err);
        return callback(err);
      }

      // Fetch the inserted row with the generated ID
      db.get("SELECT * FROM purchases WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          console.error("Error fetching inserted purchase:", err);
          return callback(err);
        }

        console.log("Inserted purchase:", row);
        callback(null, row);
      });
    }
  );
}

// Get all purchases
export function getPurchases(callback) {
  db.all("SELECT * FROM purchases ORDER BY date DESC", (err, rows) => {
    if (err) {
      console.error("Error fetching purchases:", err);
      return callback(err);
    }
    callback(null, rows);
  });
}

// Get summary (total cash, credit, and optionally by color)
export function getSummary(callback) {
  db.all(
    `SELECT paymentMethod, color, 
            SUM(quantity * price) as total, 
            SUM(quantity) as totalQuantity 
     FROM purchases 
     GROUP BY paymentMethod, color`,
    (err, rows) => {
      if (err) {
        console.error("Error fetching summary:", err);
        return callback(err);
      }

      // Initialize totals
      let summary = {
        totalCreditPurchases: 0,
        totalCashPurchases: 0,
        red: { quantity: 0, totalValue: 0 },
        green: { quantity: 0, totalValue: 0 },
      };

      rows.forEach((row) => {
        // By payment method
        if (row.paymentMethod === "credit") {
          summary.totalCreditPurchases += row.total;
        } else if (row.paymentMethod === "cash") {
          summary.totalCashPurchases += row.total;
        }

        // By color
        if (row.color === "red") {
          summary.red = { quantity: row.totalQuantity, totalValue: row.total };
        } else if (row.color === "green") {
          summary.green = { quantity: row.totalQuantity, totalValue: row.total };
        }
      });

      callback(null, summary);
    }
  );
}

// Update a purchase
export function updatePurchase(id, purchase, callback) {
  const { date, quantity, price, paymentMethod, color, supplier } = purchase;

  db.run(
    `UPDATE purchases 
     SET date = ?, quantity = ?, price = ?, paymentMethod = ?, color = ?, supplier = ?
     WHERE id = ?`,
    [date, quantity, price, paymentMethod, color, supplier, id],
    function (err) {
      if (err) {
        console.error("Error updating purchase:", err);
        return callback(err);
      }

      // Return the updated row
      db.get("SELECT * FROM purchases WHERE id = ?", [id], (err, row) => {
        if (err) {
          console.error("Error fetching updated purchase:", err);
          return callback(err);
        }

        console.log("Updated purchase:", row);
        callback(null, row);
      });
    }
  );
}

// ✅ Mark a purchase as paid (credit → cash)
export function markAsPaid(id, callback) {
  db.run(
    `UPDATE purchases 
     SET paymentMethod = 'cash' 
     WHERE id = ? AND paymentMethod = 'credit'`,
    [id],
    function (err) {
      if (err) {
        console.error("Error marking purchase as paid:", err);
        return callback(err);
      }

      // Return the updated row
      db.get("SELECT * FROM purchases WHERE id = ?", [id], (err, row) => {
        if (err) {
          console.error("Error fetching updated purchase:", err);
          return callback(err);
        }

        console.log("Purchase marked as paid:", row);
        callback(null, row);
      });
    }
  );
}

// Delete a purchase
export function deletePurchase(id, callback) {
  db.run("DELETE FROM purchases WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting purchase:", err);
      return callback(err);
    }

    console.log(`Deleted purchase with ID ${id}`);
    callback(null, { message: "Purchase deleted successfully", id });
  });
}
