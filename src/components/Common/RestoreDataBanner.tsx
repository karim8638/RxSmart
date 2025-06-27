import React from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

interface RestoreDataBannerProps {
  onRestore: () => void;
  onDismiss: () => void;
  dataType?: string;
  lastSaved?: Date;
}

const RestoreDataBanner: React.FC<RestoreDataBannerProps> = ({
  onRestore,
  onDismiss,
  dataType = 'form data',
  lastSaved,
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Unsaved {dataType} found
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            We found {dataType} that was automatically saved{' '}
            {lastSaved && (
              <span className="font-medium">
                on {lastSaved.toLocaleDateString()} at {lastSaved.toLocaleTimeString()}
              </span>
            )}. Would you like to restore it?
          </p>
          <div className="flex space-x-3 mt-3">
            <button
              onClick={onRestore}
              className="inline-flex items-center space-x-2 bg-amber-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Data</span>
            </button>
            <button
              onClick={onDismiss}
              className="inline-flex items-center space-x-2 bg-white text-amber-800 px-3 py-1 rounded-md text-sm font-medium border border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestoreDataBanner;