import { RecordingLayout } from '@/types/layout';
import { RECORDING_CONFIG } from '@/config/recording';

// Non-standard VideoFrameCallback helpers
type RequestVFC = (callback: (now: number, metadata: VideoFrameCallbackMetadata) => void) => number;
type CancelVFC = (handle: number) => void;
type HTMLVideoElementVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: RequestVFC;
  cancelVideoFrameCallback?: CancelVFC;
};

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

  if (screenStream) {
    return createScreenOnlyCanvasStream(screenStream, audioStream, onAnimationFrame);
  }

  if (cameraStream) {
    return createCameraOnlyCanvasStream(cameraStream, audioStream, onAnimationFrame);
  }

  console.warn('No video streams available');
  return new MediaStream();
}

function createCameraOnlyCanvasStream(
  cameraStream: MediaStream,
  audioStream: MediaStream | null,
  onAnimationFrame: (frameId: number) => void
): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = RECORDING_CONFIG.VIDEO.CAMERA.IDEAL_WIDTH;
  canvas.height = RECORDING_CONFIG.VIDEO.CAMERA.IDEAL_HEIGHT;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    console.error('Failed to get canvas context');
    return new MediaStream();
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const cameraVideo = document.createElement('video');
  cameraVideo.srcObject = cameraStream;
  cameraVideo.muted = true;
  cameraVideo.autoplay = true;
  cameraVideo.playsInline = true;

  let cleanedUp = false;
  let rafId: number | null = null;

  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    if (rafId != null) {
      try { cancelAnimationFrame(rafId); } catch { }
      rafId = null;
    }
    try { cameraVideo.pause(); } catch { }
    try { cameraVideo.srcObject = null; } catch { }
  };

  const render = () => {
    if (cameraVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const vw = cameraVideo.videoWidth || canvas.width;
      const vh = cameraVideo.videoHeight || canvas.height;
      if (vw > 0 && vh > 0 && (canvas.width !== vw || canvas.height !== vh)) {
        const evenW = Math.floor(vw) & ~1;
        const evenH = Math.floor(vh) & ~1;
        canvas.width = Math.max(2, evenW);
        canvas.height = Math.max(2, evenH);
      }

      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    rafId = requestAnimationFrame(render);
    onAnimationFrame(rafId);
  };

  const start = () => {
    if (rafId != null) return;
    rafId = requestAnimationFrame(render);
  };

  cameraVideo.addEventListener('loadeddata', start, { once: true });
  cameraVideo.addEventListener('canplay', start, { once: true });
  cameraVideo.play().catch((e) => console.warn('Camera video play error:', e));

  const cameraFps = cameraStream.getVideoTracks()[0]?.getSettings()?.frameRate;
  const fps = typeof cameraFps === 'number' && cameraFps > 0 ? Math.min(cameraFps, 60) : 30;
  const capturedStream = canvas.captureStream(fps);

  const micTrack = audioStream?.getAudioTracks()[0];
  if (micTrack) {
    try { capturedStream.addTrack(micTrack); } catch { }
  }

  const stopHandler = () => cleanup();
  try { capturedStream.addEventListener('inactive', stopHandler, { once: true }); } catch { }
  capturedStream.getTracks().forEach(t => {
    try { t.addEventListener('ended', stopHandler, { once: true }); } catch { }
  });

  return capturedStream;
}

function createScreenOnlyCanvasStream(
  screenStream: MediaStream,
  audioStream: MediaStream | null,
  onAnimationFrame: (frameId: number) => void
): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    console.error('Failed to get canvas context');
    return new MediaStream();
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const screenVideo = document.createElement('video');
  screenVideo.srcObject = screenStream;
  screenVideo.muted = true;
  screenVideo.autoplay = true;
  screenVideo.playsInline = true;

  let cleanedUp = false;
  let renderStarted = false;
  let rafId: number | null = null;
  let audioCtx: AudioContext | null = null;

  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    if (rafId != null) {
      try { cancelAnimationFrame(rafId); } catch { }
      rafId = null;
    }
    try { screenVideo.pause(); } catch { }
    try { screenVideo.srcObject = null; } catch { }
    if (audioCtx) {
      try { audioCtx.close(); } catch { }
      audioCtx = null;
    }
  };

  const startRenderLoop = () => {
    if (renderStarted) return;
    renderStarted = true;

    const vw = screenVideo.videoWidth;
    const vh = screenVideo.videoHeight;
    if (vw > 0 && vh > 0) {
      canvas.width = vw;
      canvas.height = vh;
    }

    const render = () => {
      if (screenVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      }
      rafId = requestAnimationFrame(render);
      onAnimationFrame(rafId);
    };
    rafId = requestAnimationFrame(render);
  };

  screenVideo.addEventListener('loadeddata', startRenderLoop, { once: true });
  screenVideo.addEventListener('canplay', startRenderLoop, { once: true });
  screenVideo.play().catch(e => console.warn('Screen video play error:', e));

  const screenFps = screenStream.getVideoTracks()[0]?.getSettings()?.frameRate;
  const fps = typeof screenFps === 'number' && screenFps > 0 ? Math.min(screenFps, 60) : 30;
  const capturedStream = canvas.captureStream(fps);

  try {
    const AudioCtx = (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx({ sampleRate: 48000 });
      const destination = audioCtx.createMediaStreamDestination();

      const addAudio = (stream: MediaStream | null, gain: number) => {
        if (!stream) return;
        const tracks = stream.getAudioTracks();
        if (tracks.length === 0) return;
        const src = audioCtx!.createMediaStreamSource(new MediaStream(tracks));
        const gainNode = audioCtx!.createGain();
        gainNode.gain.value = gain;
        src.connect(gainNode).connect(destination);
      };

      addAudio(screenStream, 0.8);
      addAudio(audioStream, 0.8);

      const mixed = destination.stream.getAudioTracks()[0];
      if (mixed) capturedStream.addTrack(mixed);
    }
  } catch {
    const track = screenStream.getAudioTracks()[0] || audioStream?.getAudioTracks()[0];
    if (track) capturedStream.addTrack(track);
  }

  const stopHandler = () => cleanup();
  try {
    capturedStream.addEventListener('inactive', stopHandler, { once: true });
  } catch { }
  capturedStream.getTracks().forEach(t => {
    try { t.addEventListener('ended', stopHandler, { once: true }); } catch { }
  });

  return capturedStream;
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
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;

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

  const screenTrackClone = screenStream.getVideoTracks()[0]?.clone();
  const cameraTrackClone = cameraStream.getVideoTracks()[0]?.clone();

  const screenVideo = document.createElement('video');
  screenVideo.srcObject = screenTrackClone ? new MediaStream([screenTrackClone]) : screenStream;
  screenVideo.muted = true;
  screenVideo.autoplay = true;
  screenVideo.playsInline = true;
  screenVideo.setAttribute('playsinline', 'true');
  screenVideo.setAttribute('webkit-playsinline', 'true');

  const cameraVideo = document.createElement('video');
  cameraVideo.srcObject = cameraTrackClone ? new MediaStream([cameraTrackClone]) : cameraStream;
  cameraVideo.muted = true;
  cameraVideo.autoplay = true;
  cameraVideo.playsInline = true;
  cameraVideo.setAttribute('playsinline', 'true');
  cameraVideo.setAttribute('webkit-playsinline', 'true');

  let screenReady = false;
  let cameraReady = false;
  let renderStarted = false;
  let screenTrackEnded = false; // Track when screen share stops mid-recording

  const checkAndStartRender = () => {
    if (!renderStarted && screenReady && cameraReady) {
      renderStarted = true;
      startRenderLoop();
    }
  };

  screenVideo.addEventListener('loadeddata', () => {
    screenReady = true;
    checkAndStartRender();
  }, { once: true });

  cameraVideo.addEventListener('loadeddata', () => {
    cameraReady = true;
    checkAndStartRender();
  }, { once: true });

  screenVideo.addEventListener('canplay', () => {
    if (!screenReady) {
      screenReady = true;
      checkAndStartRender();
    }
  }, { once: true });

  cameraVideo.addEventListener('canplay', () => {
    if (!cameraReady) {
      cameraReady = true;
      checkAndStartRender();
    }
  }, { once: true });

  screenVideo.play().catch((e) => console.warn('Screen video play error:', e));
  cameraVideo.play().catch((e) => console.warn('Camera video play error:', e));

  const originalScreenTrack = screenStream.getVideoTracks()[0];
  if (originalScreenTrack) {
    originalScreenTrack.addEventListener('ended', () => {
      screenTrackEnded = true;
      if (screenTrackClone) {
        screenTrackClone.stop();
      }
    });
  }

  setTimeout(() => {
    if (!renderStarted) {
      console.warn('⚠️ Timeout: Starting render loop without all videos ready');
      renderStarted = true;
      startRenderLoop();
    }
  }, 2000);

  let canvasSized = false;
  let resizeTimeout: NodeJS.Timeout | null = null;

  function applyInitialCanvasSize() {
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

        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          canvasSized = true;
        }
      }
      resizeTimeout = null;
    }, RECORDING_CONFIG.TIMING.CANVAS_RESIZE_DEBOUNCE);
  }
  screenVideo.addEventListener('loadedmetadata', applyInitialCanvasSize);
  cameraVideo.addEventListener('loadedmetadata', applyInitialCanvasSize);

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

  let rafId: number | null = null;
  let vfcHandle: number | null = null;
  const vfcVideo = screenVideo as HTMLVideoElementVFC;
  const useVFC = typeof vfcVideo.requestVideoFrameCallback === 'function';
  let hiddenTicker: number | null = null;

  const disposers: Array<() => void> = [];
  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    if (rafId != null) cancelAnimationFrame(rafId);
    const cancelVFC = vfcVideo.cancelVideoFrameCallback;
    if (useVFC && vfcHandle != null && typeof cancelVFC === 'function') {
      try { cancelVFC.call(vfcVideo, vfcHandle); } catch { }
    }
    if (hiddenTicker != null) {
      clearInterval(hiddenTicker);
      hiddenTicker = null;
    }
    try { document.removeEventListener('visibilitychange', visibilityHandler); } catch { }
    try { screenVideo.pause(); cameraVideo.pause(); } catch { }
    try { screenVideo.srcObject = null; cameraVideo.srcObject = null; } catch { }
    try { screenTrackClone?.stop(); } catch { }
    try { cameraTrackClone?.stop(); } catch { }
    disposers.splice(0).forEach(fn => { try { fn(); } catch { } });
  };

  const render = () => {
    const screenVideoReady = screenVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    const cameraVideoReady = cameraVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

    if (!canvasSized) {
      applyInitialCanvasSize();
    }

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (screenTrackEnded && cameraVideoReady) {
      const cw = cameraVideo.videoWidth || 1;
      const ch = cameraVideo.videoHeight || 1;
      const { x, y, w, h } = fitContain(cw, ch, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(cameraVideo, 0, 0, cw, ch, 0, 0, w, h);
      ctx.restore();
    } else {
      if (screenVideoReady) {
        const sw = screenVideo.videoWidth || 1;
        const sh = screenVideo.videoHeight || 1;
        const { x, y, w, h } = fitContain(sw, sh, canvas.width, canvas.height);
        ctx.drawImage(screenVideo, 0, 0, sw, sh, x, y, w, h);
      }

      if (cameraVideoReady) {
        drawCameraOverlay(ctx, cameraVideo, cameraPosition, cameraPositionKey, layout);
      }
    }

    if (!useVFC) {
      rafId = requestAnimationFrame(render);
      onAnimationFrame(rafId);
    }
  };

  const screenFps = screenStream.getVideoTracks()[0]?.getSettings()?.frameRate;
  const fps = typeof screenFps === 'number' && screenFps > 0 ? Math.min(screenFps, 60) : 30;
  const capturedStream = canvas.captureStream(fps);
  const canvasTrack = capturedStream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };

  const startRenderLoop = () => {
    if (useVFC && vfcVideo.requestVideoFrameCallback) {
      const vfc = vfcVideo.requestVideoFrameCallback.bind(vfcVideo) as RequestVFC;
      const step = () => {
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
          } catch { }
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

  try {
    const AudioCtx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx({ sampleRate: 48000 });
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

      const closeCtx = () => { try { audioCtx.close(); } catch { } };
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

  const onCapturedStop = () => cleanup();
  try {
    capturedStream.addEventListener('inactive', onCapturedStop, { once: true });
    disposers.push(() => {
      try { capturedStream.removeEventListener('inactive', onCapturedStop); } catch { }
    });
  } catch { }
  capturedStream.getTracks().forEach(t => {
    try { t.addEventListener('ended', onCapturedStop); } catch { }
    disposers.push(() => {
      try { t.removeEventListener('ended', onCapturedStop); } catch { }
    });
  });

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

  const uiPreviewWidth = 1920;
  const scaleFactor = baseW / uiPreviewWidth;

  const overlayWidth = Math.round(400 * scaleFactor);
  const overlayHeight = layout === 'circle' ? Math.round(400 * scaleFactor) : Math.round(280 * scaleFactor);

  const guidePad = Math.round(40 * scaleFactor);

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
    const radius = overlayWidth / 2;
    const centerX = x + radius;
    const centerY = y + radius;

    const cropSize = Math.max(1, Math.min(srcW, srcH));
    const sx = Math.floor((srcW - cropSize) / 2);
    const sy = Math.floor((srcH - cropSize) / 2);

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.translate(centerX + radius, centerY - radius);
    ctx.scale(-1, 1);
    ctx.drawImage(
      cameraVideo,
      sx,
      sy,
      cropSize,
      cropSize,
      0,
      0,
      overlayWidth,
      overlayWidth
    );
    ctx.restore();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const cornerRadius = Math.round(12 * scaleFactor);

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

    ctx.translate(x + overlayWidth, y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      cameraVideo,
      0,
      0,
      srcW,
      srcH,
      0,
      0,
      overlayWidth,
      overlayHeight
    );
    ctx.restore();

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
    const AudioCtx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      throw new Error('Web Audio API is not supported in this environment');
    }
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
