import { useCallback, useRef, useState } from 'react';
import {
  getScreenCaptureConstraints,
  getCameraCaptureConstraints,
  getMicrophoneCaptureConstraints,
} from '@/config/recording';

export function useMediaStreams() {
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const stopTracks = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const attachEnded = (track: MediaStreamTrack, onEnd: () => void) => {
    const handler = () => onEnd();
    track.addEventListener('ended', handler);
    return () => track.removeEventListener('ended', handler);
  };

  const stopScreen = useCallback(() => {
    stopTracks(screenStreamRef.current);
    screenStreamRef.current = null;
    setIsScreenShared(false);
  }, []);

  const stopCamera = useCallback(() => {
    stopTracks(cameraStreamRef.current);
    cameraStreamRef.current = null;
    setIsCameraOn(false);
  }, []);

  const stopMic = useCallback(() => {
    stopTracks(audioStreamRef.current);
    audioStreamRef.current = null;
    setIsMicOn(false);
  }, []);

  const handleShareScreen = useCallback(async () => {
    try {
      const constraints = getScreenCaptureConstraints();
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      stopScreen();
      screenStreamRef.current = stream;

      const [videoTrack] = stream.getVideoTracks();
      if (videoTrack && 'contentHint' in videoTrack) {
        try {
          // @ts-ignore
          videoTrack.contentHint = 'detail';
        } catch (e) {
          console.warn('Could not set contentHint:', e);
        }
      }

      const disposeVideoEnded = videoTrack ? attachEnded(videoTrack, stopScreen) : undefined;
      // clean listener when we stop
      if (disposeVideoEnded) {
        const prevStop = stopScreen;
        // no-op: closure keeps dispose; when stopScreen called, dispose event handler beforehand
        // leaving as local capture for simplicity
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
      stopCamera();
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
        stopMic();
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
    stopScreen();
    stopCamera();
    stopMic();
  }, [stopCamera, stopMic, stopScreen]);

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