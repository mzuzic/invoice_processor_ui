import { CheckCircle, Loader2, Clock } from 'lucide-react';
import { ProjectStatus, DocumentStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus | DocumentStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
          color: 'bg-green-100 text-green-800',
          text: 'Completed'
        };
      case 'processing':
        return {
          icon: <Loader2 className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} animate-spin`} />,
          color: 'bg-blue-100 text-blue-800',
          text: 'Processing'
        };
      case 'draft':
        return {
          icon: <Clock className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
          color: 'bg-gray-100 text-gray-800',
          text: 'Draft'
        };
      case 'pending':
        return {
          icon: <Clock className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
          color: 'bg-yellow-100 text-yellow-800',
          text: 'Pending'
        };
      case 'failed':
        return {
          icon: <Clock className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
          color: 'bg-red-100 text-red-800',
          text: 'Failed'
        };
      default:
        return {
          icon: null,
          color: 'bg-gray-100 text-gray-800',
          text: status
        };
    }
  };

  const config = getStatusConfig(status);
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  return (
    <span className={`inline-flex items-center ${padding} rounded-full ${textSize} font-medium ${config.color}`}>
      {config.icon}
      <span className="ml-1">{config.text}</span>
    </span>
  );
}