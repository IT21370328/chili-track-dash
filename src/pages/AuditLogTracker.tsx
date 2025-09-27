import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ActionLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

interface AuditLog {
  id: number;
  action: string;
  timestamp: string;
}

const API_URL = "https://chili-track-dash.onrender.com";

const ActionLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [auditId, setAuditId] = useState("");
  const [auditLog, setAuditLog] = useState<AuditLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedLogs: ActionLog[] = JSON.parse(localStorage.getItem("actionLogs") || "[]");
    setLogs(storedLogs);
  }, []);

  const fetchAuditLog = async () => {
    if (!auditId) {
      toast({ title: "Error", description: "Please enter a valid Audit Log ID", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/audit-logs/${auditId}`);
      if (!res.ok) throw new Error("Failed to fetch audit log");
      const data = await res.json();
      setAuditLog(data);
      toast({ title: "✅ Success", description: `Fetched audit log ID: ${auditId}` });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  const clearLogs = () => {
    if (confirm("Are you sure you want to clear all local action logs?")) {
      localStorage.setItem("actionLogs", JSON.stringify([]));
      setLogs([]);
      toast({ title: "🗑️ Cleared", description: "Local action logs cleared" });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Action Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <Button onClick={clearLogs} variant="outline">Clear Logs</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                    No action logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server-Side Audit Log Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              type="number"
              placeholder="Enter Audit Log ID"
              value={auditId}
              onChange={(e) => setAuditId(e.target.value)}
              className="w-full sm:w-40"
            />
            <Button onClick={fetchAuditLog}>Fetch Audit Log</Button>
          </div>
          {auditLog && (
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>ID:</strong> {auditLog.id}</p>
              <p><strong>Action:</strong> {auditLog.action}</p>
              <p><strong>Timestamp:</strong> {new Date(auditLog.timestamp).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionLogs;