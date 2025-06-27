import React from 'react';
import { Save, Check, AlertCircle, Clock } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'saving' | 'saved' | 'error' | 'pending';
  lastSaved?: Date;
  className?: string;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSaved,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Save,
          text: 'Saving...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'saved':
        return {
          icon: Check,
          text: 'Saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      default:
        return {
          icon: Save,
          text: 'Auto-save',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <Icon className={`w-4 h-4 ${config.color} ${status === 'saving' ? 'animate-spin' : ''}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
      {lastSaved && status === 'saved' && (
        <span className="text-xs text-gray-500">
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default AutoSaveIndicator;