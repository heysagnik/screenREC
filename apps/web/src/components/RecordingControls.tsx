'use client';

import { Camera, CameraOff, Monitor, Mic, MicOff, Square, Circle, Pause, Play } from 'lucide-react';
import LayoutSelector from './LayoutSelector';
import { RecordingLayout } from '@/types/layout';

interface RecordingControlsProps {
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onPauseRecording?: () => void;
  onShareScreen?: () => void;
  onStopScreen?: () => void;
  onStartCamera?: () => void;
  onStopCamera?: () => void;
  onToggleMic?: () => void;
  onLayoutChange?: (layout: RecordingLayout) => void;
  isRecording?: boolean;
  isPaused?: boolean;
  isCameraActive?: boolean;
  isMicActive?: boolean;
  isScreenSharing?: boolean;
  canRecord?: boolean;
  selectedLayout?: RecordingLayout;
  recordingTime?: number;
}
export default function RecordingControls({
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onShareScreen,
  onStopScreen,
  onStartCamera,
  onStopCamera,
  onToggleMic,
  onLayoutChange,
  isRecording = false,
  isPaused = false,
  isCameraActive = false,
  isMicActive = false,
  isScreenSharing = false,
  canRecord = false,
  selectedLayout = 'pip',
  recordingTime = 0,
}: RecordingControlsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScreenToggle = () => {
    if (isScreenSharing) {
      onStopScreen?.();
    } else {
      onShareScreen?.();
    }
  };

  const handleCameraToggle = () => {
    if (isCameraActive) {
      onStopCamera?.();
    } else {
      onStartCamera?.();
    }
  };

  return (
    <div className="w-full flex justify-center" role="toolbar" aria-label="Recording controls">
      <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={onToggleMic}
          disabled={isRecording}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isMicActive
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100'
            : 'bg-red-50 text-red-600 hover:bg-red-100 disabled:hover:bg-red-50'
            }`}
          aria-label={isMicActive ? 'Mute microphone' : 'Unmute microphone'}
          aria-pressed={isMicActive}
        >
          {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <kbd className="sr-only">Press M to toggle microphone</kbd>

        <button
          onClick={handleCameraToggle}
          disabled={isRecording}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isCameraActive
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:hover:bg-gray-100'
            : 'bg-red-50 text-red-600 hover:bg-red-100 disabled:hover:bg-red-50'
            }`}
          aria-label={isCameraActive ? 'Stop camera' : 'Start camera'}
          aria-pressed={isCameraActive}
        >
          {isCameraActive ? (
            <Camera className="w-5 h-5" />
          ) : (
            <CameraOff className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={handleScreenToggle}
          disabled={isRecording}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isScreenSharing
            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:hover:bg-blue-50'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:hover:bg-gray-50'
            }`}
          aria-label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          aria-pressed={isScreenSharing}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {onLayoutChange && (
          <>
            <div className="w-px h-8 bg-gray-200 mx-1" />
            <div
              className="relative group"
              title={!isScreenSharing || !isCameraActive ? "Enable both screen share and camera to change layout" : undefined}
            >
              <LayoutSelector
                selectedLayout={selectedLayout}
                onLayoutChange={onLayoutChange}
                disabled={isRecording || !isScreenSharing || !isCameraActive}
              />
              {(!isScreenSharing || !isCameraActive) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Enable screen share + camera
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          </>
        )}

        <div className="w-px h-8 bg-gray-200 mx-1" />

        {!isRecording ? (
          <button
            onClick={onStartRecording}
            disabled={!canRecord}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
            aria-label="Start recording"
            aria-disabled={!canRecord}
          >
            <Circle className="w-5 h-5 fill-current" />
            <span>Start Recording</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onPauseRecording}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>

            <button
              onClick={onStopRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 hover:bg-black text-white font-medium transition-all"
              aria-label="Stop recording"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        )}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {isRecording ? `Recording in progress: ${formatTime(recordingTime)}` : 'Not recording'}
      </div>
    </div>
  );
}