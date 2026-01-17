'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { SUPPORTED_CODECS, RECORDING_CONFIG } from '@/config/recording';

export type RecordingState = 'idle' | 'starting' | 'recording' | 'paused' | 'stopping' | 'stopped';

export interface RecordingResult {
    screenUrl: string | null;
    cameraUrl: string | null;
    audioUrl: string | null;
    screenBlob: Blob | null;
    cameraBlob: Blob | null;
    audioBlob: Blob | null;
    duration: number;
    projectId: string;
}

export interface StreamSources {
    screenStream: MediaStream | null;
    cameraStream: MediaStream | null;
    audioStream: MediaStream | null;
}

interface UseMultiStreamRecordingOptions {
    onRecordingComplete: (result: RecordingResult) => void;
    onError?: (error: Error) => void;
}

interface StreamRecorder {
    recorder: MediaRecorder;
    chunks: Blob[];
    fileHandle: FileSystemFileHandle | null;
    writable: FileSystemWritableFileStream | null;
    type: 'screen' | 'camera' | 'audio';
}


function findSupportedVideoCodec(): MediaRecorderOptions | null {
    for (const codec of SUPPORTED_CODECS) {
        if (MediaRecorder.isTypeSupported(codec.mimeType)) {
            return { ...codec };
        }
    }
    return null;
}

function findSupportedAudioCodec(): string {
    const audioCodecs = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
    ];
    for (const codec of audioCodecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
            return codec;
        }
    }
    return 'audio/webm';
}


export function useMultiStreamRecording({ onRecordingComplete, onError }: UseMultiStreamRecordingOptions) {
    // State machine - single source of truth
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [recordingTime, setRecordingTime] = useState(0);

    // Refs for stable values during async operations
    const recordersRef = useRef<StreamRecorder[]>([]);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0); // Total time spent paused
    const pauseStartRef = useRef<number>(0);  // When current pause started
    const projectDirRef = useRef<FileSystemDirectoryHandle | null>(null);
    const projectIdRef = useRef<string>('');
    const webLockRef = useRef<{ release: () => void } | null>(null);
    const stateRef = useRef<RecordingState>('idle');

    // Keep stateRef in sync with state
    useEffect(() => {
        stateRef.current = recordingState;
    }, [recordingState]);

    // Derived states for backwards compatibility
    const isRecording = recordingState === 'recording' || recordingState === 'paused';
    const isPaused = recordingState === 'paused';


    const clearTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        clearTimer();
        timerIntervalRef.current = setInterval(() => {
            if (stateRef.current === 'recording') {
                const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
                setRecordingTime(Math.floor(elapsed / 1000));
            }
        }, 1000);
    }, [clearTimer]);


    const acquireWebLock = useCallback(async () => {
        if (!('locks' in navigator)) return;

        try {
            // Request a lock that will be held until we release it
            const lockPromise = new Promise<void>((resolve) => {
                navigator.locks.request('screen-recording', { mode: 'exclusive' }, async () => {
                    // This callback runs while we hold the lock
                    return new Promise<void>((releaseLock) => {
                        webLockRef.current = { release: () => { releaseLock(); resolve(); } };
                    });
                });
            });

            // Don't await - the lock is held in the background
            void lockPromise;
        } catch (e) {
            console.warn('[Recording] Could not acquire web lock:', e);
        }
    }, []);

    const releaseWebLock = useCallback(() => {
        if (webLockRef.current) {
            webLockRef.current.release();
            webLockRef.current = null;
        }
    }, []);

    const createStreamingRecorder = useCallback(async (
        stream: MediaStream,
        options: MediaRecorderOptions,
        type: 'screen' | 'camera' | 'audio',
        projectDir: FileSystemDirectoryHandle
    ): Promise<StreamRecorder> => {
        const filename = `${type}.webm`;
        let fileHandle: FileSystemFileHandle | null = null;
        let writable: FileSystemWritableFileStream | null = null;

        try {
            fileHandle = await projectDir.getFileHandle(filename, { create: true });
            writable = await fileHandle.createWritable();
        } catch (e) {
            console.warn(`[Recording] Could not create OPFS file for ${type}, using memory:`, e);
        }

        const recorder = new MediaRecorder(stream, options);
        const chunks: Blob[] = [];

        // Stream chunks directly to file OR buffer in memory
        recorder.ondataavailable = async (event) => {
            if (event.data?.size > 0) {
                // Always keep in memory for preview
                chunks.push(event.data);

                // Also write to OPFS if available
                if (writable) {
                    try {
                        await writable.write(event.data);
                    } catch (e) {
                        console.warn(`[Recording] Failed to write ${type} chunk to OPFS:`, e);
                    }
                }
            }
        };

        return { recorder, chunks, fileHandle, writable, type };
    }, []);

    const startRecording = useCallback(async (sources: StreamSources) => {
        // Guard: only start from idle state
        if (stateRef.current !== 'idle') {
            console.warn('[Recording] Cannot start: already recording or stopping');
            return;
        }

        setRecordingState('starting');

        const videoCodec = findSupportedVideoCodec();
        const audioCodec = findSupportedAudioCodec();

        if (!videoCodec) {
            const error = new Error('No supported video codec found');
            onError?.(error);
            setRecordingState('idle');
            return;
        }

        // Count available sources
        const hasScreen = !!sources.screenStream?.getVideoTracks().length;
        const hasCamera = !!sources.cameraStream?.getVideoTracks().length;
        const hasScreenAudio = !!sources.screenStream?.getAudioTracks().length;
        const hasMic = !!sources.audioStream?.getAudioTracks().length;

        if (!hasScreen && !hasCamera && !hasMic) {
            const error = new Error('No media sources available to record');
            onError?.(error);
            setRecordingState('idle');
            return;
        }

        try {
            // Acquire web lock to prevent tab suspension
            await acquireWebLock();

            // Create project directory in OPFS
            const root = await navigator.storage.getDirectory();
            const projectsDir = await root.getDirectoryHandle('projects', { create: true });
            const projectId = `project-${Date.now()}`;
            const projectDir = await projectsDir.getDirectoryHandle(projectId, { create: true });

            projectDirRef.current = projectDir;
            projectIdRef.current = projectId;

            const recorders: StreamRecorder[] = [];

            // Create screen recorder (video only, audio handled separately)
            if (hasScreen) {
                const screenVideoTrack = sources.screenStream!.getVideoTracks()[0];
                const screenVideoStream = new MediaStream([screenVideoTrack]);
                const screenRecorder = await createStreamingRecorder(
                    screenVideoStream,
                    {
                        mimeType: videoCodec.mimeType,
                        videoBitsPerSecond: videoCodec.videoBitsPerSecond,
                    },
                    'screen',
                    projectDir
                );
                recorders.push(screenRecorder);
            }

            // Create camera recorder
            if (hasCamera) {
                const cameraVideoTrack = sources.cameraStream!.getVideoTracks()[0];
                const cameraVideoStream = new MediaStream([cameraVideoTrack]);
                const cameraRecorder = await createStreamingRecorder(
                    cameraVideoStream,
                    {
                        mimeType: videoCodec.mimeType,
                        videoBitsPerSecond: videoCodec.videoBitsPerSecond,
                    },
                    'camera',
                    projectDir
                );
                recorders.push(cameraRecorder);
            }

            // Create audio recorder (mixed if multiple sources)
            if (hasScreenAudio || hasMic) {
                let audioStream: MediaStream;
                const screenAudioTrack = hasScreenAudio ? sources.screenStream!.getAudioTracks()[0] : null;
                const micAudioTrack = hasMic ? sources.audioStream!.getAudioTracks()[0] : null;

                if (screenAudioTrack && micAudioTrack) {
                    // Mix screen audio and mic
                    try {
                        const AudioCtx = window.AudioContext ||
                            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                        const audioCtx = new AudioCtx({ sampleRate: RECORDING_CONFIG.AUDIO.SAMPLE_RATE });
                        const destination = audioCtx.createMediaStreamDestination();

                        // Add compressor for better audio quality
                        const compressor = audioCtx.createDynamicsCompressor();
                        compressor.threshold.value = RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.THRESHOLD;
                        compressor.knee.value = RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.KNEE;
                        compressor.ratio.value = RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.RATIO;
                        compressor.attack.value = RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.ATTACK;
                        compressor.release.value = RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.RELEASE;
                        compressor.connect(destination);

                        // Screen audio
                        const screenSource = audioCtx.createMediaStreamSource(new MediaStream([screenAudioTrack]));
                        const screenGain = audioCtx.createGain();
                        screenGain.gain.value = RECORDING_CONFIG.AUDIO_MIXING.GAIN.SCREEN;
                        screenSource.connect(screenGain).connect(compressor);

                        // Mic audio
                        const micSource = audioCtx.createMediaStreamSource(new MediaStream([micAudioTrack]));
                        const micGain = audioCtx.createGain();
                        micGain.gain.value = RECORDING_CONFIG.AUDIO_MIXING.GAIN.MICROPHONE;
                        micSource.connect(micGain).connect(compressor);

                        audioStream = destination.stream;
                    } catch {
                        // Fallback to mic only
                        audioStream = new MediaStream([micAudioTrack]);
                    }
                } else {
                    audioStream = new MediaStream([screenAudioTrack || micAudioTrack!]);
                }

                const audioRecorder = await createStreamingRecorder(
                    audioStream,
                    {
                        mimeType: audioCodec,
                        audioBitsPerSecond: RECORDING_CONFIG.AUDIO.BITRATE,
                    },
                    'audio',
                    projectDir
                );
                recorders.push(audioRecorder);
            }

            if (recorders.length === 0) {
                throw new Error('No recorders created');
            }

            recordersRef.current = recorders;
            startTimeRef.current = Date.now();
            pausedTimeRef.current = 0;

            // Start all recorders simultaneously
            const chunkInterval = 1000; // 1 second chunks for reliable streaming
            recorders.forEach(({ recorder }) => {
                recorder.start(chunkInterval);
            });

            console.log(`[Recording] Started ${recorders.length} recorder(s)`);

            setRecordingState('recording');
            setRecordingTime(0);
            startTimer();

        } catch (e) {
            console.error('[Recording] Failed to start:', e);
            const error = e instanceof Error ? e : new Error('Failed to start recording');
            onError?.(error);
            releaseWebLock();
            setRecordingState('idle');
        }
    }, [acquireWebLock, createStreamingRecorder, onError, releaseWebLock, startTimer]);

    const pauseRecording = useCallback(() => {
        if (stateRef.current === 'recording') {
            // Pause all recorders
            recordersRef.current.forEach(({ recorder }) => {
                if (recorder.state === 'recording') {
                    try {
                        recorder.pause();
                    } catch (e) {
                        console.warn('[Recording] Failed to pause recorder:', e);
                    }
                }
            });

            pauseStartRef.current = Date.now();
            setRecordingState('paused');
            console.log('[Recording] Paused');

        } else if (stateRef.current === 'paused') {
            // Resume all recorders
            recordersRef.current.forEach(({ recorder }) => {
                if (recorder.state === 'paused') {
                    try {
                        recorder.resume();
                    } catch (e) {
                        console.warn('[Recording] Failed to resume recorder:', e);
                    }
                }
            });

            // Add paused duration
            pausedTimeRef.current += Date.now() - pauseStartRef.current;
            setRecordingState('recording');
            console.log('[Recording] Resumed');
        }
    }, []);


    const stopRecording = useCallback(async () => {
        // Guard: only stop if actually recording
        if (stateRef.current !== 'recording' && stateRef.current !== 'paused') {
            console.warn('[Recording] Cannot stop: not recording');
            return;
        }

        setRecordingState('stopping');
        clearTimer();

        const duration = (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000;
        const recorders = recordersRef.current;
        const projectDir = projectDirRef.current;

        // Stop all recorders with proper sequencing
        const stopPromises = recorders.map(({ recorder, writable, type }) => {
            return new Promise<{ type: string; success: boolean }>((resolve) => {
                const timeout = setTimeout(() => {
                    console.warn(`[Recording] ${type} stop timed out`);
                    resolve({ type, success: false });
                }, 5000);

                recorder.onstop = async () => {
                    clearTimeout(timeout);
                    try {
                        if (writable) {
                            await writable.close();
                        }
                        console.log(`[Recording] ${type} stream saved`);
                        resolve({ type, success: true });
                    } catch (e) {
                        console.warn(`[Recording] Failed to close ${type} stream:`, e);
                        resolve({ type, success: false });
                    }
                };

                // Request any remaining data
                try {
                    if (recorder.state === 'recording' || recorder.state === 'paused') {
                        recorder.requestData();
                    }
                } catch { /* ignore */ }

                // Stop after a short delay to ensure data is flushed
                setTimeout(() => {
                    if (recorder.state !== 'inactive') {
                        try {
                            recorder.stop();
                        } catch {
                            clearTimeout(timeout);
                            resolve({ type, success: false });
                        }
                    }
                }, 100);
            });
        });

        await Promise.all(stopPromises);

        // Build result with blob URLs for preview
        const result: RecordingResult = {
            screenUrl: null,
            cameraUrl: null,
            audioUrl: null,
            screenBlob: null,
            cameraBlob: null,
            audioBlob: null,
            duration,
            projectId: projectIdRef.current,
        };

        // Create blobs from chunks and generate URLs
        for (const { type, chunks, fileHandle } of recorders) {
            let blob: Blob | null = null;

            if (chunks.length > 0) {
                const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';
                blob = new Blob(chunks, { type: mimeType });
            } else if (fileHandle) {
                // Fallback: read from OPFS
                try {
                    blob = await fileHandle.getFile();
                } catch { /* ignore */ }
            }

            if (blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                if (type === 'screen') {
                    result.screenUrl = url;
                    result.screenBlob = blob;
                } else if (type === 'camera') {
                    result.cameraUrl = url;
                    result.cameraBlob = blob;
                } else if (type === 'audio') {
                    result.audioUrl = url;
                    result.audioBlob = blob;
                }
            }
        }

        // Save manifest
        if (projectDir) {
            try {
                const manifest = {
                    id: projectIdRef.current,
                    name: `Recording ${new Date().toLocaleString()}`,
                    createdAt: Date.now(),
                    duration,
                    streams: {} as Record<string, { filename: string; type: string }>,
                };

                for (const { type, fileHandle } of recorders) {
                    if (fileHandle) {
                        try {
                            const file = await fileHandle.getFile();
                            manifest.streams[type] = {
                                filename: `${type}.webm`,
                                type: file.type,
                            };
                        } catch { /* ignore */ }
                    }
                }

                const manifestHandle = await projectDir.getFileHandle('manifest.json', { create: true });
                const manifestWritable = await manifestHandle.createWritable();
                await manifestWritable.write(JSON.stringify(manifest, null, 2));
                await manifestWritable.close();
            } catch (e) {
                console.warn('[Recording] Failed to save manifest:', e);
            }
        }

        console.log('[Recording] Complete:', {
            screen: result.screenBlob?.size || 0,
            camera: result.cameraBlob?.size || 0,
            audio: result.audioBlob?.size || 0,
            duration,
            projectId: projectIdRef.current,
        });

        // Cleanup
        recordersRef.current = [];
        projectDirRef.current = null;
        releaseWebLock();

        setRecordingState('stopped');
        onRecordingComplete(result);

    }, [clearTimer, onRecordingComplete, releaseWebLock]);


    const cleanup = useCallback(() => {
        clearTimer();

        recordersRef.current.forEach(({ recorder, writable }) => {
            if (recorder.state !== 'inactive') {
                try { recorder.stop(); } catch { /* ignore */ }
            }
            if (writable) {
                try { writable.close(); } catch { /* ignore */ }
            }
        });

        recordersRef.current = [];
        projectDirRef.current = null;
        releaseWebLock();
        setRecordingState('idle');
        setRecordingTime(0);
    }, [clearTimer, releaseWebLock]);

    const resetState = useCallback(() => {
        setRecordingState('idle');
        setRecordingTime(0);
    }, []);

    const getProjectId = useCallback(() => projectIdRef.current, []);

    return {
        // State
        recordingState,
        isRecording,
        isPaused,
        recordingTime,

        // Actions
        startRecording,
        stopRecording,
        pauseRecording,
        cleanup,
        resetState,
        getProjectId,
    };
}
