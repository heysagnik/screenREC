import { useCallback, useRef, useState } from 'react';
import {
  getScreenCaptureConstraints,
  getCameraCaptureConstraints,
  getMicrophoneCaptureConstraints,
} from '@/config/recording';

/**
 * Helper to safely stop all tracks on a MediaStream
 */
function stopAllTracksOnStream(stream: MediaStream | null): void {
  if (!stream) return;

  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (error) {
        console.warn('Failed to stop track:', error);
      }
    });
  } catch (error) {
    console.warn('Failed to get tracks:', error);
  }
}

export function useMediaStreams() {
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const attachEnded = (track: MediaStreamTrack, onEnd: () => void) => {
    const handler = () => onEnd();
    track.addEventListener('ended', handler);
    return () => track.removeEventListener('ended', handler);
  };

  const stopScreen = useCallback(() => {
    console.log('[useMediaStreams] Stopping screen share');
    stopAllTracksOnStream(screenStreamRef.current);
    screenStreamRef.current = null;
    setIsScreenShared(false);
  }, []);

  const stopCamera = useCallback(() => {
    console.log('[useMediaStreams] Stopping camera');
    stopAllTracksOnStream(cameraStreamRef.current);
    cameraStreamRef.current = null;
    setIsCameraOn(false);
  }, []);

  const stopMic = useCallback(() => {
    console.log('[useMediaStreams] Stopping microphone');
    stopAllTracksOnStream(audioStreamRef.current);
    audioStreamRef.current = null;
    setIsMicOn(false);
  }, []);

  const handleShareScreen = useCallback(async () => {
    try {
      const constraints = getScreenCaptureConstraints();
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      // Stop any existing screen share first
      stopAllTracksOnStream(screenStreamRef.current);
      screenStreamRef.current = stream;

      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack && 'contentHint' in videoTrack) {
        try {
          (videoTrack as MediaStreamTrack & { contentHint?: string }).contentHint = 'detail';
        } catch (e) {
          console.warn('Could not set contentHint:', e);
        }
      }
      if (videoTrack) {
        attachEnded(videoTrack, stopScreen);
      }

      setIsScreenShared(true);
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  }, [stopScreen]);

  const handleStartCamera = useCallback(async () => {
    try {
      if (cameraStreamRef.current) {
        stopCamera();
        return;
      }
      const constraints = getCameraCaptureConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Stop any existing camera first
      stopAllTracksOnStream(cameraStreamRef.current);
      cameraStreamRef.current = stream;

      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack) attachEnded(videoTrack, stopCamera);
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  }, [stopCamera]);

  const handleToggleMic = useCallback(async () => {
    if (!isMicOn) {
      try {
        const constraints = getMicrophoneCaptureConstraints();
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Stop any existing mic first
        stopAllTracksOnStream(audioStreamRef.current);
        audioStreamRef.current = stream;

        const [audioTrack] = stream.getAudioTracks();
        if (audioTrack) attachEnded(audioTrack, stopMic);
        setIsMicOn(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      stopMic();
    }
  }, [isMicOn, stopMic]);

  const stopAllStreams = useCallback(() => {
    console.log('[useMediaStreams] Stopping ALL streams');

    // Stop screen share
    stopAllTracksOnStream(screenStreamRef.current);
    screenStreamRef.current = null;
    setIsScreenShared(false);

    // Stop camera
    stopAllTracksOnStream(cameraStreamRef.current);
    cameraStreamRef.current = null;
    setIsCameraOn(false);

    // Stop microphone
    stopAllTracksOnStream(audioStreamRef.current);
    audioStreamRef.current = null;
    setIsMicOn(false);
  }, []);

  return {
    isScreenShared,
    isCameraOn,
    isMicOn,
    screenStreamRef,
    cameraStreamRef,
    audioStreamRef,
    handleShareScreen,
    handleStartCamera,
    handleToggleMic,
    stopScreen,
    stopCamera,
    stopAllStreams,
  };
}