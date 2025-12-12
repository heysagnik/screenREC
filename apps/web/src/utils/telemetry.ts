/**
 * Telemetry and Analytics
 * Lightweight event tracking for improving product quality
 * 
 * Note: Replace with your preferred analytics provider
 * (Google Analytics, PostHog, Mixpanel, etc.)
 */

export enum TelemetryEvent {
  // Recording lifecycle
  RECORDING_STARTED = 'recording_started',
  RECORDING_STOPPED = 'recording_stopped',
  RECORDING_PAUSED = 'recording_paused',
  RECORDING_RESUMED = 'recording_resumed',
  RECORDING_COMPLETED = 'recording_completed',
  
  // Media sources
  SCREEN_SHARE_STARTED = 'screen_share_started',
  SCREEN_SHARE_STOPPED = 'screen_share_stopped',
  CAMERA_ENABLED = 'camera_enabled',
  CAMERA_DISABLED = 'camera_disabled',
  MIC_ENABLED = 'mic_enabled',
  MIC_DISABLED = 'mic_disabled',
  
  // Errors
  RECORDING_ERROR = 'recording_error',
  PERMISSION_DENIED = 'permission_denied',
  CODEC_NOT_SUPPORTED = 'codec_not_supported',
  STREAM_ERROR = 'stream_error',
  
  // User actions
  LAYOUT_CHANGED = 'layout_changed',
  KEYBOARD_SHORTCUT_USED = 'keyboard_shortcut_used',
  VIDEO_DOWNLOADED = 'video_downloaded',
}

interface TelemetryProperties {
  [key: string]: string | number | boolean | undefined;
}

class TelemetryService {
  private enabled: boolean;
  private debug: boolean;

  constructor() {
    // Only enable in production, disable in development
    this.enabled = process.env.NODE_ENV === 'production';
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Track an event with optional properties
   */
  track(event: TelemetryEvent, properties?: TelemetryProperties): void {
    if (!this.enabled) {
      if (this.debug) {
        console.log('[Telemetry]', event, properties);
      }
      return;
    }

    try {
      // Example: Send to your analytics provider
      // window.gtag?.('event', event, properties);
      // window.posthog?.capture(event, properties);
      // window.mixpanel?.track(event, properties);
      
      console.log('[Telemetry]', event, properties);
    } catch (error) {
      console.error('Telemetry error:', error);
    }
  }

  /**
   * Track recording errors with context
   */
  trackError(error: Error, context?: TelemetryProperties): void {
    this.track(TelemetryEvent.RECORDING_ERROR, {
      error_name: error.name,
      error_message: error.message,
      ...context,
    });
  }

  /**
   * Track recording session metrics
   */
  trackRecordingMetrics(metrics: {
    duration: number;
    hasScreen: boolean;
    hasCamera: boolean;
    hasMic: boolean;
    layout: string;
    codec: string;
    fileSize: number;
  }): void {
    this.track(TelemetryEvent.RECORDING_COMPLETED, metrics);
  }

  /**
   * Track user preferences
   */
  trackUserPreference(preference: string, value: string | number | boolean): void {
    if (!this.enabled) return;

    try {
      // Store user preferences for analytics
      console.log('[Preference]', preference, value);
    } catch (error) {
      console.error('Preference tracking error:', error);
    }
  }
}

export const telemetry = new TelemetryService();

/**
 * Helper to measure performance
 */
export function measurePerformance<T>(
  label: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Helper for async performance measurement
 */
export async function measurePerformanceAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}
