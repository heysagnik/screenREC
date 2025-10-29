'use client';

import { Camera, Monitor, MonitorPlay } from 'lucide-react';

interface EmptyStateProps {
  onShareScreen: () => void;
  onStartCamera: () => void;
}

export default function EmptyState({ onShareScreen, onStartCamera }: EmptyStateProps) {
  return (
    <div className="text-center">
      <div className="mb-6">
        
        <h2 className="text-2xl font-semibold text-white mb-2">Ready to Record</h2>
        <p className="text-gray-400">Share your screen or turn on your camera to start</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onShareScreen}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          <Monitor size={20} />
          Share Screen
        </button>
        <button
          onClick={onStartCamera}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
        >
          <Camera size={20} />
          Start Camera
        </button>
      </div>
    </div>
  );
}