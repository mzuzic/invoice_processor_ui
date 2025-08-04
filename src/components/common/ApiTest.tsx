import { useState } from 'react';
import { apiService } from '../../services/api';

export function ApiTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const isHealthy = await apiService.healthCheck();
      setResult(`Health check: ${isHealthy ? '✅ Healthy' : '❌ Failed'}`);
    } catch (error) {
      setResult(`Health check error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testFetchProjects = async () => {
    setLoading(true);
    try {
      const projects = await apiService.fetchProjects();
      setResult(`Fetched ${projects.length} projects: ${JSON.stringify(projects, null, 2)}`);
    } catch (error) {
      setResult(`Fetch projects error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 border rounded">
      <h3 className="font-bold mb-2">API Test Panel</h3>
      <div className="space-x-2 mb-2">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Health
        </button>
        <button
          onClick={testFetchProjects}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Fetch Projects
        </button>
      </div>
      <pre className="text-xs bg-white p-2 rounded border max-h-40 overflow-auto">
        {loading ? 'Loading...' : result || 'Click a button to test'}
      </pre>
    </div>
  );
}