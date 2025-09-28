// src/utils/logHelper.ts

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export const logAction = (user: string, action: string, details: string) => {
  const timestamp = new Date().toISOString();
  const logEntry: AuditLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    user,
    action,
    details,
    timestamp,
  };
  const existingLogs: AuditLogEntry[] = JSON.parse(localStorage.getItem("auditLogs") || "[]");
  localStorage.setItem("auditLogs", JSON.stringify([...existingLogs, logEntry]));
};
