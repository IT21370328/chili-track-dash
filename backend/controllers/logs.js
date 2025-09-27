import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config(); // Load .env

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_API_KEY,
});

// ✅ Get all audit logs with optional filters
export const getAuditLogs = async (filters = {}) => {
  const { entity_type, admin_id, action } = filters;
  let sql = 'SELECT * FROM audit_logs WHERE 1=1';
  const args = [];

  if (entity_type) {
    sql += ' AND entity_type = ?';
    args.push(entity_type);
  }
  if (admin_id) {
    sql += ' AND admin_id = ?';
    args.push(admin_id);
  }
  if (action) {
    sql += ' AND action = ?';
    args.push(action);
  }

  sql += ' ORDER BY timestamp DESC';

  const { rows } = await client.execute({ sql, args });
  return rows || [];
};

// ✅ Get audit log by ID
export const getAuditLogById = async (id) => {
  if (!id) throw new Error("ID is required");

  const { rows } = await client.execute({
    sql: 'SELECT * FROM audit_logs WHERE id = ?',
    args: [id],
  });

  if (rows.length === 0) throw new Error("Audit log not found");
  return rows[0];
};