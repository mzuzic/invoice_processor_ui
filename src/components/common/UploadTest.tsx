import { useState } from 'react';
import { apiService } from '../../services/api';

export function UploadTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const createTestOrder = async () => {
    setLoading(true);
    try {
      const project = await apiService.createProject(`TEST-UPLOAD-${Date.now()}`, 'Test upload order');
      setOrderId(project.id);
      setResult(`✅ Created order: ${project.id} (${project.reference})`);
    } catch (error) {
      setResult(`❌ Create order failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    if (!orderId) {
      setResult('❌ Please create an order first');
      return;
    }
    if (!file) {
      setResult('❌ Please select a file first');
      return;
    }

    setLoading(true);
    try {
      console.log('Uploading file:', file.name, 'to order:', orderId);
      const documents = await apiService.uploadFiles(orderId, [file]);
      setResult(`✅ Upload successful! Documents: ${JSON.stringify(documents, null, 2)}`);

      // Check order status after upload
      setTimeout(async () => {
        try {
          const project = await apiService.fetchProjectDetails(orderId);
          setResult(prev => prev + `\n\n📊 Updated order: ${JSON.stringify(project, null, 2)}`);
        } catch (error) {
          setResult(prev => prev + `\n\n❌ Failed to check order: ${error}`);
        }
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setResult(`❌ Upload failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setResult(`📄 Selected file: ${selectedFile.name} (${selectedFile.size} bytes)`);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold mb-4 text-yellow-800">🧪 Upload Test Panel</h3>

      <div className="space-y-3">
        <button
          onClick={createTestOrder}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          1. Create Test Order
        </button>

        <div>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png,.jpeg,.xlsx,.xls,.csv"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={testUpload}
          disabled={loading || !orderId || !file}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          2. Test Upload
        </button>
      </div>

      <div className="mt-4 p-3 bg-white rounded border">
        <h4 className="font-semibold mb-2">Result:</h4>
        <pre className="text-xs whitespace-pre-wrap max-h-60 overflow-auto">
          {loading ? 'Loading...' : result || 'No test run yet'}
        </pre>
      </div>

      {orderId && (
        <div className="mt-2 text-xs text-gray-600">
          Current Order ID: {orderId}
        </div>
      )}
    </div>
  );
}