'use client';

import { Download, RotateCcw } from 'lucide-react';

interface PlaybackControlsProps {
  onDownload: () => void;
  onNewRecording: () => void;
}

export default function PlaybackControls({ onDownload, onNewRecording }: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDownload}
        className="flex items-center gap-2 px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-full font-medium transition shadow-lg"
      >
        <Download size={20} />
        Download
      </button>
      <button
        onClick={onNewRecording}
        className="flex items-center gap-2 px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-full font-medium transition shadow-lg border border-gray-200"
      >
        <RotateCcw size={20} />
        New Recording
      </button>
    </div>
  );
}