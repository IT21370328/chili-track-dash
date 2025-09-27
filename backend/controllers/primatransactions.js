import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Add Prima Transaction
export const addPrimaTransaction = async (transactionData) => {
  const { date, kilosDelivered, amount, paymentStatus, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo } = transactionData;

  // Validate required fields
  if (!date || !kilosDelivered || !amount || !paymentStatus || !productCode || !batchNo || !truckNo || !dateOfExpiration) {
    throw new Error("Missing required fields: date, kilosDelivered, amount, paymentStatus, productCode, batchNo, truckNo, or dateOfExpiration");
  }

  // Validate data types
  if (typeof date !== "string") throw new Error(`Invalid data type for date: expected string, got ${typeof date}`);
  if (typeof kilosDelivered !== "number" || isNaN(kilosDelivered) || kilosDelivered <= 0) {
    throw new Error(`Invalid data type for kilosDelivered: expected positive number, got ${typeof kilosDelivered} (${kilosDelivered})`);
  }
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid data type for amount: expected positive number, got ${typeof amount} (${amount})`);
  }
  if (typeof paymentStatus !== "string") throw new Error(`Invalid data type for paymentStatus: expected string, got ${typeof paymentStatus}`);
  if (poNumber != null && typeof poNumber !== "string") throw new Error(`Invalid data type for poNumber: expected string or null, got ${typeof poNumber}`);
  if (typeof dateOfExpiration !== "string") throw new Error(`Invalid data type for dateOfExpiration: expected string, got ${typeof dateOfExpiration}`);
  if (typeof productCode !== "string") throw new Error(`Invalid data type for productCode: expected string, got ${typeof productCode}`);
  if (typeof batchNo !== "string") throw new Error(`Invalid data type for batchNo: expected string, got ${typeof batchNo}`);
  if (numberOfBoxes != null && (typeof numberOfBoxes !== "number" || !Number.isInteger(numberOfBoxes) || numberOfBoxes < 0)) {
    throw new Error(`Invalid data type for numberOfBoxes: expected non-negative integer or null, got ${typeof numberOfBoxes} (${numberOfBoxes})`);
  }
  if (typeof truckNo !== "string") throw new Error(`Invalid data type for truckNo: expected string, got ${typeof truckNo}`);

  try {
    // Validate poNumber if provided
    let poId = null;
    if (poNumber) {
      const { rows: poRows } = await db.execute(
        "SELECT id, totalKilos FROM pos WHERE poNumber = ?",
        [poNumber]
      );
      if (!poRows[0]) throw new Error(`PO number ${poNumber} not found`);
      poId = poRows[0].id;
      const totalKilos = poRows[0].totalKilos;

      // Validate kilosDelivered
      const { rows: transactionRows } = await db.execute(
        "SELECT SUM(kilosDelivered) as delivered FROM primatransactions WHERE poNumber = ? AND paymentStatus != 'Rejected'",
        [poNumber]
      );
      const deliveredSoFar = transactionRows[0]?.delivered || 0;
      if (kilosDelivered + deliveredSoFar > totalKilos) {
        throw new Error(`Delivery exceeds PO total: ${kilosDelivered + deliveredSoFar}kg > ${totalKilos}kg`);
      }
    }

    console.log("Inserting transaction:", {
      date,
      kilosDelivered,
      amount,
      paymentStatus,
      poId,
      poNumber,
      dateOfExpiration,
      productCode,
      batchNo,
      numberOfBoxes,
      truckNo,
    });

    const { lastInsertRowid } = await db.execute(
      `INSERT INTO primatransactions 
        (date, kilosDelivered, amount, paymentStatus, poId, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, kilosDelivered, amount, paymentStatus, poId, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo]
    );

    const { rows } = await db.execute(
      "SELECT * FROM primatransactions WHERE id = ?",
      [lastInsertRowid]
    );

    return rows[0];
  } catch (error) {
    console.error("Error in addPrimaTransaction:", error.message);
    throw error;
  }
};

// Get all Prima Transactions
export const getPrimaTransactions = async () => {
  try {
    const { rows } = await db.execute(
      "SELECT * FROM primatransactions ORDER BY date DESC"
    );
    return rows;
  } catch (error) {
    console.error("Error in getPrimaTransactions:", error.message);
    throw error;
  }
};

// Update Prima Transaction
export const updatePrimaTransaction = async (id, transactionData) => {
  const { date, kilosDelivered, amount, paymentStatus, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo } = transactionData;

  // Validate required fields
  if (!date || !kilosDelivered || !amount || !paymentStatus || !productCode || !batchNo || !truckNo || !dateOfExpiration) {
    throw new Error("Missing required fields: date, kilosDelivered, amount, paymentStatus, productCode, batchNo, truckNo, or dateOfExpiration");
  }

  // Validate data types
  if (typeof date !== "string") throw new Error(`Invalid data type for date: expected string, got ${typeof date}`);
  if (typeof kilosDelivered !== "number" || isNaN(kilosDelivered) || kilosDelivered <= 0) {
    throw new Error(`Invalid data type for kilosDelivered: expected positive number, got ${typeof kilosDelivered} (${kilosDelivered})`);
  }
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid data type for amount: expected positive number, got ${typeof amount} (${amount})`);
  }
  if (typeof paymentStatus !== "string") throw new Error(`Invalid data type for paymentStatus: expected string, got ${typeof paymentStatus}`);
  if (poNumber != null && typeof poNumber !== "string") throw new Error(`Invalid data type for poNumber: expected string or null, got ${typeof poNumber}`);
  if (typeof dateOfExpiration !== "string") throw new Error(`Invalid data type for dateOfExpiration: expected string, got ${typeof dateOfExpiration}`);
  if (typeof productCode !== "string") throw new Error(`Invalid data type for productCode: expected string, got ${typeof productCode}`);
  if (typeof batchNo !== "string") throw new Error(`Invalid data type for batchNo: expected string, got ${typeof batchNo}`);
  if (numberOfBoxes != null && (typeof numberOfBoxes !== "number" || !Number.isInteger(numberOfBoxes) || numberOfBoxes < 0)) {
    throw new Error(`Invalid data type for numberOfBoxes: expected non-negative integer or null, got ${typeof numberOfBoxes} (${numberOfBoxes})`);
  }
  if (typeof truckNo !== "string") throw new Error(`Invalid data type for truckNo: expected string, got ${typeof truckNo}`);

  try {
    // Validate poNumber if provided
    let poId = null;
    if (poNumber) {
      const { rows: poRows } = await db.execute(
        "SELECT id, totalKilos FROM pos WHERE poNumber = ?",
        [poNumber]
      );
      if (!poRows[0]) throw new Error(`PO number ${poNumber} not found`);
      poId = poRows[0].id;
      const totalKilos = poRows[0].totalKilos;

      // Validate kilosDelivered
      const { rows: transactionRows } = await db.execute(
        "SELECT SUM(kilosDelivered) as delivered FROM primatransactions WHERE poNumber = ? AND paymentStatus != 'Rejected' AND id != ?",
        [poNumber, id]
      );
      const deliveredSoFar = transactionRows[0]?.delivered || 0;
      if (kilosDelivered + deliveredSoFar > totalKilos) {
        throw new Error(`Delivery exceeds PO total: ${kilosDelivered + deliveredSoFar}kg > ${totalKilos}kg`);
      }
    }

    console.log("Updating transaction:", {
      id,
      date,
      kilosDelivered,
      amount,
      paymentStatus,
      poId,
      poNumber,
      dateOfExpiration,
      productCode,
      batchNo,
      numberOfBoxes,
      truckNo,
    });

    await db.execute(
      `UPDATE primatransactions 
       SET date = ?, kilosDelivered = ?, amount = ?, paymentStatus = ?, poId = ?, poNumber = ?, 
           dateOfExpiration = ?, productCode = ?, batchNo = ?, numberOfBoxes = ?, truckNo = ?
       WHERE id = ?`,
      [date, kilosDelivered, amount, paymentStatus, poId, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo, id]
    );

    const { rows } = await db.execute(
      "SELECT * FROM primatransactions WHERE id = ?",
      [id]
    );

    if (!rows[0]) throw new Error(`Transaction with id ${id} not found after update`);
    return rows[0];
  } catch (error) {
    console.error("Error in updatePrimaTransaction:", error.message);
    throw error;
  }
};

// Update transaction status
export const updatePrimaTransactionStatus = async (id, newStatus) => {
  if (typeof newStatus !== "string") throw new Error(`Invalid data type for newStatus: expected string, got ${typeof newStatus}`);

  try {
    const { rows } = await db.execute(
      "SELECT * FROM primatransactions WHERE id = ?",
      [id]
    );

    if (!rows[0]) throw new Error(`Transaction with id ${id} not found`);

    const currentStatus = rows[0].paymentStatus;
    const allowedTransitions = {
      Pending: ["Approved", "Rejected"],
      Approved: ["Paid"],
      Rejected: [], // No transitions allowed
      Paid: [], // No transitions allowed
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Cannot change status from ${currentStatus} to ${newStatus}`);
    }

    await db.execute(
      "UPDATE primatransactions SET paymentStatus = ? WHERE id = ?",
      [newStatus, id]
    );

    const { rows: updatedRows } = await db.execute(
      "SELECT * FROM primatransactions WHERE id = ?",
      [id]
    );

    return updatedRows[0];
  } catch (error) {
    console.error("Error in updatePrimaTransactionStatus:", error.message);
    throw error;
  }
};

// Delete a Prima Transaction
export const deletePrimaTransaction = async (id) => {
  if (typeof id !== "number" && !Number.isInteger(Number(id))) throw new Error(`Invalid data type for id: expected number, got ${typeof id}`);

  try {
    const { rowsAffected } = await db.execute(
      "DELETE FROM primatransactions WHERE id = ?",
      [id]
    );
    if (rowsAffected === 0) throw new Error(`Transaction with id ${id} not found`);
    return { message: "Prima transaction deleted successfully", id };
  } catch (error) {
    console.error("Error in deletePrimaTransaction:", error.message);
    throw error;
  }
};