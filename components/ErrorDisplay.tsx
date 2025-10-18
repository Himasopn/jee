
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 text-center">
      <div className="bg-red-900/50 border border-red-700 p-8 rounded-lg shadow-lg max-w-md">
        <i className="fas fa-exclamation-triangle text-5xl text-red-400 mb-4"></i>
        <h2 className="text-2xl font-bold mb-2">An Error Occurred</h2>
        <p className="text-red-300 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          <i className="fas fa-redo mr-2"></i>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
