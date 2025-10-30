import React, { useState } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const TestCorsFixPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testInternalAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing internal API (should work)...');
      const response = await fetch('/api/wines?page=1&limit=3&sortBy=name&sortOrder=asc&inStock=true');
      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'Internal API Success',
          data: data.data,
          wineCount: data.data.wines.length,
        });
      } else {
        setError('Internal API returned error: ' + data.error?.message);
      }
    } catch (err) {
      setError('Internal API failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const testServerSideExternal = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing server-side external API call...');
      const response = await fetch('/api/debug-external-wines');
      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'Server-side External API Success',
          data: data.serverTest,
          message: data.message,
        });
      } else {
        setError('Server-side external API failed: ' + data.error?.message);
      }
    } catch (err) {
      setError('Server-side external API failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const testDirectExternal = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing direct external API call (should fail with CORS)...');
      const response = await fetch('https://winery-backend.onrender.com/api/wines/?page=1&limit=3&sortBy=name&sortOrder=asc');
      const data = await response.json();
      
      setResult({
        type: 'Direct External API (Unexpected Success)',
        data: data,
      });
    } catch (err) {
      setError('Direct external API failed (expected CORS error): ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">CORS Fix Test</h1>
          
          <div className="space-y-4 mb-8">
            <button
              onClick={testInternalAPI}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Test Internal API (via /api/wines)
            </button>
            
            <button
              onClick={testServerSideExternal}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Test Server-side External API Call
            </button>
            
            <button
              onClick={testDirectExternal}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Test Direct External API (Should Fail)
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Testing...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">{result.type}</h3>
              
              {result.message && (
                <p className="text-green-700 mb-3">{result.message}</p>
              )}
              
              {result.wineCount && (
                <p className="text-green-700 mb-3">
                  <strong>Wines returned:</strong> {result.wineCount}
                </p>
              )}
              
              <div className="mt-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">Response Data:</h4>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCorsFixPage;