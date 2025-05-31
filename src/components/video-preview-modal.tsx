"use client";

import React, { useEffect, useRef } from "react";
import { X, Download, Edit3 } from "lucide-react";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onEdit: () => void;
  recordingBlob: Blob | null;
}

export default function VideoPreviewModal({
  isOpen,
  onClose,
  onDownload,
  onEdit,
  recordingBlob,
}: VideoPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (recordingBlob && videoRef.current) {
      // Create object URL for preview
      const url = URL.createObjectURL(recordingBlob);
      videoUrlRef.current = url;
      videoRef.current.src = url;
    }

    return () => {
      // Cleanup URL when component unmounts
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = null;
      }
    };
  }, [recordingBlob]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recording Preview</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="aspect-w-16 aspect-h-9">
          {recordingBlob && (
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="p-4 flex justify-end gap-4">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            <Edit3 className="h-4 w-4 inline" /> Edit
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            <Download className="h-4 w-4 inline" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}