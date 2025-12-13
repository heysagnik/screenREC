import { useCallback, useEffect, useRef, useState } from 'react';
import { SUPPORTED_CODECS, RECORDING_CONFIG } from '@/config/recording';

interface UseRecordingOptions {
  onRecordingComplete: (blob: Blob) => void;
}

export function useRecording({ onRecordingComplete }: UseRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<RecordingError | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);
  const startGuardRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const startRecording = useCallback(async (stream: MediaStream) => {
    try {
      setError(null);

      if (startGuardRef.current || (mediaRecorderRef.current?.state === 'recording')) {
        console.warn('Recording already in progress');
        return;
      }

      startGuardRef.current = true;

      if (!stream || stream.getTracks().length === 0) {
        throw new RecordingError(
          RecordingErrorCode.STREAM_INACTIVE,
          'Invalid or empty stream provided',
          true,
          'Please select a screen or camera to record'
        );
      }

      const codec = findSupportedCodec();
      if (!codec) {
        throw new RecordingError(
          RecordingErrorCode.CODEC_NOT_SUPPORTED,
          'No supported codec found',
          false,
          'Your browser does not support video recording'
        );
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: codec.mimeType,
        videoBitsPerSecond: codec.videoBitsPerSecond,
        audioBitsPerSecond: RECORDING_CONFIG.AUDIO.BITRATE,
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      type RecorderErrorEvent = Event & { error?: DOMException };
      mediaRecorder.onerror = (e: RecorderErrorEvent) => {
        const dom = e.error;
        const recErr = dom ? RecordingError.fromDOMException(dom) : new RecordingError(
          RecordingErrorCode.RECORDER_FAILED,
          'MediaRecorder error',
          true,
          'Recording failed unexpectedly'
        );
        setError(recErr);
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          startGuardRef.current = false;
          return;
        }

        const tryTypes = [
          mediaRecorder.mimeType,
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ].filter(Boolean) as string[];

        const videoEl = document.createElement('video');
        let finalBlob: Blob | null = null;
        for (const t of tryTypes) {
          const canPlay = videoEl.canPlayType(t as string);
          const typeToUse = canPlay ? (t as string) : 'video/webm';
          try {
            const candidate = new Blob(chunksRef.current, { type: typeToUse });
            if (candidate.size > 0) {
              finalBlob = candidate;
              break;
            }
          } catch {
          }
        }

        if (!finalBlob) {
          finalBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        }

        onRecordingComplete(finalBlob);

        chunksRef.current = [];
        startGuardRef.current = false;
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          setRecordingTime((prev) => prev + 1);
        }
      }, 1000);

    } catch (err) {
      const recordingError = err instanceof RecordingError
        ? err
        : new RecordingError(
          RecordingErrorCode.UNKNOWN,
          err instanceof Error ? err.message : 'Unknown error',
          true
        );
      setError(recordingError);
      startGuardRef.current = false;
      throw recordingError;
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      const recorder = mediaRecorderRef.current;
      const recordingStream = recorder.stream;

      // IMMEDIATELY stop all tracks on the recording stream
      // This includes the CLONED tracks from combineStreams which keep the camera/screen active
      console.log('[useRecording] Stopping recording stream tracks immediately');
      recordingStream.getTracks().forEach((track) => {
        console.log(`[useRecording] Stopping track: ${track.kind} - ${track.label}, readyState=${track.readyState}`);
        try {
          track.stop();
          console.log(`[useRecording] After stop: readyState=${track.readyState}`);
        } catch (e) {
          console.warn('[useRecording] Failed to stop track:', e);
        }
      });

      // Request any remaining data before stopping
      try { recorder.requestData(); } catch { }

      // Stop the MediaRecorder
      setTimeout(() => {
        if (recorder.state !== 'inactive') {
          try { recorder.stop(); } catch (error) { console.error('Error stopping recorder:', error); }
        }
      }, 100);

      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (isPaused) {
      try { mediaRecorderRef.current.resume(); } catch { }
      setIsPaused(false);
    } else {
      try { mediaRecorderRef.current.pause(); } catch { }
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      try { mediaRecorderRef.current?.stop(); } catch { }
    }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    mediaRecorderRef.current?.stream.getTracks().forEach(track => { try { track.stop(); } catch { } });
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    startGuardRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    cleanup,
  };
}

export enum RecordingErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  RECORDER_FAILED = 'RECORDER_FAILED',
  STREAM_INACTIVE = 'STREAM_INACTIVE',
  CODEC_NOT_SUPPORTED = 'CODEC_NOT_SUPPORTED',
  UNKNOWN = 'UNKNOWN',
}

export class RecordingError extends Error {
  constructor(
    public code: RecordingErrorCode,
    message: string,
    public recoverable: boolean = false,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'RecordingError';
  }

  static fromDOMException(error: DOMException): RecordingError {
    const errorMap: Record<string, RecordingErrorCode> = {
      'NotAllowedError': RecordingErrorCode.PERMISSION_DENIED,
      'NotFoundError': RecordingErrorCode.DEVICE_NOT_FOUND,
      'NotReadableError': RecordingErrorCode.DEVICE_NOT_FOUND,
      'OverconstrainedError': RecordingErrorCode.DEVICE_NOT_FOUND,
    };

    const code = errorMap[error.name] || RecordingErrorCode.UNKNOWN;
    const userMessages: Record<RecordingErrorCode, string> = {
      [RecordingErrorCode.PERMISSION_DENIED]: 'Please grant camera/microphone permissions',
      [RecordingErrorCode.DEVICE_NOT_FOUND]: 'No camera or microphone found',
      [RecordingErrorCode.RECORDER_FAILED]: 'Recording failed. Please try again',
      [RecordingErrorCode.STREAM_INACTIVE]: 'Recording stream became inactive',
      [RecordingErrorCode.CODEC_NOT_SUPPORTED]: 'Your browser does not support recording',
      [RecordingErrorCode.UNKNOWN]: 'An unexpected error occurred',
    };

    return new RecordingError(
      code,
      error.message,
      code !== RecordingErrorCode.CODEC_NOT_SUPPORTED,
      userMessages[code]
    );
  }
}

function findSupportedCodec(): MediaRecorderOptions | null {
  for (const codec of SUPPORTED_CODECS) {
    if (MediaRecorder.isTypeSupported(codec.mimeType)) {
      return { ...codec };
    }
  }

  return null;
}