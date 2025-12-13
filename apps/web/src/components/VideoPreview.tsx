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
            className={`absolute w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full overflow-hidden bg-gray-900 border-2 sm:border-3 md:border-4 border-white transition-all ${cameraPositionClasses} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            onMouseDown={onCameraDragStart}
          >
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover pointer-events-none [transform:scaleX(-1)]"
            />
            <button
              onClick={onStopCamera}
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white text-xs sm:text-sm transition z-10"
              aria-label="Hide camera"
            >
              ✕
            </button>
          </div>
        );
      }

      return (
        <div
          className={`absolute w-40 h-28 sm:w-48 sm:h-32 md:w-56 md:h-40 rounded-lg sm:rounded-xl overflow-hidden bg-gray-900 border-2 sm:border-3 md:border-4 border-white transition-all ${cameraPositionClasses} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          onMouseDown={onCameraDragStart}
        >
          <video
            ref={cameraVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover pointer-events-none [transform:scaleX(-1)]"
          />
          <button
            onClick={onStopCamera}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white text-xs sm:text-sm transition z-10"
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
        className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-black/90 via-slate-800/80 to-slate-700/70 border border-white/10 shadow-xl"
      >
        {!isScreenShared && !isCameraOn ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <EmptyState onShareScreen={onShareScreen} onStartCamera={onStartCamera} />
          </div>
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
                className="w-full h-full object-contain [transform:scaleX(-1)]"
              />
            )}
            {isScreenShared && isCameraOn && renderCameraOverlay}
          </>
        )}
        {isRecording && (
          <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 ${isPaused ? 'bg-yellow-500' : 'bg-red-600'} rounded-md sm:rounded-lg text-white text-xs sm:text-sm font-semibold z-20`}>
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full ${isPaused ? '' : 'animate-pulse'}`} />
            {isPaused ? 'PAUSED' : formatTime(recordingTime)}
          </div>
        )}
        {isPaused && isRecording && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 p-4">
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/90 rounded-lg sm:rounded-xl shadow-lg">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-yellow-500 rounded-sm" />
              <span className="text-gray-800 text-sm sm:text-base font-medium">Recording Paused</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;