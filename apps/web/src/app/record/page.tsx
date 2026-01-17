'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import RecordingControls from '@/components/RecordingControls';
import Header from '@/components/Header';
import VideoPreview from '@/components/VideoPreview';
import MinimalVideoPlayer from '@/components/MinimalVideoPlayer';
import CountdownOverlay from '@/components/CountdownOverlay';
import Notification from '@/components/Notification';
import DownloadSettingsModal, { DownloadSettings } from '@/components/DownloadSettingsModal';
import { useMediaStreams } from '@/hooks/useMediaStreams';
import { useMultiStreamRecording, RecordingResult } from '@/hooks/useMultiStreamRecording';
import { useCameraPosition } from '@/hooks/useCameraPosition';
import { useNotifications } from '@/hooks/useNotifications';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { convertToMp4 as convertToMp4Api } from '@/services/api';
import { RecordingLayout } from '@/types/layout';
import { Download, Edit3, RefreshCw, Play, Film } from 'lucide-react';


interface PostRecordingPreviewProps {
  result: RecordingResult;
  onDownload: () => void;
  onOpenEditor: () => void;
  onNewRecording: () => void;
  isConverting: boolean;
  conversionProgress: number;
}

function PostRecordingPreview({
  result,
  onDownload,
  onOpenEditor,
  onNewRecording,
  isConverting,
  conversionProgress,
}: PostRecordingPreviewProps) {
  // Use screen video for preview, fallback to camera
  const previewUrl = result.screenUrl || result.cameraUrl;
  const hasVideo = !!previewUrl;
  const hasAudio = !!result.audioUrl;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Video Preview */}
      {hasVideo ? (
        <div className="w-full">
          <MinimalVideoPlayer src={previewUrl!} />
        </div>
      ) : hasAudio ? (
        <div className="w-full aspect-video rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 border border-gray-200 shadow-lg flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Film className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg font-medium">Audio Only Recording</p>
          <audio controls src={result.audioUrl!} className="mt-2" />
        </div>
      ) : (
        <div className="w-full aspect-video rounded-xl bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">No preview available</p>
        </div>
      )}

      {/* Recording Info */}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Play className="w-4 h-4" />
          {formatDuration(result.duration)}
        </span>
        {result.screenBlob && (
          <span>Screen: {(result.screenBlob.size / 1024 / 1024).toFixed(1)} MB</span>
        )}
        {result.cameraBlob && (
          <span>Camera: {(result.cameraBlob.size / 1024 / 1024).toFixed(1)} MB</span>
        )}
      </div>

      {/* Converting Overlay */}
      {isConverting && (
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Converting to MP4...</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${conversionProgress}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-gray-500">{conversionProgress}%</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onDownload}
          disabled={isConverting}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <button
          onClick={onOpenEditor}
          disabled={isConverting}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition disabled:opacity-50"
        >
          <Edit3 className="w-4 h-4" />
          Open in Editor
        </button>

        <button
          onClick={onNewRecording}
          disabled={isConverting}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          New Recording
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Record Page
// ============================================================================

export default function RecordPage() {
  const router = useRouter();

  // UI State
  const [selectedLayout, setSelectedLayout] = useState<RecordingLayout>('pip');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);

  // Refs
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { notifications, showNotification, removeNotification } = useNotifications();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isSmallScreen = window.innerWidth < 768;
      const isTouchOnly = navigator.maxTouchPoints > 0 && !window.matchMedia('(hover: hover)').matches;
      setIsMobile(isMobileUA || (isSmallScreen && isTouchOnly));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Media Streams
  const {
    isScreenShared,
    isCameraOn,
    isMicOn,
    screenStreamRef,
    cameraStreamRef,
    audioStreamRef,
    handleShareScreen,
    handleStartCamera,
    handleToggleMic,
    stopCamera,
    stopScreen,
    stopAllStreams,
  } = useMediaStreams();

  // Recording Hook
  const {
    recordingState,
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    cleanup,
    resetState,
    getProjectId,
  } = useMultiStreamRecording({
    onRecordingComplete: (result: RecordingResult) => {
      const hasData = result.screenBlob || result.cameraBlob || result.audioBlob;
      if (!hasData) {
        showNotification('Recording failed: no data captured', 'error');
        return;
      }

      // Show preview instead of auto-navigating to editor
      setRecordingResult(result);
      showNotification('Recording complete!', 'success');
    },
    onError: (error: Error) => {
      showNotification(error.message, 'error');
    },
  });

  // Camera position for PiP
  const {
    isDragging,
    handleCameraDragStart,
    handleCameraDrag,
    handleCameraDragEnd,
    getCameraPositionClasses,
  } = useCameraPosition();

  // Keyboard shortcuts
  const handleShareScreenWithMobileCheck = useCallback(() => {
    if (isMobile) {
      showNotification('Screen sharing requires a desktop browser.', 'error');
      return;
    }
    handleShareScreen();
  }, [isMobile, showNotification, handleShareScreen]);

  useKeyboardShortcuts({
    isRecording,
    isCameraOn,
    isScreenShared,
    onPause: pauseRecording,
    onToggleMic: handleToggleMic,
    onToggleCamera: () => isCameraOn ? stopCamera() : handleStartCamera(),
    onToggleScreen: () => isScreenShared ? stopScreen() : handleShareScreenWithMobileCheck(),
  });

  // Sync video elements with streams
  useEffect(() => {
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [isScreenShared, screenStreamRef]);

  useEffect(() => {
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isCameraOn, cameraStreamRef]);

  // Cleanup on unmount only (empty deps or minimal deps)
  useEffect(() => {
    return () => {
      stopAllStreams();
      cleanup();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn if leaving during recording
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRecording) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRecording]);

  // ========================================================================
  // Recording Actions
  // ========================================================================

  const actuallyStartRecording = useCallback(async () => {
    try {
      if (!screenStreamRef.current && !cameraStreamRef.current && !audioStreamRef.current) {
        showNotification('No media sources available to record', 'error');
        return;
      }

      setRecordingResult(null);

      startRecording({
        screenStream: screenStreamRef.current,
        cameraStream: cameraStreamRef.current,
        audioStream: audioStreamRef.current,
      });

      showNotification('Recording started!', 'success');
    } catch (error) {
      console.error('Error starting recording:', error);
      showNotification('Failed to start recording. Please try again.', 'error');
    }
  }, [
    screenStreamRef,
    cameraStreamRef,
    audioStreamRef,
    startRecording,
    showNotification,
  ]);

  const startCountdown = useCallback(() => {
    setCountdown(3);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return null;
        }

        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setTimeout(() => {
            actuallyStartRecording();
          }, 100);
          return null;
        }

        return prev - 1;
      });
    }, 1000);
  }, [actuallyStartRecording]);

  const handleStartRecording = useCallback(() => {
    let hasValidSource = false;
    const errorMessages: string[] = [];

    if (isScreenShared) {
      if (screenStreamRef.current) {
        hasValidSource = true;
      } else {
        errorMessages.push('Screen share is not working');
      }
    }

    if (isCameraOn) {
      if (cameraStreamRef.current) {
        hasValidSource = true;
      } else {
        errorMessages.push('Camera is not working');
      }
    }

    // Allow mic-only recording (audio only)
    if (isMicOn && !hasValidSource) {
      if (audioStreamRef.current) {
        hasValidSource = true;
      } else {
        errorMessages.push('Microphone is not working');
      }
    }

    if (errorMessages.length > 0) {
      errorMessages.forEach((msg) => showNotification(msg, 'error'));
      return;
    }

    if (!hasValidSource) {
      showNotification('Please enable screen share, camera, or microphone before recording', 'info');
      return;
    }

    startCountdown();
  }, [
    isScreenShared,
    isCameraOn,
    isMicOn,
    screenStreamRef,
    cameraStreamRef,
    audioStreamRef,
    showNotification,
    startCountdown,
  ]);

  const handleStopRecording = useCallback(() => {
    console.log('[RecordPage] handleStopRecording called');
    stopRecording();
    setTimeout(() => {
      stopAllStreams();
    }, 500);
  }, [stopRecording, stopAllStreams]);

  // ========================================================================
  // Post-Recording Actions
  // ========================================================================

  const handleDownload = useCallback(() => {
    if (!recordingResult) return;
    setShowDownloadModal(true);
  }, [recordingResult]);

  const handleDownloadConfirm = useCallback(async (settings: DownloadSettings) => {
    if (!recordingResult) return;
    setShowDownloadModal(false);

    // Get the primary blob to download
    let blobToDownload = recordingResult.screenBlob || recordingResult.cameraBlob || recordingResult.audioBlob;
    if (!blobToDownload) {
      showNotification('No recording data to download', 'error');
      return;
    }

    let extension = blobToDownload.type.includes('audio') ? 'webm' : 'webm';

    if (settings.format === 'mp4' && !blobToDownload.type.includes('audio')) {
      setIsConverting(true);
      setConversionProgress(0);
      showNotification('Converting to MP4 via server...', 'info');

      try {
        const mp4Blob = await convertToMp4Api(blobToDownload, {
          onProgress: setConversionProgress,
        });
        if (mp4Blob) {
          blobToDownload = mp4Blob;
          extension = 'mp4';
          showNotification('Conversion complete!', 'success');
        } else {
          showNotification('MP4 conversion failed, downloading as WebM', 'info');
        }
      } catch {
        showNotification('MP4 conversion failed, downloading as WebM', 'info');
      } finally {
        setIsConverting(false);
      }
    }

    const url = URL.createObjectURL(blobToDownload);
    const link = document.createElement('a');
    link.href = url;
    const filename = settings.name
      ? `${settings.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.${extension}`
      : `recording-${Date.now()}.${extension}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Recording downloaded successfully', 'success');
  }, [recordingResult, showNotification]);

  const handleOpenEditor = useCallback(() => {
    if (!recordingResult) return;
    const projectId = getProjectId();
    if (projectId) {
      router.push(`/editor?projectId=${projectId}`);
    } else if (recordingResult.screenUrl) {
      router.push(`/editor?video=${encodeURIComponent(recordingResult.screenUrl)}`);
    } else {
      showNotification('No recording to edit', 'error');
    }
  }, [recordingResult, router, showNotification, getProjectId]);

  const handleNewRecording = useCallback(() => {
    // Revoke old URLs
    if (recordingResult) {
      if (recordingResult.screenUrl) URL.revokeObjectURL(recordingResult.screenUrl);
      if (recordingResult.cameraUrl) URL.revokeObjectURL(recordingResult.cameraUrl);
      if (recordingResult.audioUrl) URL.revokeObjectURL(recordingResult.audioUrl);
    }

    setRecordingResult(null);
    resetState();
  }, [recordingResult, resetState]);

  const handleCameraDragMove = useCallback(
    (e: React.MouseEvent) => {
      handleCameraDrag(e, previewContainerRef.current);
    },
    [handleCameraDrag]
  );

  // ========================================================================
  // Render
  // ========================================================================

  // Show preview when we have a result and are NOT actively recording
  const showPreview = !!recordingResult && !isRecording;

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <Header showBack backHref="/" />

      {/* Download Settings Modal */}
      <DownloadSettingsModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownloadConfirm}
        videoBlob={recordingResult?.screenBlob || recordingResult?.cameraBlob || null}
      />

      {/* Notifications */}
      <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 h-20 px-4 w-full max-w-md">
        {notifications.slice().reverse().map((notification, index) => (
          <div
            key={notification.id}
            className="absolute left-1/2 transition-all duration-200 w-full"
            style={{
              zIndex: 100 - index,
              transform: `translateX(-50%) translateY(${index * -8}px)`,
              opacity: index > 3 ? 0.4 : 1 - index * 0.1,
            }}
          >
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl">
          {showPreview ? (
            // Post-Recording Preview
            <PostRecordingPreview
              result={recordingResult}
              onDownload={handleDownload}
              onOpenEditor={handleOpenEditor}
              onNewRecording={handleNewRecording}
              isConverting={isConverting}
              conversionProgress={conversionProgress}
            />
          ) : (
            // Recording UI
            <>
              <div className="relative w-full" onMouseMove={handleCameraDragMove} onMouseUp={handleCameraDragEnd}>
                {countdown !== null && <CountdownOverlay count={countdown} />}

                <VideoPreview
                  ref={previewContainerRef}
                  isScreenShared={isScreenShared}
                  isCameraOn={isCameraOn}
                  isRecording={isRecording}
                  isPaused={isPaused}
                  recordingTime={recordingTime}
                  screenVideoRef={screenVideoRef}
                  cameraVideoRef={cameraVideoRef}
                  cameraPositionClasses={getCameraPositionClasses()}
                  isDragging={isDragging}
                  selectedLayout={selectedLayout}
                  onShareScreen={handleShareScreenWithMobileCheck}
                  onStartCamera={handleStartCamera}
                  onStopCamera={stopCamera}
                  onCameraDragStart={handleCameraDragStart}
                />
              </div>

              <RecordingControls
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onPauseRecording={pauseRecording}
                onShareScreen={handleShareScreenWithMobileCheck}
                onStopScreen={stopScreen}
                onStartCamera={handleStartCamera}
                onStopCamera={stopCamera}
                onToggleMic={handleToggleMic}
                onLayoutChange={setSelectedLayout}
                isRecording={isRecording}
                isPaused={isPaused}
                isCameraActive={isCameraOn}
                isMicActive={isMicOn}
                isScreenSharing={isScreenShared}
                canRecord={isScreenShared || isCameraOn || isMicOn}
                selectedLayout={selectedLayout}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}