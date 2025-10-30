import React, { useState } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface TestResult {
  winesEndpoint: {
    status: number;
    statusText: string;
    ok: boolean;
    data: any;
  };
  tokenEndpoint: {
    status: number;
    statusText: string;
    ok: boolean;
    data: any;
  };
  environment: {
    hasUsername: boolean;
    hasPassword: boolean;
    username: string;
    password: string;
  };
}

const TestApiPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-external-api');
      const data = await response.json();

      if (data.success) {
        setResult(data.tests);
      } else {
        setError(data.error?.message || 'Test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">External Wine API Test</h1>
          
          <div className="mb-6">
            <button
              onClick={runTest}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Testing...' : 'Run API Test'}
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Testing external API...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Environment Check */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Environment Variables</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Username:</span>
                    <span className={`ml-2 text-sm ${result.environment.hasUsername ? 'text-green-600' : 'text-red-600'}`}>
                      {result.environment.username}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Password:</span>
                    <span className={`ml-2 text-sm ${result.environment.hasPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {result.environment.password}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wines Endpoint Test */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Wines Endpoint Test (page=1, limit=3, sortBy=name, sortOrder=asc)</h3>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`ml-2 text-sm font-bold ${result.winesEndpoint.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {result.winesEndpoint.status} {result.winesEndpoint.statusText}
                  </span>
                </div>
                {result.winesEndpoint.ok && Array.isArray(result.winesEndpoint.data) && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">Wines returned:</span>
                    <span className="ml-2 text-sm font-bold text-blue-600">
                      {result.winesEndpoint.data.length}
                    </span>
                  </div>
                )}
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-600">Response:</span>
                  <pre className="mt-1 text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                    {JSON.stringify(result.winesEndpoint.data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Token Endpoint Test */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Token Endpoint Test</h3>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`ml-2 text-sm font-bold ${result.tokenEndpoint.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {result.tokenEndpoint.status} {result.tokenEndpoint.statusText}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-600">Response:</span>
                  <pre className="mt-1 text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                    {JSON.stringify(result.tokenEndpoint.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestApiPage;