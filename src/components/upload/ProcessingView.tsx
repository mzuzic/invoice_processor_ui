import { Document } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ProcessingViewProps {
  documents: Document[];
}

export function ProcessingView({ documents }: ProcessingViewProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Filename
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className={doc.status === 'processed' || doc.status === 'failed' ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {doc.filename}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {doc.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {doc.vendor || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={doc.status} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}