"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMediaRecorder } from "@/hooks/use-media-recorder";
import ControlBar from "@/components/controls";
import VideoPreviewModal from "@/components/video-preview-modal";
import RecordingTimer from "@/components/recording-timer";

export default function ScreenRecorder() {
  const {
    isRecording,
    recordingTime,
    screenState,
    recordingBlob,
    showPreview,
    startScreenCapture,
    stopScreenCapture,
    startRecording,
    stopRecording,
    downloadRecording,
    closePreview,
    editRecording,
  } = useMediaRecorder();

  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    return () => {
      stopScreenCapture();
      stopRecording();
    };
  }, [stopScreenCapture, stopRecording]);

  const handleAllowPermissions = async () => {
    try {
      await startScreenCapture();
      setPermissionsGranted(true);
    } catch (error) {
      console.error("Failed to get permissions:", error);
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!permissionsGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-900">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 11V8C18 6.34 16.66 5 15 5H5C3.34 5 2 6.34 2 8V16C2 17.66 3.34 19 5 19H15C16.66 19 18 17.66 18 16V13L22 17V7L18 11Z"
                fill="#3B82F6"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Ready to Record?
          </h2>
          <p className="mb-8 text-gray-600">
            We need access to your screen to start recording.
          </p>
          <button
            onClick={handleAllowPermissions}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
          >
            Start Screen Recording
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      <button
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 p-2 bg-black/30 backdrop-blur-sm rounded-full z-40"
      >
        <ArrowLeft className="h-5 w-5 text-white" />
      </button>

      {isRecording && (
        <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 z-40">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
          <RecordingTimer time={recordingTime} />
        </div>
      )}

      {/* Video container with 16:9 aspect ratio in a smaller frame */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="relative max-w-3xl w-full rounded-lg overflow-hidden shadow-2xl">
          {/* Set aspect ratio 16:9 container */}
          <div className="aspect-w-16 aspect-h-9 bg-black">
            {screenState.stream ? (
              <video
                autoPlay
                playsInline
                muted
                className="object-contain"
                ref={(videoElement) => {
                  if (
                    videoElement &&
                    screenState.stream &&
                    videoElement.srcObject !== screenState.stream
                  ) {
                    videoElement.srcObject = screenState.stream;
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white">
                <div className="mb-4">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="15"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 16.5H16"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">No Screen Selected</h2>
                <p className="text-white/70 mt-2">
                  Click the &ldquo;Start Screen&rdquo; button to select a screen
                  to record.
                </p>
              </div>
            )}
          </div>

          {/* Optional: Recording indicator on the frame */}
          {isRecording && (
            <div className="absolute top-3 right-3 bg-red-500 rounded-full px-3 py-1 text-xs font-medium text-white flex items-center gap-1 shadow-lg">
              <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
              REC
            </div>
          )}
        </div>
      </div>

      <ControlBar
        screenActive={!!screenState.stream}
        isRecording={isRecording}
        onRecordClick={handleRecordClick}
      />

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={showPreview}
        onClose={closePreview}
        onDownload={downloadRecording}
        onEdit={editRecording}
        recordingBlob={recordingBlob}
      />
    </div>
  );
}