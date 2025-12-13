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
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Monitor size={18} />
          Share Screen
        </button>
        <button
          onClick={onStartCamera}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Camera size={18} />
          Start Camera
        </button>
      </div>
    </div>
  );
}