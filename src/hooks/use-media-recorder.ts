"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface MediaStreamState {
  stream: MediaStream | null;
  error: Error | null;
}

interface RecordingState {
  isActive: boolean;
  time: number;
  processing: boolean;
}

export function useMediaRecorder() {
  const [screenState, setScreenState] = useState<MediaStreamState>({ 
    stream: null, 
    error: null 
  });
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isActive: false,
    time: 0,
    processing: false
  });
  
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Initialize video and canvas elements
  useEffect(() => {
    if (typeof window === 'undefined') return; 
    
    if (!videoRef.current) {
      videoRef.current = document.createElement("video");
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
    }
    
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
      if (screenState.stream) {
        screenState.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenState.stream]);

  // Manage video element's source object
  useEffect(() => {
    const videoEl = videoRef.current;
    const currentStream = screenState.stream;
    
    if (!videoEl) return;
    
    if (currentStream && videoEl.srcObject !== currentStream) {
      videoEl.srcObject = currentStream;
      videoEl.play().catch(err => console.error('Screen video play error:', err));
    } else if (!currentStream) {
      videoEl.srcObject = null;
    }
  }, [screenState.stream]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    } else {
      // Manual cleanup if recorder isn't active
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingState(prev => ({ ...prev, isActive: false, processing: false }));
    }
  }, []);

  const captureScreen = useCallback(async (): Promise<void> => {
    try {
      // Stop existing recording if active
      if (recorderRef.current?.state === "recording") {
        stopRecording();
      }

      // Stop existing stream
      if (screenState.stream) {
        screenState.stream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Handle user stopping screen share via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenState({ stream: null, error: null });
        if (recorderRef.current?.state === "recording") {
          stopRecording(); 
        }
      });
      
      setScreenState({ stream, error: null });
    } catch (error) {
      console.error("Error capturing screen:", error);
      setScreenState({ stream: null, error: error as Error });
    }
  }, [stopRecording, screenState.stream]);

  const stopScreen = useCallback((): void => {
    if (screenState.stream) {
      screenState.stream.getTracks().forEach(track => track.stop());
      setScreenState({ stream: null, error: null });
    }
    if (recorderRef.current?.state === "recording") {
      stopRecording(); 
    }
  }, [screenState.stream, stopRecording]);

  const setupCanvas = useCallback((): void => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || !screenState.stream) return;
    
    const videoTrack = screenState.stream.getVideoTracks()[0];
    if (!videoTrack) return;
    
    const settings = videoTrack.getSettings();
    canvas.width = settings.width || 1280;
    canvas.height = settings.height || 720;
  }, [screenState.stream]);

  const startRecording = useCallback(async () => {
    if (!screenState.stream || 
        screenState.stream.getVideoTracks().length === 0 || 
        recordingState.isActive) {
      console.warn('Cannot start recording: no stream or already recording');
      return;
    }
    
    // Reset state
    setRecordingBlob(null);
    setShowPreview(false);
    chunksRef.current = [];
    
    setupCanvas();
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) {
      console.error('Canvas or video element not available');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    // Animation frame function
    const renderFrame = () => {
      if (!videoRef.current || 
          !canvasRef.current || 
          !ctx || 
          recorderRef.current?.state !== "recording") {
        return;
      }

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
        ctx.drawImage(
          videoRef.current, 
          0, 0, 
          canvasRef.current.width, 
          canvasRef.current.height
        );
      }
      
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };
    
    try {
      // Create streams
      const canvasStream = canvas.captureStream(30);
      const videoTracks = canvasStream.getVideoTracks();
      const audioTracks: MediaStreamTrack[] = [];
      
      // Clone audio tracks from screen stream
      screenState.stream.getAudioTracks().forEach(track => {
        audioTracks.push(track.clone());
      });
      
      const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
      
      // MediaRecorder options
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 5000000, 
        audioBitsPerSecond: 128000
      };
      
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(combinedStream, options);
      } catch (e) {
        console.warn('VP9 with Opus not supported, falling back to browser default:', e);
        mediaRecorder = new MediaRecorder(combinedStream);
      }
      
      recorderRef.current = mediaRecorder;
      
      // Event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop combined stream tracks
        combinedStream.getTracks().forEach(track => track.stop());
        
        // Clear timers and animation frames
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Create blob from chunks
        const webmBlob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = [];
        
        if (webmBlob.size === 0) {
          console.warn("Recording resulted in an empty file.");
          setRecordingState(prev => ({ 
            ...prev, 
            isActive: false, 
            processing: false, 
            time: 0 
          }));
          setShowPreview(false);
          return;
        }

        // Set recording blob directly (WebM format)
        setRecordingBlob(webmBlob);
        setShowPreview(true);
        setRecordingState(prev => ({ 
          ...prev, 
          isActive: false, 
          processing: false 
        }));
      };
      
      // Start recording
      mediaRecorder.start(1000);
      setRecordingState(prev => ({ ...prev, isActive: true, time: 0 }));
      
      // Start animation and timer
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingState(prev => ({ ...prev, time: prev.time + 1 }));
      }, 1000);
      
    } catch (error) {
      console.error("Recording error:", error);
      setRecordingState(prev => ({ ...prev, isActive: false, time: 0 }));
      
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    }
  }, [screenState.stream, setupCanvas, recordingState.isActive]);

  const downloadRecording = useCallback(() => {
    if (!recordingBlob) {
      console.error("No recording available to download");
      return;
    }
    
    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `screen-recording-${Date.now()}.webm`;
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [recordingBlob]);

  const closePreview = useCallback(() => {
    setShowPreview(false);
    setRecordingBlob(null);
  }, []);

  const editRecording = useCallback(() => {
    console.log("Edit functionality placeholder");
    alert("Editing feature would be implemented here");
  }, []);

  const resetRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      stopRecording();
    }
    setRecordingState({ isActive: false, time: 0, processing: false });
    setRecordingBlob(null);
    setShowPreview(false);
    chunksRef.current = [];
  }, [stopRecording]);

  return {
    isRecording: recordingState.isActive,
    isProcessing: recordingState.processing,
    recordingTime: recordingState.time,
    screenState,
    recordingBlob,
    showPreview,
    startScreenCapture: captureScreen,
    stopScreenCapture: stopScreen,
    startRecording,
    stopRecording,
    downloadRecording,
    closePreview,
    editRecording,
    resetRecording,
    previewVideoRef: videoRef 
  };
}