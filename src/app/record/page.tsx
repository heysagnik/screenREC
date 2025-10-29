'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import RecordingControls from '@/components/RecordingControls';
import Header from '@/components/Header';
import VideoPreview from '@/components/VideoPreview';
import PlaybackControls from '@/components/PlaybackControls';
import CountdownOverlay from '@/components/CountdownOverlay';
import Notification, { NotificationType } from '@/components/Notification';
import { useMediaStreams } from '@/hooks/useMediaStreams';
import { useRecording } from '@/hooks/useRecording';
import { useCameraPosition } from '@/hooks/useCameraPosition';
import { combineStreams } from '@/utils/streamCombiner';
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
  const notificationIdRef = useRef(0);

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
    onRecordingComplete: (blob) => {
      console.log('=== Recording Completed ===');
      console.log('Blob size:', blob.size, 'bytes');
      console.log('Blob type:', blob.type);
      
      if (blob.size === 0) {
        showNotification('Recording failed: no data captured', 'error');
        console.error('Empty blob received!');
        return;
      }
      
      // Create video URL from blob and set it for playback
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      console.log('Created video URL:', url);
      setRecordedVideoUrl(url);
      showNotification('Recording completed successfully!', 'success');
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

  // Update playback video when recorded URL changes
  useEffect(() => {
    const videoElement = playbackVideoRef.current;
    
    if (!videoElement || !recordedVideoUrl) {
      setIsVideoLoading(false);
      return;
    }
    
    console.log('Setting up video playback for:', recordedVideoUrl);
    console.log('Blob details:', recordedBlob ? { size: recordedBlob.size, type: recordedBlob.type } : 'No blob');
    setIsVideoLoading(true);
    
    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      const error = target.error;
      console.error('Video playback error details:', {
        code: error?.code,
        message: error?.message,
        MEDIA_ERR_ABORTED: error?.code === 1,
        MEDIA_ERR_NETWORK: error?.code === 2,
        MEDIA_ERR_DECODE: error?.code === 3,
        MEDIA_ERR_SRC_NOT_SUPPORTED: error?.code === 4,
      });
      
      let errorMessage = 'Failed to load recorded video';
      if (error?.code === 4) {
        errorMessage = 'Video format not supported by browser';
      } else if (error?.code === 3) {
        errorMessage = 'Video file is corrupted or incomplete';
      }
      
      showNotification(errorMessage, 'error');
      setIsVideoLoading(false);
    };
    
    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded:', {
        duration: videoElement.duration,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
      });
    };
    
    const handleLoadedData = () => {
      console.log('Video data loaded and ready to play');
      setIsVideoLoading(false);
    };
    
    const handleCanPlay = () => {
      console.log('Video can start playing');
    };
    
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('canplay', handleCanPlay);
    
    // Reset video element and set new source
    videoElement.load();
    videoElement.src = recordedVideoUrl;
    
    return () => {
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('canplay', handleCanPlay);
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

  // Check for media access issues
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

  // Warn user before closing tab during recording
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
      console.log('Actually starting recording...');
      
      if (!screenStreamRef.current && !cameraStreamRef.current && !audioStreamRef.current) {
        showNotification('No media sources available to record', 'error');
        return;
      }

      const streamToRecord = combineStreams({
        screenStream: screenStreamRef.current,
        cameraStream: cameraStreamRef.current,
        audioStream: audioStreamRef.current,
        cameraPosition: getCameraCanvasPosition(),
        cameraPositionKey: cameraPosition,
        layout: selectedLayout,
        onAnimationFrame: () => {
          // Frame tracking handled internally by combineStreams
        },
      });

      if (streamToRecord.getTracks().length === 0) {
        showNotification('No tracks available to record', 'error');
        return;
      }

      setRecordedBlob(null);
      setRecordedVideoUrl(null);
      startRecording(streamToRecord);
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
    console.log('Starting countdown...');
    setCountdown(3);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        console.log('Countdown tick:', prev);
        if (prev === null) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return null;
        }
        
        if (prev <= 1) {
          console.log('Countdown finished, starting recording');
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
    console.log('handleStartRecording called');
    
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
    startCountdown,
    showNotification,
  ]);

  const handleStopRecording = useCallback(() => {
    console.log('Stopping recording...');
    stopRecording();
    stopAllStreams();
    showNotification('Recording stopped successfully', 'success');
  }, [stopRecording, stopAllStreams, showNotification]);

  // Keyboard shortcuts - placed after handlers are defined
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
        case 'r':
          event.preventDefault();
          isRecording ? handleStopRecording() : handleStartRecording();
          break;
        case 'p':
          event.preventDefault();
          if (isRecording) pauseRecording();
          break;
        case 'm':
          event.preventDefault();
          handleToggleMic();
          break;
        case 'c':
          event.preventDefault();
          isCameraOn ? stopCamera() : handleStartCamera();
          break;
        case 's':
          event.preventDefault();
          isScreenShared ? stopScreen() : handleShareScreen();
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

  const getFileExtension = useCallback((blob: Blob) => {
    const mimeType = blob.type;
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('mp4')) return 'mp4';
    return 'webm'; // default to webm since MediaRecorder primarily uses it
  }, []);

  const handleDownload = useCallback(() => {
    if (!recordedBlob) return;

    const extension = getFileExtension(recordedBlob);
    const url = URL.createObjectURL(recordedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recording-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Recording downloaded successfully', 'success');
  }, [recordedBlob, getFileExtension, showNotification]);

  const handleNewRecording = useCallback(() => {
    console.log('Starting new recording, clearing previous video');
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
  }, [recordedVideoUrl]);

  const handleCameraDragMove = useCallback(
    (e: React.MouseEvent) => {
      handleCameraDrag(e, previewContainerRef.current);
    },
    [handleCameraDrag]
  );

  // Keyboard shortcuts: Ctrl/Cmd+R start/stop, Ctrl/Cmd+P pause, Ctrl/Cmd+M mic, Ctrl/Cmd+S share
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (key === 'r') { e.preventDefault(); isRecording ? handleStopRecording() : handleStartRecording(); }
      if (key === 'p') { e.preventDefault(); if (isRecording) pauseRecording(); }
      if (key === 'm') { e.preventDefault(); handleToggleMic(); }
      if (key === 's') { e.preventDefault(); isScreenShared ? stopScreen() : handleShareScreen(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRecording, handleStopRecording, handleStartRecording, pauseRecording, handleToggleMic, isScreenShared, stopScreen, handleShareScreen]);

  // Warn on unload while recording
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isRecording) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isRecording]);

  console.log('Render state:', { recordedVideoUrl, recordedBlob: !!recordedBlob, isRecording });

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <Header showBack backHref="/" />
      {/* Airbnb-style notifications - top center, fully rounded */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

  <main className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
          {recordedVideoUrl ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-gray-300">
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-sm font-medium">Loading video...</p>
                  </div>
                </div>
              )}
              <video
                ref={playbackVideoRef}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
                aria-label="Recorded video"
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

          {recordedBlob && !isRecording ? (
            <PlaybackControls onDownload={handleDownload} onNewRecording={handleNewRecording} />
          ) : (
            <RecordingControls
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onPauseRecording={pauseRecording}
              onShareScreen={handleShareScreen}
              onStopScreen={stopScreen}
              onStartCamera={handleStartCamera}
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