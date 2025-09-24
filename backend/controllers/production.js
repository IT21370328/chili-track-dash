import { db } from "../db.js";

// Add a production record
export const addProduction = (productionData, callback) => {
  const { date, kilosIn, kilosOut, color } = productionData;
  const expectedOut = kilosIn / 10; // Expected dry weight
  const surplus = kilosOut - expectedOut;

  const query = `
    INSERT INTO production (date, kilosIn, kilosOut, surplus, color) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [date, kilosIn, kilosOut, surplus, color], function (err) {
    if (err) return callback(err);
    db.get("SELECT * FROM production WHERE id = ?", [this.lastID], (err, row) => {
      if (err) return callback(err);
      callback(null, row);
    });
  });
};

// Get all production records
export const getProduction = (callback) => {
  db.all("SELECT * FROM production ORDER BY date DESC", [], callback);
};

// Get production summary
export const getProductionSummary = (callback) => {
  const query = `
    SELECT 
      COUNT(*) as totalRecords,
      SUM(kilosIn) as totalKilosIn,
      SUM(kilosOut) as totalKilosOut,
      SUM(surplus) as totalSurplus,
      MAX(surplus) as maxSurplus,
      MIN(surplus) as minSurplus
    FROM production
  `;

  db.get(query, [], (err, row) => {
    if (err) return callback(err);
    const summary = {
      totalRecords: row.totalRecords || 0,
      totalKilosIn: row.totalKilosIn ? parseFloat(row.totalKilosIn).toFixed(2) : "0.00",
      totalKilosOut: row.totalKilosOut ? parseFloat(row.totalKilosOut).toFixed(2) : "0.00",
      totalSurplus: row.totalSurplus ? parseFloat(row.totalSurplus).toFixed(2) : "0.00",
      maxSurplus: row.maxSurplus ? parseFloat(row.maxSurplus).toFixed(2) : "0.00",
      minSurplus: row.minSurplus ? parseFloat(row.minSurplus).toFixed(2) : "0.00",
    };
    callback(null, summary);
  });
};

// Get production by date range
export const getProductionByDateRange = (startDate, endDate, callback) => {
  const query = `
    SELECT * FROM production 
    WHERE date BETWEEN ? AND ? 
    ORDER BY date DESC
  `;
  db.all(query, [startDate, endDate], callback);
};

// Update production record
export const updateProduction = (id, productionData, callback) => {
  const { date, kilosIn, kilosOut, color } = productionData;
  const expectedOut = kilosIn / 10;
  const surplus = kilosOut - expectedOut;

  const query = `
    UPDATE production
    SET date = ?, kilosIn = ?, kilosOut = ?, surplus = ?, color = ?
    WHERE id = ?
  `;

  db.run(query, [date, kilosIn, kilosOut, surplus, color, id], function (err) {
    if (err) return callback(err);
    db.get("SELECT * FROM production WHERE id = ?", [id], (err, row) => {
      if (err) return callback(err);
      callback(null, row);
    });
  });
};

// Delete production record
export const deleteProduction = (id, callback) => {
  const query = `DELETE FROM production WHERE id = ?`;

  db.run(query, [id], function (err) {
    if (err) return callback(err);
    callback(null, { message: "Production record deleted successfully", id });
  });
};
