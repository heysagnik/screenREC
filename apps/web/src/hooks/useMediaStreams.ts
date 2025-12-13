import { useCallback, useRef, useState } from 'react';
import {
  getScreenCaptureConstraints,
  getCameraCaptureConstraints,
  getMicrophoneCaptureConstraints,
} from '@/config/recording';

function stopAllTracks(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try { track.stop(); } catch { /* ignore */ }
  });
}

export interface MediaStreamError {
  type: 'screen' | 'camera' | 'mic';
  message: string;
}

export function useMediaStreams() {
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [error, setError] = useState<MediaStreamError | null>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const cleanupFnsRef = useRef<Array<() => void>>([]);

  const addTrackEndListener = useCallback((track: MediaStreamTrack, onEnd: () => void) => {
    const handler = () => onEnd();
    track.addEventListener('ended', handler);
    cleanupFnsRef.current.push(() => track.removeEventListener('ended', handler));
  }, []);

  const stopScreen = useCallback(() => {
    stopAllTracks(screenStreamRef.current);
    screenStreamRef.current = null;
    setIsScreenShared(false);
  }, []);

  const stopCamera = useCallback(() => {
    stopAllTracks(cameraStreamRef.current);
    cameraStreamRef.current = null;
    setIsCameraOn(false);
  }, []);

  const stopMic = useCallback(() => {
    stopAllTracks(audioStreamRef.current);
    audioStreamRef.current = null;
    setIsMicOn(false);
  }, []);

  const startScreen = useCallback(async () => {
    try {
      setError(null);
      const constraints = getScreenCaptureConstraints();
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      stopAllTracks(screenStreamRef.current);
      screenStreamRef.current = stream;

      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack && 'contentHint' in videoTrack) {
        try {
          (videoTrack as MediaStreamTrack & { contentHint?: string }).contentHint = 'detail';
        } catch { /* ignore */ }
      }

      if (videoTrack) {
        addTrackEndListener(videoTrack, stopScreen);
      }

      setIsScreenShared(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to share screen';
      setError({ type: 'screen', message });
    }
  }, [stopScreen, addTrackEndListener]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints = getCameraCaptureConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      stopAllTracks(cameraStreamRef.current);
      cameraStreamRef.current = stream;

      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack) {
        addTrackEndListener(videoTrack, stopCamera);
      }

      setIsCameraOn(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start camera';
      setError({ type: 'camera', message });
    }
  }, [stopCamera, addTrackEndListener]);

  const startMic = useCallback(async () => {
    try {
      setError(null);
      const constraints = getMicrophoneCaptureConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      stopAllTracks(audioStreamRef.current);
      audioStreamRef.current = stream;

      const [audioTrack] = stream.getAudioTracks();
      if (audioTrack) {
        addTrackEndListener(audioTrack, stopMic);
      }

      setIsMicOn(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start microphone';
      setError({ type: 'mic', message });
    }
  }, [stopMic, addTrackEndListener]);

  const toggleCamera = useCallback(async () => {
    if (cameraStreamRef.current) {
      stopCamera();
    } else {
      await startCamera();
    }
  }, [stopCamera, startCamera]);

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      stopMic();
    } else {
      await startMic();
    }
  }, [isMicOn, stopMic, startMic]);

  const stopAllStreams = useCallback(() => {
    stopAllTracks(screenStreamRef.current);
    screenStreamRef.current = null;
    setIsScreenShared(false);

    stopAllTracks(cameraStreamRef.current);
    cameraStreamRef.current = null;
    setIsCameraOn(false);

    stopAllTracks(audioStreamRef.current);
    audioStreamRef.current = null;
    setIsMicOn(false);

    cleanupFnsRef.current.forEach(fn => { try { fn(); } catch { /* ignore */ } });
    cleanupFnsRef.current = [];
  }, []);

  return {
    isScreenShared,
    isCameraOn,
    isMicOn,
    error,
    screenStreamRef,
    cameraStreamRef,
    audioStreamRef,
    startScreen,
    stopScreen,
    startCamera,
    stopCamera,
    startMic,
    stopMic,
    toggleCamera,
    toggleMic,
    handleShareScreen: startScreen,
    handleStartCamera: toggleCamera,
    handleToggleMic: toggleMic,
    stopAllStreams,
  };
}
