'use client';

import { Download, RotateCcw, Scissors } from 'lucide-react';
import { useCallback } from 'react';

interface PlaybackControlsProps {
  onDownload: () => void;
  onNewRecording: () => void;
  onOpenEditor?: () => void;
  videoBlob?: Blob | null;
  recordingName?: string;
}

export default function PlaybackControls({
  onDownload,
  onNewRecording,
  onOpenEditor,
  videoBlob,
  recordingName
}: PlaybackControlsProps) {
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Recording Info */}
        <div>
          {/* Name */}
          <h3 className="text-base font-semibold text-gray-900 truncate max-w-[250px]">
            {recordingName || 'Recording'}
          </h3>

          {/* Badges below name */}
          {videoBlob && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium">
                {formatFileSize(videoBlob.size)}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium">
                {videoBlob.type.split('/')[1]?.split(';')[0]?.toUpperCase() || 'VIDEO'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Edit - Coming Soon */}
          {onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className="relative flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              <Scissors size={14} />
              Edit
              <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded">
                Soon
              </span>
            </button>
          )}

          {/* New */}
          <button
            onClick={onNewRecording}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            <RotateCcw size={14} />
            New
          </button>

          {/* Download - Primary */}
          <button
            onClick={onDownload}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}