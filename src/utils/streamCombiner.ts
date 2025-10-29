import { RecordingLayout } from '@/types/layout';
import { RECORDING_CONFIG } from '@/config/recording';

export enum RecordingState {
  IDLE = 'IDLE',
  PREPARING = 'PREPARING',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  STOPPING = 'STOPPING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export class RecordingStateMachine {
  private state: RecordingState = RecordingState.IDLE;
  private listeners: Map<RecordingState, Set<() => void>> = new Map();

  canTransition(to: RecordingState): boolean {
    const validTransitions: Record<RecordingState, RecordingState[]> = {
      [RecordingState.IDLE]: [RecordingState.PREPARING],
      [RecordingState.PREPARING]: [RecordingState.RECORDING, RecordingState.ERROR],
      [RecordingState.RECORDING]: [RecordingState.PAUSED, RecordingState.STOPPING],
      [RecordingState.PAUSED]: [RecordingState.RECORDING, RecordingState.STOPPING],
      [RecordingState.STOPPING]: [RecordingState.COMPLETED, RecordingState.ERROR],
      [RecordingState.COMPLETED]: [RecordingState.IDLE],
      [RecordingState.ERROR]: [RecordingState.IDLE],
    };

    return validTransitions[this.state]?.includes(to) ?? false;
  }

  transition(to: RecordingState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition from ${this.state} to ${to}`);
    }
    this.state = to;
    this.notifyListeners(to);
  }

  getState(): RecordingState {
    return this.state;
  }

  on(state: RecordingState, callback: () => void): void {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, new Set());
    }
    this.listeners.get(state)!.add(callback);
  }

  private notifyListeners(state: RecordingState): void {
    this.listeners.get(state)?.forEach(callback => callback());
  }
}

export interface CombineStreamsOptions {
  screenStream: MediaStream | null;
  cameraStream: MediaStream | null;
  audioStream: MediaStream | null;
  cameraPosition: { x: number; y: number };
  cameraPositionKey?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  layout: RecordingLayout;
  onAnimationFrame: (frameId: number) => void;
}

export function combineStreams({
  screenStream,
  cameraStream,
  audioStream,
  cameraPosition,
  cameraPositionKey,
  layout,
  onAnimationFrame,
}: CombineStreamsOptions): MediaStream {
  
  // Case 1: Both screen and camera - need canvas combining
  if (screenStream && cameraStream) {
    return combineScreenAndCamera(
      screenStream,
      cameraStream,
      audioStream,
      cameraPosition,
      cameraPositionKey,
      layout,
      onAnimationFrame
    );
  }

  // Case 2: Only screen - pass through with audio
  if (screenStream) {
    const stream = new MediaStream();
    
    // Add screen video track
    screenStream.getVideoTracks().forEach(track => {
      stream.addTrack(track);
      console.log('Added screen video track:', track.label);
    });
    
    // Add screen audio track (system audio)
    screenStream.getAudioTracks().forEach(track => {
      stream.addTrack(track);
      console.log('Added screen audio track:', track.label);
    });
    
    // Add microphone audio track
    audioStream?.getAudioTracks().forEach(track => {
      stream.addTrack(track);
      console.log('Added microphone audio track:', track.label);
    });
    
    return stream;
  }

  // Case 3: Only camera - pass through with audio
  if (cameraStream) {
    const stream = new MediaStream();
    
    // Add camera video track
    cameraStream.getVideoTracks().forEach(track => {
      stream.addTrack(track);
      console.log('Added camera video track:', track.label);
    });
    
    // Add microphone audio track
    audioStream?.getAudioTracks().forEach(track => {
      stream.addTrack(track);
      console.log('Added microphone audio track:', track.label);
    });
    
    return stream;
  }

  // Fallback: empty stream
  console.warn('No video streams available');
  return new MediaStream();
}

function combineScreenAndCamera(
  screenStream: MediaStream,
  cameraStream: MediaStream,
  audioStream: MediaStream | null,
  cameraPosition: { x: number; y: number },
  cameraPositionKey: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | undefined,
  layout: RecordingLayout,
  onAnimationFrame: (frameId: number) => void
): MediaStream {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 9;
  
  // Get context
  const context = canvas.getContext('2d', {
    alpha: false,
    desynchronized: false,
  });
  if (!context) {
    return new MediaStream();
  }
  const ctx: CanvasRenderingContext2D = context;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Create video elements
  const screenVideo = document.createElement('video');
  screenVideo.srcObject = screenStream;
  screenVideo.muted = true;
  screenVideo.autoplay = true;
  screenVideo.playsInline = true;
  // Critical: ensure video plays smoothly without frame drops
  screenVideo.setAttribute('playsinline', 'true');
  screenVideo.setAttribute('webkit-playsinline', 'true');

  const cameraVideo = document.createElement('video');
  cameraVideo.srcObject = cameraStream;
  cameraVideo.muted = true;
  cameraVideo.autoplay = true;
  cameraVideo.playsInline = true;
  cameraVideo.setAttribute('playsinline', 'true');
  cameraVideo.setAttribute('webkit-playsinline', 'true');

  // Wait for BOTH videos to be ready before starting render loop
  // Use 'loadeddata' instead of 'canplay' for better reliability
  let screenReady = false;
  let cameraReady = false;
  let renderStarted = false;

  const checkAndStartRender = () => {
    if (!renderStarted && screenReady && cameraReady) {
      renderStarted = true;
      console.log('✅ Both videos ready - starting render loop');
      console.log('Screen:', screenVideo.videoWidth, 'x', screenVideo.videoHeight);
      console.log('Camera:', cameraVideo.videoWidth, 'x', cameraVideo.videoHeight);
      startRenderLoop();
    }
  };

  // Wait for loadeddata (more reliable than canplay)
  screenVideo.addEventListener('loadeddata', () => {
    console.log('📺 Screen video loaded');
    screenReady = true;
    checkAndStartRender();
  }, { once: true });

  cameraVideo.addEventListener('loadeddata', () => {
    console.log('📹 Camera video loaded');
    cameraReady = true;
    checkAndStartRender();
  }, { once: true });

  // Also try canplay as fallback
  screenVideo.addEventListener('canplay', () => {
    if (!screenReady) {
      console.log('📺 Screen video can play (fallback)');
      screenReady = true;
      checkAndStartRender();
    }
  }, { once: true });

  cameraVideo.addEventListener('canplay', () => {
    if (!cameraReady) {
      console.log('📹 Camera video can play (fallback)');
      cameraReady = true;
      checkAndStartRender();
    }
  }, { once: true });

  // Trigger playback immediately
  screenVideo.play().catch((e) => console.warn('Screen video play error:', e));
  cameraVideo.play().catch((e) => console.warn('Camera video play error:', e));

  // Safety timeout: start anyway after 2 seconds if videos haven't loaded
  setTimeout(() => {
    if (!renderStarted) {
      console.warn('⚠️ Timeout: Starting render loop without all videos ready');
      renderStarted = true;
      startRenderLoop();
    }
  }, 2000);

  // Determine and apply canvas size based on source resolution (reduces scaling blur)
  let canvasSized = false;
  let resizeTimeout: NodeJS.Timeout | null = null;
  
  function applyInitialCanvasSize() {
    // Debounce rapid resize events
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
      const sw = screenVideo.videoWidth;
      const sh = screenVideo.videoHeight;
      const cw = cameraVideo.videoWidth;
      const ch = cameraVideo.videoHeight;
      const hasScreen = sw > 0 && sh > 0;
      const hasCamera = cw > 0 && ch > 0;
      
      if (!hasScreen && !hasCamera) return;

      const targetW = hasScreen ? sw : cw;
      const targetH = hasScreen ? sh : ch;

      if (targetW > 0 && targetH > 0) {
        const evenW = Math.floor(targetW) & ~1;
        const evenH = Math.floor(targetH) & ~1;
        const newWidth = Math.max(2, evenW);
        const newHeight = Math.max(2, evenH);

        // Only resize if dimensions actually changed
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          canvasSized = true;
          console.log('Canvas resized to:', newWidth, 'x', newHeight);
        }
      }
      resizeTimeout = null;
    }, RECORDING_CONFIG.TIMING.CANVAS_RESIZE_DEBOUNCE);
  }
  screenVideo.addEventListener('loadedmetadata', applyInitialCanvasSize);
  cameraVideo.addEventListener('loadedmetadata', applyInitialCanvasSize);

  // Render helpers
  function fitContain(srcW: number, srcH: number, dstW: number, dstH: number) {
    const srcAspect = srcW / srcH;
    const dstAspect = dstW / dstH;
    let w = dstW;
    let h = dstH;
    if (srcAspect > dstAspect) {
      h = Math.round(dstW / srcAspect);
    } else {
      w = Math.round(dstH * srcAspect);
    }
    const x = Math.floor((dstW - w) / 2);
    const y = Math.floor((dstH - h) / 2);
    return { x, y, w, h };
  }

  // Render loop using requestVideoFrameCallback when available for better temporal alignment
  let rafId: number | null = null;
  let vfcHandle: number | null = null;
  const useVFC = typeof (screenVideo as any).requestVideoFrameCallback === 'function';
  let hiddenTicker: number | null = null;

  const disposers: Array<() => void> = [];
  const cleanup = () => {
    if (rafId != null) cancelAnimationFrame(rafId);
    // cancelVideoFrameCallback is not standard everywhere, guard it
    const cancelVFC = (screenVideo as any).cancelVideoFrameCallback;
    if (useVFC && vfcHandle != null && typeof cancelVFC === 'function') {
      try { cancelVFC.call(screenVideo, vfcHandle); } catch {}
    }
    if (hiddenTicker != null) {
      clearInterval(hiddenTicker);
      hiddenTicker = null;
    }
    try { document.removeEventListener('visibilitychange', visibilityHandler); } catch {}
    try { screenVideo.pause(); cameraVideo.pause(); } catch {}
    try { screenVideo.srcObject = null; cameraVideo.srcObject = null; } catch {}
    disposers.splice(0).forEach(fn => { try { fn(); } catch {} });
  };

  const render = () => {
    const screenVideoReady = screenVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    const cameraVideoReady = cameraVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

    if (!canvasSized) {
      applyInitialCanvasSize();
    }

    // Clear background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (screenVideoReady) {
      const sw = screenVideo.videoWidth || 1;
      const sh = screenVideo.videoHeight || 1;
      const { x, y, w, h } = fitContain(sw, sh, canvas.width, canvas.height);
      ctx.drawImage(screenVideo, 0, 0, sw, sh, x, y, w, h);
    }

    if (cameraVideoReady) {
      drawCameraOverlay(ctx, cameraVideo, cameraPosition, cameraPositionKey, layout);
    }

    if (!useVFC) {
      rafId = requestAnimationFrame(render);
      onAnimationFrame(rafId);
    }
  };

  // Capture stream from canvas - initialize AFTER videos are ready
  const screenFps = screenStream.getVideoTracks()[0]?.getSettings()?.frameRate;
  const fps = typeof screenFps === 'number' && screenFps > 0 ? Math.min(screenFps, 60) : 30;
  const capturedStream = canvas.captureStream(fps);
  const canvasTrack = capturedStream.getVideoTracks()[0] as any;

  const startRenderLoop = () => {
    console.log('Starting render loop at', fps, 'fps');
    if (useVFC) {
      const vfc = (screenVideo as any).requestVideoFrameCallback.bind(screenVideo);
      const step = (_now: number, _metadata: any) => {
        render();
        vfcHandle = vfc(step);
        if (typeof onAnimationFrame === 'function' && vfcHandle != null) {
          onAnimationFrame(vfcHandle);
        }
      };
      vfcHandle = vfc(step);
    } else {
      rafId = requestAnimationFrame(render);
      onAnimationFrame(rafId);
    }
  };

  const visibilityHandler = () => {
    if (document.hidden) {
      if (hiddenTicker == null) {
        hiddenTicker = window.setInterval(() => {
          try {
            if (canvasTrack && typeof canvasTrack.requestFrame === 'function') {
              canvasTrack.requestFrame();
            }
          } catch {}
          render();
        }, 1000 / 15);
      }
    } else {
      if (hiddenTicker != null) {
        clearInterval(hiddenTicker);
        hiddenTicker = null;
      }
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);
  disposers.push(() => document.removeEventListener('visibilitychange', visibilityHandler));

  // Mix all audio sources into a single track to avoid multi-audio WebM playback issues
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx({ sampleRate: 48000 } as any);
      const destination = audioCtx.createMediaStreamDestination();
      const masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.value = -10;
      masterCompressor.knee.value = 12;
      masterCompressor.ratio.value = 3;
      masterCompressor.attack.value = 0.003;
      masterCompressor.release.value = 0.25;

      const connectIfAny = (stream: MediaStream | null, gainValue: number) => {
        if (!stream) return;
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) return;
        const sourceStream = new MediaStream(audioTracks);
        const src = audioCtx.createMediaStreamSource(sourceStream);
        const gain = audioCtx.createGain();
        gain.gain.value = gainValue;
        src.connect(gain).connect(masterCompressor);
      };

      connectIfAny(screenStream, 0.8);
      connectIfAny(audioStream, 0.8);

      masterCompressor.connect(destination);

      const mixed = destination.stream.getAudioTracks()[0];
      if (mixed) {
        capturedStream.addTrack(mixed);
      }

      const closeCtx = () => { try { audioCtx.close(); } catch {} };
      // close when all captured tracks ended
      const stopIfAllEnded = () => {
        const active = capturedStream.getTracks().some(t => t.readyState === 'live');
        if (!active) {
          closeCtx();
          cleanup();
        }
      };
      capturedStream.getTracks().forEach(t => t.addEventListener('ended', stopIfAllEnded));
      disposers.push(() => capturedStream.getTracks().forEach(t => t.removeEventListener('ended', stopIfAllEnded)));
      disposers.push(closeCtx);
    } else {
      const track = screenStream.getAudioTracks()[0] || (audioStream?.getAudioTracks() || [])[0];
      if (track) capturedStream.addTrack(track);
    }
  } catch {
    const track = screenStream.getAudioTracks()[0] || (audioStream?.getAudioTracks() || [])[0];
    if (track) capturedStream.addTrack(track);
  }

  // Also cleanup when source tracks end
  const onSourceEnded = () => {
    const live = [
      ...screenStream.getTracks(),
      ...cameraStream.getTracks(),
    ].some(t => t.readyState === 'live');
    if (!live) cleanup();
  };
  [...screenStream.getTracks(), ...cameraStream.getTracks()].forEach(t => {
    t.addEventListener('ended', onSourceEnded);
    disposers.push(() => t.removeEventListener('ended', onSourceEnded));
  });

  return capturedStream;
}

function drawCameraOverlay(
  ctx: CanvasRenderingContext2D,
  cameraVideo: HTMLVideoElement,
  position: { x: number; y: number },
  positionKey: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | undefined,
  layout: RecordingLayout
) {
  const baseW = ctx.canvas.width;
  const baseH = ctx.canvas.height;
  const srcW = cameraVideo.videoWidth || 1;
  const srcH = cameraVideo.videoHeight || 1;

  // EXACT MATCH WITH UI: 
  // UI uses w-56 h-56 (224px × 224px) for circle
  // UI uses w-56 h-40 (224px × 160px) for pip/rectangle
  // Scale these pixel values proportionally to canvas size
  
  // UI preview is aspect-video (16:9), calculate scale factor
  const uiPreviewWidth = 1920; // reference width for aspect-video
  const scaleFactor = baseW / uiPreviewWidth;
  
  // Tailwind: w-56 = 14rem = 224px, h-40 = 10rem = 160px, h-56 = 14rem = 224px
  const overlayWidth = Math.round(224 * scaleFactor);
  const overlayHeight = layout === 'circle' ? Math.round(224 * scaleFactor) : Math.round(160 * scaleFactor);
  
  // Tailwind: top/bottom/left/right-6 = 1.5rem = 24px
  const guidePad = Math.round(24 * scaleFactor);
  
  let { x, y } = position;

  if (positionKey === 'top-left') {
    x = guidePad;
    y = guidePad;
  } else if (positionKey === 'top-right') {
    x = baseW - overlayWidth - guidePad;
    y = guidePad;
  } else if (positionKey === 'bottom-left') {
    x = guidePad;
    y = baseH - overlayHeight - guidePad;
  } else if (positionKey === 'bottom-right') {
    x = baseW - overlayWidth - guidePad;
    y = baseH - overlayHeight - guidePad;
  }

  if (layout === 'circle') {
    // For circle: use overlayWidth for both dimensions (square)
    const radius = overlayWidth / 2;
    const centerX = x + radius;
    const centerY = y + radius;

    // Crop from center of camera video for circle
    const cropSize = Math.max(1, Math.min(srcW, srcH));
    const sx = Math.floor((srcW - cropSize) / 2);
    const sy = Math.floor((srcH - cropSize) / 2);

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      cameraVideo,
      sx,
      sy,
      cropSize,
      cropSize,
      centerX - radius,
      centerY - radius,
      overlayWidth,
      overlayWidth
    );
    ctx.restore();

    // Draw white border (4px like UI)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // For PiP: use full camera aspect ratio
    const cornerRadius = Math.round(12 * scaleFactor); // Tailwind rounded-xl = 0.75rem = 12px
    
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + overlayWidth - cornerRadius, y);
    ctx.quadraticCurveTo(x + overlayWidth, y, x + overlayWidth, y + cornerRadius);
    ctx.lineTo(x + overlayWidth, y + overlayHeight - cornerRadius);
    ctx.quadraticCurveTo(x + overlayWidth, y + overlayHeight, x + overlayWidth - cornerRadius, y + overlayHeight);
    ctx.lineTo(x + cornerRadius, y + overlayHeight);
    ctx.quadraticCurveTo(x, y + overlayHeight, x, y + overlayHeight - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();
    ctx.clip();
    
    // Draw full camera video (no cropping for rectangle)
    ctx.drawImage(
      cameraVideo,
      0,
      0,
      srcW,
      srcH,
      x,
      y,
      overlayWidth,
      overlayHeight
    );
    ctx.restore();

    // Draw white border (4px like UI)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + overlayWidth - cornerRadius, y);
    ctx.quadraticCurveTo(x + overlayWidth, y, x + overlayWidth, y + cornerRadius);
    ctx.lineTo(x + overlayWidth, y + overlayHeight - cornerRadius);
    ctx.quadraticCurveTo(x + overlayWidth, y + overlayHeight, x + overlayWidth - cornerRadius, y + overlayHeight);
    ctx.lineTo(x + cornerRadius, y + overlayHeight);
    ctx.quadraticCurveTo(x, y + overlayHeight, x, y + overlayHeight - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();
    ctx.stroke();
  }
}

export class AudioMixer {
  private audioContext: AudioContext;
  private destination: MediaStreamAudioDestinationNode;
  private compressor: DynamicsCompressorNode;

  constructor(sampleRate = 48000) {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioCtx({ sampleRate });
    this.destination = this.audioContext.createMediaStreamDestination();
    this.compressor = this.createCompressor();
  }

  private createCompressor(): DynamicsCompressorNode {
    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.value = -10;
    compressor.knee.value = 12;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressor.connect(this.destination);
    return compressor;
  }

  addStream(stream: MediaStream | null, gain = 0.8): void {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const sourceStream = new MediaStream(audioTracks);
    const source = this.audioContext.createMediaStreamSource(sourceStream);
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = gain;
    source.connect(gainNode).connect(this.compressor);
  }

  getAudioTrack(): MediaStreamTrack | undefined {
    return this.destination.stream.getAudioTracks()[0];
  }

  cleanup(): void {
    try {
      this.audioContext.close();
    } catch (error) {
      console.warn('Error closing audio context:', error);
    }
  }
}

export interface MediaStreamConstraintsExtended extends MediaStreamConstraints {
  video?: MediaTrackConstraints & {
    displaySurface?: 'monitor' | 'window' | 'application' | 'browser';
    contentHint?: 'detail' | 'text' | 'motion';
  };
}

export interface RecordingOptions {
  mimeType: string;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
}

export interface StreamInfo {
  width: number;
  height: number;
  frameRate: number;
  aspectRatio: number;
}
