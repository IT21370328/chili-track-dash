import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// Validate payment status
const validStatuses = ["Pending", "Approved", "Paid", "Rejected"];
const validatePaymentStatus = (status) => {
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid payment status: ${status}. Must be one of ${validStatuses.join(", ")}`);
  }
};

// Validate number of boxes
const validateNumberOfBoxes = (numberOfBoxes) => {
  if (numberOfBoxes != null && (!Number.isInteger(numberOfBoxes) || numberOfBoxes < 0)) {
    throw new Error("Number of boxes must be a non-negative integer or null");
  }
};

// Validate poId exists
const validatePoId = async (poId) => {
  const { rows } = await client.execute("SELECT id FROM pos WHERE id = ?", [poId]);
  if (rows.length === 0) {
    throw new Error(`PO with id ${poId} does not exist`);
  }
};

// Add a prima transaction
export const addPrimaTransaction = async (transactionData) => {
  const { poId, poNumber, date, kilosDelivered, amount, paymentStatus = "Pending", numberOfBoxes, dateOfExpiration, productCode, batchNo, truckNo } = transactionData;

  // Validations
  if (!poId || !Number.isInteger(poId)) {
    throw new Error("Valid poId is required");
  }
  await validatePoId(poId);
  if (poNumber) {
    const { rows } = await client.execute("SELECT poNumber FROM pos WHERE poNumber = ?", [poNumber]);
    if (rows.length === 0) {
      throw new Error(`PO with poNumber ${poNumber} does not exist`);
    }
  }
  if (!date || !kilosDelivered || !amount) {
    throw new Error("Date, kilosDelivered, and amount are required");
  }
  if (kilosDelivered <= 0 || amount <= 0) {
    throw new Error("Kilos delivered and amount must be positive numbers");
  }
  validatePaymentStatus(paymentStatus);
  validateNumberOfBoxes(numberOfBoxes);

  const { lastInsertRowid } = await client.execute(
    `INSERT INTO primatransactions (poId, poNumber, date, kilosDelivered, amount, paymentStatus, numberOfBoxes, dateOfExpiration, productCode, batchNo, truckNo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [poId, poNumber || null, date, kilosDelivered, amount, paymentStatus, numberOfBoxes, dateOfExpiration || null, productCode || null, batchNo || null, truckNo || null]
  );

  const { rows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [lastInsertRowid]
  );

  return rows[0];
};

// Get all prima transactions
export const getPrimaTransactions = async () => {
  const { rows } = await client.execute(
    "SELECT * FROM primatransactions ORDER BY date DESC"
  );
  return rows;
};

// Get prima transactions summary
export const getPrimaTransactionsSummary = async () => {
  const { rows } = await client.execute(
    `SELECT 
       COUNT(*) as totalRecords,
       SUM(kilosDelivered) as totalKilosDelivered,
       SUM(amount) as totalAmount,
       SUM(CASE WHEN paymentStatus = 'Paid' THEN amount ELSE 0 END) as paidAmount,
       SUM(CASE WHEN paymentStatus = 'Approved' THEN amount ELSE 0 END) as pendingApprovalAmount,
       SUM(CASE WHEN paymentStatus = 'Rejected' THEN kilosDelivered ELSE 0 END) as rejectedKilos
     FROM primatransactions`
  );

  const row = rows[0] || {};
  return {
    totalRecords: row.totalRecords || 0,
    totalKilosDelivered: row.totalKilosDelivered ? parseFloat(row.totalKilosDelivered).toFixed(2) : "0.00",
    totalAmount: row.totalAmount ? parseFloat(row.totalAmount).toFixed(2) : "0.00",
    paidAmount: row.paidAmount ? parseFloat(row.paidAmount).toFixed(2) : "0.00",
    pendingApprovalAmount: row.pendingApprovalAmount ? parseFloat(row.pendingApprovalAmount).toFixed(2) : "0.00",
    rejectedKilos: row.rejectedKilos ? parseFloat(row.rejectedKilos).toFixed(2) : "0.00",
  };
};

// Get prima transactions by date range
export const getPrimaTransactionsByDateRange = async (startDate, endDate) => {
  const { rows } = await client.execute(
    `SELECT * FROM primatransactions 
     WHERE date BETWEEN ? AND ?
     ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows;
};

// Update prima transaction
export const updatePrimaTransaction = async (id, transactionData) => {
  const { poId, poNumber, date, kilosDelivered, amount, paymentStatus, numberOfBoxes, dateOfExpiration, productCode, batchNo, truckNo } = transactionData;

  // Validations
  if (!poId || !Number.isInteger(poId)) {
    throw new Error("Valid poId is required");
  }
  await validatePoId(poId);
  if (poNumber) {
    const { rows } = await client.execute("SELECT poNumber FROM pos WHERE poNumber = ?", [poNumber]);
    if (rows.length === 0) {
      throw new Error(`PO with poNumber ${poNumber} does not exist`);
    }
  }
  if (!date || !kilosDelivered || !amount) {
    throw new Error("Date, kilosDelivered, and amount are required");
  }
  if (kilosDelivered <= 0 || amount <= 0) {
    throw new Error("Kilos delivered and amount must be positive numbers");
  }
  validatePaymentStatus(paymentStatus);
  validateNumberOfBoxes(numberOfBoxes);

  await client.execute(
    `UPDATE primatransactions
     SET poId = ?, poNumber = ?, date = ?, kilosDelivered = ?, amount = ?, paymentStatus = ?, numberOfBoxes = ?, dateOfExpiration = ?, productCode = ?, batchNo = ?, truckNo = ?
     WHERE id = ?`,
    [poId, poNumber || null, date, kilosDelivered, amount, paymentStatus, numberOfBoxes, dateOfExpiration || null, productCode || null, batchNo || null, truckNo || null, id]
  );

  const { rows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [id]
  );

  return rows[0];
};

// Update prima transaction status
export const updatePrimaTransactionStatus = async (id, paymentStatus) => {
  validatePaymentStatus(paymentStatus);

  const { rows: currentRows } = await client.execute(
    "SELECT paymentStatus FROM primatransactions WHERE id = ?",
    [id]
  );
  if (currentRows.length === 0) {
    throw new Error(`Transaction with id ${id} does not exist`);
  }

  const currentStatus = currentRows[0].paymentStatus;
  const validTransitions = {
    Pending: ["Approved", "Rejected"],
    Approved: ["Paid"],
    Paid: [],
    Rejected: [],
  };

  if (!validTransitions[currentStatus].includes(paymentStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${paymentStatus}`);
  }

  await client.execute(
    "UPDATE primatransactions SET paymentStatus = ? WHERE id = ?",
    [paymentStatus, id]
  );

  const { rows } = await client.execute(
    "SELECT * FROM primatransactions WHERE id = ?",
    [id]
  );

  return rows[0];
};

// Delete prima transaction
export const deletePrimaTransaction = async (id) => {
  const { rows } = await client.execute(
    "SELECT id FROM primatransactions WHERE id = ?",
    [id]
  );
  if (rows.length === 0) {
    throw new Error(`Transaction with id ${id} does not exist`);
  }

  await client.execute("DELETE FROM primatransactions WHERE id = ?", [id]);
  return { message: "Prima transaction deleted successfully", id };
};