'use client';

import { Camera, Monitor } from 'lucide-react';

interface EmptyStateProps {
  onShareScreen: () => void;
  onStartCamera: () => void;
}

export default function EmptyState({ onShareScreen, onStartCamera }: EmptyStateProps) {
  return (
    <div className="text-center px-4">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2">Ready to Record</h2>
        <p className="text-sm sm:text-base text-gray-400">Share your screen or turn on your camera to start</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-sm mx-auto">
        <button
          onClick={onShareScreen}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium transition text-sm sm:text-base"
        >
          <Monitor size={18} className="sm:w-5 sm:h-5" />
          Share Screen
        </button>
        <button
          onClick={onStartCamera}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white rounded-lg font-medium transition text-sm sm:text-base"
        >
          <Camera size={18} className="sm:w-5 sm:h-5" />
          Start Camera
        </button>
      </div>
    </div>
  );
}