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
  const isStoppingRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const createBlobFromChunks = useCallback((mimeType: string): Blob => {
    const tryTypes = [mimeType, 'video/webm;codecs=vp8,opus', 'video/webm'].filter(Boolean);

    for (const type of tryTypes) {
      try {
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size > 0) return blob;
      } catch { /* continue to next type */ }
    }

    return new Blob(chunksRef.current, { type: 'video/webm' });
  }, []);

  const startRecording = useCallback(async (stream: MediaStream) => {
    if (isStoppingRef.current || mediaRecorderRef.current?.state === 'recording') {
      return;
    }

    setError(null);
    isStoppingRef.current = false;

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
      if (event.data?.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onerror = (e: Event & { error?: DOMException }) => {
      const recErr = e.error
        ? RecordingError.fromDOMException(e.error)
        : new RecordingError(RecordingErrorCode.RECORDER_FAILED, 'MediaRecorder error', true);
      setError(recErr);
      clearTimer();
      setIsRecording(false);
      isStoppingRef.current = false;
    };

    mediaRecorder.onstop = () => {
      clearTimer();
      setIsRecording(false);
      setIsPaused(false);
      isStoppingRef.current = false;

      if (chunksRef.current.length > 0) {
        const blob = createBlobFromChunks(mediaRecorder.mimeType);
        onRecordingComplete(blob);
      }

      chunksRef.current = [];
    };

    mediaRecorder.start(1000);
    setIsRecording(true);
    setRecordingTime(0);

    timerIntervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setRecordingTime((prev) => prev + 1);
      }
    }, 1000);
  }, [onRecordingComplete, clearTimer, createBlobFromChunks]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || !isRecording || isStoppingRef.current) return;

    isStoppingRef.current = true;

    try { recorder.requestData(); } catch { /* ignore */ }

    setTimeout(() => {
      if (recorder.state !== 'inactive') {
        try { recorder.stop(); } catch { /* ignore */ }
      }
    }, RECORDING_CONFIG.TIMING.RECORDER_STOP_DELAY);
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || !isRecording) return;

    if (isPaused) {
      try { recorder.resume(); } catch { /* ignore */ }
      setIsPaused(false);
    } else {
      try { recorder.pause(); } catch { /* ignore */ }
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  const cleanup = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state !== 'inactive') {
      try { recorder?.stop(); } catch { /* ignore */ }
    }

    clearTimer();

    recorder?.stream.getTracks().forEach(track => {
      try { track.stop(); } catch { /* ignore */ }
    });

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    isStoppingRef.current = false;
  }, [clearTimer]);

  useEffect(() => cleanup, [cleanup]);

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