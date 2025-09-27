import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Add Prima Transaction
export const addPrimaTransaction = async (transactionData) => {
  const { date, kilosDelivered, amount, paymentStatus, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo } = transactionData;

  if (!poNumber) throw new Error("poNumber is required");
  if (!date || !kilosDelivered || !amount || !paymentStatus || !productCode || !batchNo || !truckNo || !dateOfExpiration) {
    throw new Error("Missing required fields: date, kilosDelivered, amount, paymentStatus, productCode, batchNo, truckNo, or dateOfExpiration");
  }

  try {
    const { rows: poRows } = await client.execute(
      "SELECT id, totalKilos FROM pos WHERE poNumber = ?",
      [poNumber]
    );

    if (!poRows[0]) throw new Error(`PO number ${poNumber} not found`);

    const poId = poRows[0].id;
    const totalKilos = poRows[0].totalKilos;

    // Validate kilosDelivered
    const { rows: transactionRows } = await client.execute(
      "SELECT SUM(kilosDelivered) as delivered FROM primatransactions WHERE poNumber = ? AND paymentStatus != 'Rejected'",
      [poNumber]
    );
    const deliveredSoFar = transactionRows[0]?.delivered || 0;
    if (kilosDelivered + deliveredSoFar > totalKilos) {
      throw new Error(`Delivery exceeds PO total: ${kilosDelivered + deliveredSoFar}kg > ${totalKilos}kg`);
    }

    console.log("Inserting transaction:", { date, kilosDelivered, amount, paymentStatus, poId, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo });

    const { lastInsertRowid } = await client.execute(
      `INSERT INTO primatransactions 
        (date, kilosDelivered, amount, paymentStatus, poId, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, kilosDelivered, amount, paymentStatus, poId, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo]
    );

    const { rows } = await client.execute(
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
  const { rows } = await client.execute(
    "SELECT * FROM primatransactions ORDER BY date DESC"
  );
  return rows;
};

// Update Prima Transaction
export const updatePrimaTransaction = async (id, transactionData) => {
  const { date, kilosDelivered, amount, paymentStatus, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo } = transactionData;

  try {
    const { rows: poRows } = await client.execute(
      "SELECT id FROM pos WHERE poNumber = ?",
      [poNumber]
    );

    if (!poRows[0]) throw new Error(`PO number ${poNumber} not found`);
    const poId = poRows[0].id;

    await client.execute(
      `UPDATE primatransactions 
       SET date = ?, kilosDelivered = ?, amount = ?, paymentStatus = ?, poId = ?, poNumber = ?, 
           dateOfExpiration = ?, productCode = ?, batchNo = ?, numberOfBoxes = ?, truckNo = ?
       WHERE id = ?`,
      [date, kilosDelivered, amount, paymentStatus, poId, poNumber, dateOfExpiration, productCode, batchNo, numberOfBoxes, truckNo, id]
    );

    const { rows } = await client.execute(
      "SELECT * FROM primatransactions WHERE id = ?",
      [id]
    );

    return rows[0];
  } catch (error) {
    console.error("Error in updatePrimaTransaction:", error.message);
    throw error;
  }
};

// Update transaction status
export const updatePrimaTransactionStatus = async (id, newStatus) => {
  const { rows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [id]
  );

  if (!rows[0]) throw new Error("Transaction not found");

  const currentStatus = rows[0].paymentStatus;
  const allowedTransitions = { Pending: ["Approved", "Rejected"], Approved: ["Paid"] };

  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Cannot change status from ${currentStatus} to ${newStatus}`);
  }

  await client.execute(
    "UPDATE primatransactions SET paymentStatus = ? WHERE id = ?",
    [newStatus, id]
  );

  const { rows: updatedRows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [id]
  );

  return updatedRows[0];
};

// Delete a Prima Transaction
export const deletePrimaTransaction = async (id) => {
  await client.execute("DELETE FROM primatransactions WHERE id = ?", [id]);
  return { message: "Prima transaction deleted successfully", id };
};