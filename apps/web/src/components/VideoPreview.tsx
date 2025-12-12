'use client';

import { forwardRef, useMemo, useCallback } from 'react';
import EmptyState from './EmptyState';
import { RecordingLayout } from '@/types/layout';

interface VideoPreviewProps {
  isScreenShared: boolean;
  isCameraOn: boolean;
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  screenVideoRef: React.RefObject<HTMLVideoElement | null>;
  cameraVideoRef: React.RefObject<HTMLVideoElement | null>;
  cameraPositionClasses: string;
  isDragging: boolean;
  selectedLayout: RecordingLayout;
  onShareScreen: () => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCameraDragStart: () => void;
}

const VideoPreview = forwardRef<HTMLDivElement, VideoPreviewProps>(
  (
    {
      isScreenShared,
      isCameraOn,
      isRecording,
      isPaused,
      recordingTime,
      screenVideoRef,
      cameraVideoRef,
      cameraPositionClasses,
      isDragging,
      selectedLayout,
      onShareScreen,
      onStartCamera,
      onStopCamera,
      onCameraDragStart,
    },
    ref
  ) => {
    const formatTime = useCallback((seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const renderCameraOverlay = useMemo(() => {
      if (selectedLayout === 'circle') {
        return (
          <div
            className={`absolute w-56 h-56 rounded-full overflow-hidden bg-gray-900 border-4 border-white transition-all ${cameraPositionClasses} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            onMouseDown={onCameraDragStart}
          >
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover pointer-events-none"
            />
            <button
              onClick={onStopCamera}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white text-sm transition z-10"
              aria-label="Hide camera"
            >
              ✕
            </button>
          </div>
        );
      }

      return (
        <div
          className={`absolute w-56 h-40 rounded-xl overflow-hidden bg-gray-900 border-4 border-white transition-all ${cameraPositionClasses} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          onMouseDown={onCameraDragStart}
        >
          <video
            ref={cameraVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover pointer-events-none"
          />
          <button
            onClick={onStopCamera}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white text-sm transition z-10"
            aria-label="Hide camera"
          >
            ✕
          </button>
        </div>
      );
    }, [selectedLayout, cameraPositionClasses, isDragging, onCameraDragStart, cameraVideoRef, onStopCamera]);

    return (
      <div
        ref={ref}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-b from-black/90 via-slate-800/80 to-slate-700/70 border border-white/10 shadow-xl"
      >
        {!isScreenShared && !isCameraOn ? (
          <>

            <div className="absolute inset-0 flex items-center justify-center z-10">
              <EmptyState onShareScreen={onShareScreen} onStartCamera={onStartCamera} />
            </div>
          </>
        ) : (
          <>
            {isScreenShared && (
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            )}
            {!isScreenShared && isCameraOn && (
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            )}
            {isScreenShared && isCameraOn && renderCameraOverlay}
          </>
        )}
        {isRecording && (
          <div className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 ${isPaused ? 'bg-yellow-500' : 'bg-red-600'} rounded-lg text-white text-sm font-semibold z-20`}>
            <div className={`w-2.5 h-2.5 bg-white rounded-full ${isPaused ? '' : 'animate-pulse'}`} />
            {isPaused ? 'PAUSED' : formatTime(recordingTime)}
          </div>
        )}
        {isPaused && isRecording && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/90 rounded-xl shadow-lg">
              <div className="w-4 h-4 border-2 border-yellow-500 rounded-sm" />
              <span className="text-gray-800 font-medium">Recording Paused</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;