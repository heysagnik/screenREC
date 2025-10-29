/**
 * Recording Configuration
 * Centralized constants for media capture settings
 */

export const RECORDING_CONFIG = {
  // Video quality presets
  VIDEO: {
    SCREEN: {
      MAX_WIDTH: 7680,
      MAX_HEIGHT: 4320,
      IDEAL_FRAMERATE: 60,
      MAX_FRAMERATE: 60,
    },
    CAMERA: {
      IDEAL_WIDTH: 1280,
      IDEAL_HEIGHT: 720,
      FRAMERATE: 30,
    },
    BITRATES: {
      VP9_OPUS: 14_000_000,
      VP8_OPUS: 14_000_000,
      VP8: 14_000_000,
      WEBM_FALLBACK: 8_000_000,
    },
  },

  // Audio settings
  AUDIO: {
    SAMPLE_RATE: 48000,
    BITRATE: 256000,
    ECHO_CANCELLATION: true,
    NOISE_SUPPRESSION: true,
    AUTO_GAIN_CONTROL: true,
  },

  // Canvas rendering
  CANVAS: {
    MIN_DIMENSION: 2,
    DEFAULT_FPS: 30,
    MAX_FPS: 60,
    HIDDEN_TAB_FPS: 15,
    IMAGE_SMOOTHING_QUALITY: 'high' as ImageSmoothingQuality,
  },

  // Overlay sizing (PiP camera)
  OVERLAY: {
    MIN_SIZE: 240,
    SIZE_RATIO: 0.30, // 30% of canvas dimension
    PADDING: 24,
    BORDER_WIDTH: 4,
    BORDER_RADIUS: {
      CIRCLE: '50%',
      RECTANGLE: '12px',
    },
  },

  // Audio mixing
  AUDIO_MIXING: {
    COMPRESSOR: {
      THRESHOLD: -10,
      KNEE: 12,
      RATIO: 3,
      ATTACK: 0.003,
      RELEASE: 0.25,
    },
    GAIN: {
      SCREEN: 0.8,
      MICROPHONE: 0.8,
    },
  },

  // Recording timing
  TIMING: {
    COUNTDOWN_SECONDS: 3,
    RECORDER_STOP_DELAY: 150,
    TRACK_STOP_DELAY: 300,
    CANVAS_RESIZE_DEBOUNCE: 100,
  },

  // Notification display
  NOTIFICATIONS: {
    AUTO_DISMISS_MS: 5000,
  },
} as const;

/**
 * Supported codecs in priority order
 */
export const SUPPORTED_CODECS = [
  { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: RECORDING_CONFIG.VIDEO.BITRATES.VP9_OPUS },
  { mimeType: 'video/webm;codecs=vp8,opus', videoBitsPerSecond: RECORDING_CONFIG.VIDEO.BITRATES.VP8_OPUS },
  { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: RECORDING_CONFIG.VIDEO.BITRATES.VP8 },
  { mimeType: 'video/webm', videoBitsPerSecond: RECORDING_CONFIG.VIDEO.BITRATES.WEBM_FALLBACK },
] as const;

/**
 * Helper to get device-optimized screen capture constraints
 */
export function getScreenCaptureConstraints() {
  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  const maxW = Math.min(RECORDING_CONFIG.VIDEO.SCREEN.MAX_WIDTH, Math.floor(window.screen.width * dpr));
  const maxH = Math.min(RECORDING_CONFIG.VIDEO.SCREEN.MAX_HEIGHT, Math.floor(window.screen.height * dpr));

  return {
    video: {
      displaySurface: 'monitor' as const,
      width: { ideal: maxW, max: maxW },
      height: { ideal: maxH, max: maxH },
      frameRate: { 
        ideal: RECORDING_CONFIG.VIDEO.SCREEN.IDEAL_FRAMERATE, 
        max: RECORDING_CONFIG.VIDEO.SCREEN.MAX_FRAMERATE 
      },
    },
    audio: {
      echoCancellation: RECORDING_CONFIG.AUDIO.ECHO_CANCELLATION,
      noiseSuppression: RECORDING_CONFIG.AUDIO.NOISE_SUPPRESSION,
      sampleRate: RECORDING_CONFIG.AUDIO.SAMPLE_RATE,
    },
  };
}

/**
 * Helper to get camera capture constraints
 */
export function getCameraCaptureConstraints() {
  return {
    video: {
      width: { ideal: RECORDING_CONFIG.VIDEO.CAMERA.IDEAL_WIDTH },
      height: { ideal: RECORDING_CONFIG.VIDEO.CAMERA.IDEAL_HEIGHT },
      facingMode: 'user' as const,
      frameRate: { 
        ideal: RECORDING_CONFIG.VIDEO.CAMERA.FRAMERATE, 
        max: RECORDING_CONFIG.VIDEO.CAMERA.FRAMERATE 
      },
    },
    audio: false,
  };
}

/**
 * Helper to get microphone capture constraints
 */
export function getMicrophoneCaptureConstraints() {
  return {
    audio: {
      echoCancellation: RECORDING_CONFIG.AUDIO.ECHO_CANCELLATION,
      noiseSuppression: RECORDING_CONFIG.AUDIO.NOISE_SUPPRESSION,
      autoGainControl: RECORDING_CONFIG.AUDIO.AUTO_GAIN_CONTROL,
      sampleRate: RECORDING_CONFIG.AUDIO.SAMPLE_RATE,
    },
  };
}
