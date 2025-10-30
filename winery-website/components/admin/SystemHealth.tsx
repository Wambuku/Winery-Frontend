import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SystemStatus {
  api: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    uptime: number;
    lastCheck: string;
  };
  database: {
    status: 'healthy' | 'warning' | 'error';
    connectionCount: number;
    queryTime: number;
    lastCheck: string;
  };
  payment: {
    status: 'healthy' | 'warning' | 'error';
    mpesaStatus: 'online' | 'offline';
    lastTransaction: string;
    successRate: number;
  };
  storage: {
    status: 'healthy' | 'warning' | 'error';
    usedSpace: number;
    totalSpace: number;
    lastBackup: string;
  };
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  stack?: string;
  resolved: boolean;
}

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
}

const SystemHealth: React.FC = () => {
  const { user } = useAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  useEffect(() => {
    fetchSystemHealth();
    fetchErrorLogs();
    fetchPerformanceMetrics();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchSystemHealth();
        fetchPerformanceMetrics();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedTimeRange]);

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/system-health');
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      const data = await response.json();
      setSystemStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchErrorLogs = async () => {
    try {
      const response = await fetch(`/api/admin/error-logs?timeRange=${selectedTimeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch error logs');
      }
      const data = await response.json();
      setErrorLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch error logs');
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/performance-metrics?timeRange=${selectedTimeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }
      const data = await response.json();
      setPerformanceMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const markErrorResolved = async (errorId: string) => {
    try {
      const response = await fetch(`/api/admin/error-logs/${errorId}/resolve`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to mark error as resolved');
      }
      await fetchErrorLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve error');
    }
  };

  const runHealthCheck = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/run-health-check', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to run health check');
      }
      await fetchSystemHealth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run health check');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading && !systemStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-600 mt-2">Monitor system performance and error tracking</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Auto Refresh</span>
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button
              onClick={runHealthCheck}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Run Health Check
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {systemStatus && (
          <>
            {/* System Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SystemStatusCard
                title="API Status"
                status={systemStatus.api.status}
                details={[
                  `Response Time: ${systemStatus.api.responseTime}ms`,
                  `Uptime: ${(systemStatus.api.uptime * 100).toFixed(2)}%`,
                  `Last Check: ${new Date(systemStatus.api.lastCheck).toLocaleTimeString()}`
                ]}
              />
              <SystemStatusCard
                title="Database"
                status={systemStatus.database.status}
                details={[
                  `Connections: ${systemStatus.database.connectionCount}`,
                  `Query Time: ${systemStatus.database.queryTime}ms`,
                  `Last Check: ${new Date(systemStatus.database.lastCheck).toLocaleTimeString()}`
                ]}
              />
              <SystemStatusCard
                title="Payment System"
                status={systemStatus.payment.status}
                details={[
                  `M-Pesa: ${systemStatus.payment.mpesaStatus}`,
                  `Success Rate: ${(systemStatus.payment.successRate * 100).toFixed(1)}%`,
                  `Last Transaction: ${new Date(systemStatus.payment.lastTransaction).toLocaleTimeString()}`
                ]}
              />
              <SystemStatusCard
                title="Storage"
                status={systemStatus.storage.status}
                details={[
                  `Used: ${((systemStatus.storage.usedSpace / systemStatus.storage.totalSpace) * 100).toFixed(1)}%`,
                  `Free: ${(systemStatus.storage.totalSpace - systemStatus.storage.usedSpace).toFixed(1)}GB`,
                  `Last Backup: ${new Date(systemStatus.storage.lastBackup).toLocaleDateString()}`
                ]}
              />
            </div>

            {/* Performance Metrics Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Response Time (ms)</h4>
                  <div className="h-32 flex items-end justify-between space-x-1">
                    {performanceMetrics.slice(-20).map((metric, index) => {
                      const maxResponseTime = Math.max(...performanceMetrics.map(m => m.responseTime));
                      const height = (metric.responseTime / maxResponseTime) * 100;
                      
                      return (
                        <div
                          key={index}
                          className="bg-blue-500 rounded-t min-h-[4px] flex-1"
                          style={{ height: `${height}%` }}
                          title={`${new Date(metric.timestamp).toLocaleTimeString()}: ${metric.responseTime}ms`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Active Users</h4>
                  <div className="h-32 flex items-end justify-between space-x-1">
                    {performanceMetrics.slice(-20).map((metric, index) => {
                      const maxUsers = Math.max(...performanceMetrics.map(m => m.activeUsers));
                      const height = maxUsers > 0 ? (metric.activeUsers / maxUsers) * 100 : 0;
                      
                      return (
                        <div
                          key={index}
                          className="bg-green-500 rounded-t min-h-[4px] flex-1"
                          style={{ height: `${height}%` }}
                          title={`${new Date(metric.timestamp).toLocaleTimeString()}: ${metric.activeUsers} users`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error Logs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Error Logs</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {errorLogs.map((log) => (
              <div key={log.id} className={`p-4 ${log.resolved ? 'bg-gray-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.level === 'error' 
                          ? 'bg-red-100 text-red-800'
                          : log.level === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{log.source}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {log.resolved && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{log.message}</p>
                    {log.stack && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer">Stack Trace</summary>
                        <pre className="mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                  {!log.resolved && (
                    <button
                      onClick={() => markErrorResolved(log.id)}
                      className="ml-4 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
            {errorLogs.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No errors found in the selected time range</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SystemStatusCardProps {
  title: string;
  status: 'healthy' | 'warning' | 'error';
  details: string[];
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ title, status, details }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className={`${getStatusColor()} rounded-lg p-3 text-white text-2xl`}>
          {getStatusIcon()}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className={`text-sm font-medium ${
            status === 'healthy' ? 'text-green-600' :
            status === 'warning' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </p>
        </div>
      </div>
      <div className="space-y-1">
        {details.map((detail, index) => (
          <p key={index} className="text-sm text-gray-600">{detail}</p>
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;