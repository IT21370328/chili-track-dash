import { useState, useEffect } from 'react';
import axios from 'axios';

const AuditLogTracker = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    entity_type: '',
    action: '',
    admin_id: '',
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState('');

  // Fetch audit logs based on filters
  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/audit-logs', {
        params: filters,
      });
      setLogs(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch audit logs');
    }
  };

  // Fetch a single log by ID
  const fetchLogById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/audit-logs/${id}`);
      setSelectedLog(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch audit log');
    }
  };

  // Load logs on mount and when filters change
  useEffect(() => {
    fetchLogs();
  }, [filters]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ entity_type: '', action: '', admin_id: '' });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audit Log Tracker</h1>

      {/* Filter Form */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Entity Type</label>
            <select
              name="entity_type"
              value={filters.entity_type}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border rounded"
            >
              <option value="">All</option>
              <option value="purchases">Purchases</option>
              <option value="expenses">Expenses</option>
              <option value="pettycash">Petty Cash</option>
              <option value="production">Production</option>
              <option value="pos">POs</option>
              <option value="primatransactions">Prima Transactions</option>
              <option value="employees">Employees</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border rounded"
            >
              <option value="">All</option>
              <option value="ADD">Add</option>
              <option value="EDIT">Edit</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Admin ID</label>
            <input
              type="number"
              name="admin_id"
              value={filters.admin_id}
              onChange={handleFilterChange}
              className="mt-1 block w-full p-2 border rounded"
              placeholder="Enter Admin ID"
            />
          </div>
        </div>
        <button
          onClick={resetFilters}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Reset Filters
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">Entity Type</th>
              <th className="px-4 py-2 border">Entity ID</th>
              <th className="px-4 py-2 border">Admin ID</th>
              <th className="px-4 py-2 border">Timestamp</th>
              <th className="px-4 py-2 border">Details</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 border">{log.id}</td>
                <td className="px-4 py-2 border">{log.action}</td>
                <td className="px-4 py-2 border">{log.entity_type}</td>
                <td className="px-4 py-2 border">{log.entity_id}</td>
                <td className="px-4 py-2 border">{log.admin_id || 'N/A'}</td>
                <td className="px-4 py-2 border">{log.timestamp}</td>
                <td className="px-4 py-2 border">{log.details}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => fetchLogById(log.id)}
                    className="text-blue-500 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Log Details */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Audit Log Details</h2>
            <p><strong>ID:</strong> {selectedLog.id}</p>
            <p><strong>Action:</strong> {selectedLog.action}</p>
            <p><strong>Entity Type:</strong> {selectedLog.entity_type}</p>
            <p><strong>Entity ID:</strong> {selectedLog.entity_id}</p>
            <p><strong>Admin ID:</strong> {selectedLog.admin_id || 'N/A'}</p>
            <p><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
            <p><strong>Details:</strong> {selectedLog.details}</p>
            <button
              onClick={() => setSelectedLog(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogTracker;