'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import RecordingControls from '@/components/RecordingControls';
import Header from '@/components/Header';
import VideoPreview from '@/components/VideoPreview';
import MinimalVideoPlayer from '@/components/MinimalVideoPlayer';
import PlaybackControls from '@/components/PlaybackControls';
import CountdownOverlay from '@/components/CountdownOverlay';
import Notification, { NotificationType } from '@/components/Notification';
import DownloadSettingsModal, { DownloadSettings } from '@/components/DownloadSettingsModal';
import { useMediaStreams } from '@/hooks/useMediaStreams';
import { useRecording } from '@/hooks/useRecording';
import { useCameraPosition } from '@/hooks/useCameraPosition';
import { convertToMp4 as convertToMp4Api } from '@/services/api';
import { combineStreams, forceCleanupCombinedStreams } from '@/utils/streamCombiner';
import { RecordingLayout } from '@/types/layout';

interface NotificationState {
  message: string;
  type: NotificationType;
  id: number;
}

export default function RecordPage() {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<RecordingLayout>('pip');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const notificationIdRef = useRef(0);

  const [conversionProgress, setConversionProgress] = useState(0);

  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    cleanup,
  } = useRecording({
    onRecordingComplete: async (blob: Blob) => {
      if (blob.size === 0) {
        showNotification('Recording failed: no data captured', 'error');
        return;
      }

      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      showNotification('Recording saved!', 'success');
    },
  });

  const {
    cameraPosition,
    isDragging,
    handleCameraDragStart,
    handleCameraDrag,
    handleCameraDragEnd,
    getCameraPositionClasses,
    getCameraCanvasPosition,
  } = useCameraPosition();

  const showNotification = useCallback((message: string, type: NotificationType) => {
    notificationIdRef.current += 1;
    const id = notificationIdRef.current;

    setNotifications((prev) => [...prev, { message, type, id }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const videoElement = screenVideoRef.current;
    if (videoElement) {
      videoElement.srcObject = screenStreamRef.current;
    }
  }, [isScreenShared, screenStreamRef]);

  useEffect(() => {
    const videoElement = cameraVideoRef.current;
    if (videoElement) {
      videoElement.srcObject = cameraStreamRef.current;
    }
  }, [isCameraOn, cameraStreamRef]);

  useEffect(() => {
    const videoElement = playbackVideoRef.current;

    if (!videoElement || !recordedVideoUrl) {
      setIsVideoLoading(false);
      return;
    }

    setIsVideoLoading(true);

    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      const error = target.error;

      let errorMessage = 'Failed to load recorded video';
      if (error?.code === 4) {
        errorMessage = 'Video format not supported by browser';
      } else if (error?.code === 3) {
        errorMessage = 'Video file is corrupted or incomplete';
      }

      showNotification(errorMessage, 'error');
      setIsVideoLoading(false);
    };

    const handleLoadedData = () => {
      setIsVideoLoading(false);
    };

    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadeddata', handleLoadedData);

    videoElement.load();
    videoElement.src = recordedVideoUrl;

    return () => {
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [recordedVideoUrl, recordedBlob, showNotification]);

  useEffect(
    () => () => {
      stopAllStreams();
      cleanup();
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    },
    [stopAllStreams, cleanup, recordedVideoUrl]
  );

  useEffect(() => {
    if (isScreenShared && !screenStreamRef.current) {
      showNotification('Screen share failed. Please try again.', 'error');
    }
  }, [isScreenShared, screenStreamRef, showNotification]);

  useEffect(() => {
    if (isCameraOn && !cameraStreamRef.current) {
      showNotification('Camera access failed. Please check permissions.', 'error');
    }
  }, [isCameraOn, cameraStreamRef, showNotification]);

  useEffect(() => {
    if (isMicOn && !audioStreamRef.current) {
      showNotification('Microphone access failed. Please check permissions.', 'error');
    }
  }, [isMicOn, audioStreamRef, showNotification]);

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

  const actuallyStartRecording = useCallback(async () => {
    try {
      if (!screenStreamRef.current && !cameraStreamRef.current && !audioStreamRef.current) {
        showNotification('No media sources available to record', 'error');
        return;
      }

      const { stream: combinedStream } = combineStreams({
        screenStream: screenStreamRef.current,
        cameraStream: cameraStreamRef.current,
        audioStream: audioStreamRef.current,
        cameraPosition: getCameraCanvasPosition(),
        cameraPositionKey: cameraPosition,
        layout: selectedLayout,
        onAnimationFrame: () => { },
      });

      if (combinedStream.getTracks().length === 0) {
        showNotification('No tracks available to record', 'error');
        return;
      }

      setRecordedBlob(null);
      setRecordedVideoUrl(null);

      startRecording(combinedStream);
      showNotification('Recording started!', 'success');
    } catch (error) {
      console.error('Error starting recording:', error);
      showNotification('Failed to start recording. Please try again.', 'error');
    }
  }, [
    screenStreamRef,
    cameraStreamRef,
    audioStreamRef,
    getCameraCanvasPosition,
    cameraPosition,
    selectedLayout,
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

    if (isMicOn && !audioStreamRef.current) {
      errorMessages.push('Microphone is not working');
    }

    if (errorMessages.length > 0) {
      errorMessages.forEach((msg) => showNotification(msg, 'error'));
      return;
    }

    if (!hasValidSource) {
      showNotification('Please enable screen share or camera before recording', 'info');
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

    // Stop the MediaRecorder first
    stopRecording();

    // Force cleanup of combined streams - this stops the ORIGINAL input tracks
    forceCleanupCombinedStreams();

    // Also stop via the hook to update state
    stopAllStreams();
    
    // Clear video element srcObjects to release references
    document.querySelectorAll('video').forEach((video) => {
      if (video.srcObject) {
        video.srcObject = null;
      }
    });
  }, [stopRecording, stopAllStreams]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey;

      if (!hasModifier) return;

      switch (key) {
        case 'p':
          event.preventDefault();
          if (isRecording) {
            pauseRecording();
          }
          break;
        case 'm':
          event.preventDefault();
          handleToggleMic();
          break;
        case 'c':
          event.preventDefault();
          if (isCameraOn) {
            stopCamera();
          } else {
            handleStartCamera();
          }
          break;
        case 's':
          event.preventDefault();
          if (isScreenShared) {
            stopScreen();
          } else {
            handleShareScreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    isRecording,
    isCameraOn,
    isScreenShared,
    handleStartRecording,
    handleStopRecording,
    pauseRecording,
    handleToggleMic,
    handleStartCamera,
    stopCamera,
    handleShareScreen,
    stopScreen,
  ]);

  const handleDownload = useCallback(() => {
    if (!recordedBlob) return;
    setShowDownloadModal(true);
  }, [recordedBlob]);

  const handleDownloadConfirm = useCallback(async (settings: DownloadSettings) => {
    if (!recordedBlob) return;
    setShowDownloadModal(false);

    let blobToDownload = recordedBlob;
    let extension = 'webm';

    if (settings.format === 'mp4') {
      setIsConverting(true);
      setConversionProgress(0);
      showNotification('Converting to MP4 via server...', 'info');
      try {
        const mp4Blob = await convertToMp4Api(recordedBlob, {
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
  }, [recordedBlob, showNotification]);

  const handleNewRecording = useCallback(() => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
  }, [recordedVideoUrl]);

  const handleOpenEditor = useCallback(() => {
    showNotification('Editor coming soon!', 'success');
  }, [showNotification]);

  const handleCameraDragMove = useCallback(
    (e: React.MouseEvent) => {
      handleCameraDrag(e, previewContainerRef.current);
    },
    [handleCameraDrag]
  );



  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <Header showBack backHref="/" />

      {/* Download Settings Modal */}
      <DownloadSettingsModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownloadConfirm}
        videoBlob={recordedBlob}
      />

      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 h-20">
        {notifications.slice().reverse().map((notification, index) => (
          <div
            key={notification.id}
            className="absolute left-1/2 transition-all duration-200"
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

      {/* Converting Overlay */}
      {isConverting && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900">Converting to MP4</h3>
            <p className="text-gray-500 text-center">Please wait while your recording is being converted...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${conversionProgress}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">{conversionProgress}%</span>
          </div>
        </div>
      )}

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
          {recordedVideoUrl ? (
            <div className="w-full flex flex-col gap-6">
              {/* Video Preview - Full Width */}
              <div className="w-full">
                {isVideoLoading && (
                  <div className="w-full aspect-video rounded-2xl bg-gray-900 border border-gray-200 shadow-lg flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      <p className="text-white text-sm font-medium">Loading video...</p>
                    </div>
                  </div>
                )}
                {!isVideoLoading && recordedVideoUrl && (
                  <MinimalVideoPlayer src={recordedVideoUrl} />
                )}
              </div>

              {/* Controls - Bottom */}
              <PlaybackControls
                onDownload={handleDownload}
                onNewRecording={handleNewRecording}
                onOpenEditor={handleOpenEditor}
                videoBlob={recordedBlob}
              />
            </div>
          ) : (
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
                onShareScreen={handleShareScreen}
                onStartCamera={handleStartCamera}
                onStopCamera={stopCamera}
                onCameraDragStart={handleCameraDragStart}
              />
            </div>
          )}

          {!recordedVideoUrl && (
            <RecordingControls
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onPauseRecording={pauseRecording}
              onShareScreen={handleShareScreen}
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
              canRecord={isScreenShared || isCameraOn}
              selectedLayout={selectedLayout}
            />
          )}
        </div>
      </main>
    </div>
  );
}