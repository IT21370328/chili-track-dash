import { useEffect, useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuditLogEntry } from "@/pages/logHelper";

interface SummaryMetrics {
  totalLogs: number;
  logsToday: number;
  uniqueUsers: number;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filterRange, setFilterRange] = useState({ start: "", end: "" });
  const today = new Date().toISOString().split("T")[0]; // For filtering logs by today's date

  // Fetch logs from localStorage
  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
    setLogs(storedLogs);
  }, []);

  // Filter logs based on date range
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!filterRange.start && !filterRange.end) return true;
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      if (filterRange.start && logDate < filterRange.start) return false;
      if (filterRange.end && logDate > filterRange.end) return false;
      return true;
    });
  }, [logs, filterRange]);

  // Calculate summary metrics based on filtered logs
  const summaryMetrics: SummaryMetrics = useMemo(() => {
    const totalLogs = filteredLogs.length;
    const logsToday = filteredLogs.filter(
      (log) => new Date(log.timestamp).toISOString().split("T")[0] === today
    ).length;
    const uniqueUsers = new Set(filteredLogs.map((log) => log.user)).size;
    return { totalLogs, logsToday, uniqueUsers };
  }, [filteredLogs, today]);

  // Summary Card component
  const SummaryCard = ({
    title,
    value,
    icon: Icon,
    description,
  }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
  }) => (
    <div className="bg-white/90 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">System Audit Logs</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 grid-rows-1">
          <SummaryCard
            title="Total Logs"
            value={summaryMetrics.totalLogs}
            icon={FileText}
            description="All audit log entries"
          />
          <SummaryCard
            title="Logs Today"
            value={summaryMetrics.logsToday}
            icon={FileText}
            description={`Entries from ${today}`}
          />
          <SummaryCard
            title="Unique Users"
            value={summaryMetrics.uniqueUsers}
            icon={FileText}
            description="Distinct users in logs"
          />
        </div>

        {/* Filter Card */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200/50 shadow-lg flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <Label>Filter Start Date</Label>
            <Input
              type="date"
              value={filterRange.start}
              onChange={(e) => setFilterRange({ ...filterRange, start: e.target.value })}
              max={today}
            />
          </div>
          <div>
            <Label>Filter End Date</Label>
            <Input
              type="date"
              value={filterRange.end}
              onChange={(e) => setFilterRange({ ...filterRange, end: e.target.value })}
              max={today}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterRange({ start: "", end: "" })}
            className="mt-2 sm:mt-0"
          >
            Clear Filter
          </Button>
        </Card>

        {/* Logs Table */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-x-auto border border-slate-200/50 shadow-lg">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead className="font-semibold text-sm text-slate-600">Time</TableHead>
                <TableHead className="font-semibold text-sm text-slate-600">User</TableHead>
                <TableHead className="font-semibold text-sm text-slate-600">Action</TableHead>
                <TableHead className="font-semibold text-sm text-slate-600">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-200"
                  >
                    <TableCell className="text-slate-800">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="text-slate-800">{log.user}</TableCell>
                    <TableCell className="text-slate-800">{log.action}</TableCell>
                    <TableCell className="text-slate-800">{log.details}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                    No logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogs;