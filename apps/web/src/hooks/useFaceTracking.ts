'use client';

import { useCallback, useRef, useState, useEffect } from 'react';


export interface FaceTrackingOptions {
    enabled: boolean;
    smoothing: number;   // 0-1, higher = smoother but more lag
    zoomLevel: number;   // 1.0 = no zoom, 1.5 = 50% zoom on face
}

interface FaceBox {
    x: number;      // Center X (0-1)
    y: number;      // Center Y (0-1)
    width: number;  // Width (0-1)
    height: number; // Height (0-1)
}

interface UseFaceTrackingResult {
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;
    trackedStream: MediaStream | null;
    faceDetected: boolean;
    startTracking: (stream: MediaStream) => void;
    stopTracking: () => void;
    setOptions: (options: Partial<FaceTrackingOptions>) => void;
    options: FaceTrackingOptions;
}

// ============================================================================
// MediaPipe Script Loader
// ============================================================================

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection';

let loadPromise: Promise<void> | null = null;

async function loadMediaPipe(): Promise<void> {
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
        // Check if already loaded
        if (typeof (window as unknown as { FaceDetection: unknown }).FaceDetection !== 'undefined') {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `${MEDIAPIPE_CDN}/face_detection.js`;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load MediaPipe Face Detection'));
        document.head.appendChild(script);
    });

    return loadPromise;
}

// ============================================================================
// Smoothing Utility
// ============================================================================

function smoothValue(current: number, target: number, factor: number): number {
    return current + (target - current) * (1 - factor);
}

function smoothBox(current: FaceBox, target: FaceBox, factor: number): FaceBox {
    return {
        x: smoothValue(current.x, target.x, factor),
        y: smoothValue(current.y, target.y, factor),
        width: smoothValue(current.width, target.width, factor),
        height: smoothValue(current.height, target.height, factor),
    };
}

// ============================================================================
// Hook
// ============================================================================

export function useFaceTracking(): UseFaceTrackingResult {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trackedStream, setTrackedStream] = useState<MediaStream | null>(null);
    const [faceDetected, setFaceDetected] = useState(false);
    const [options, setOptionsState] = useState<FaceTrackingOptions>({
        enabled: true,
        smoothing: 0.85,  // High smoothing for natural feel
        zoomLevel: 1.3,   // 30% zoom on face
    });

    const faceDetectorRef = useRef<unknown>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const currentBoxRef = useRef<FaceBox>({ x: 0.5, y: 0.5, width: 1, height: 1 });
    const inputStreamRef = useRef<MediaStream | null>(null);

    // Cleanup
    const cleanup = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (faceDetectorRef.current) {
            try {
                (faceDetectorRef.current as { close: () => void }).close();
            } catch { /* ignore */ }
            faceDetectorRef.current = null;
        }
        setTrackedStream(null);
        setFaceDetected(false);
    }, []);

    // Initialize face detection
    const initFaceDetection = useCallback(async () => {
        if (isLoaded || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            await loadMediaPipe();

            // Access FaceDetection from window
            const FaceDetection = (window as unknown as {
                FaceDetection: new (config: { locateFile: (file: string) => string }) => {
                    setOptions: (opts: { model: string; minDetectionConfidence: number }) => void;
                    onResults: (callback: (results: { detections: Array<{ boundingBox: { xCenter: number; yCenter: number; width: number; height: number } }> }) => void) => void;
                    send: (opts: { image: HTMLVideoElement }) => Promise<void>;
                    close: () => void;
                }
            }).FaceDetection;

            const detector = new FaceDetection({
                locateFile: (file: string) => `${MEDIAPIPE_CDN}/${file}`,
            });

            detector.setOptions({
                model: 'short',
                minDetectionConfidence: 0.5,
            });

            detector.onResults((results) => {
                if (results.detections && results.detections.length > 0) {
                    const face = results.detections[0];
                    const box: FaceBox = {
                        x: face.boundingBox.xCenter,
                        y: face.boundingBox.yCenter,
                        width: face.boundingBox.width,
                        height: face.boundingBox.height,
                    };

                    // Smooth the transition
                    currentBoxRef.current = smoothBox(currentBoxRef.current, box, options.smoothing);
                    setFaceDetected(true);
                } else {
                    // Slowly return to center when no face detected
                    currentBoxRef.current = smoothBox(
                        currentBoxRef.current,
                        { x: 0.5, y: 0.5, width: 1, height: 1 },
                        0.95
                    );
                    setFaceDetected(false);
                }
            });

            faceDetectorRef.current = detector;
            setIsLoaded(true);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to initialize face detection';
            setError(message);
            console.error('[FaceTracking] Init error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, isLoading, options.smoothing]);

    // Start tracking
    const startTracking = useCallback((stream: MediaStream) => {
        if (!isLoaded || !faceDetectorRef.current) {
            console.warn('[FaceTracking] Face detection not loaded yet');
            initFaceDetection().then(() => {
                if (faceDetectorRef.current) {
                    startTracking(stream);
                }
            });
            return;
        }

        cleanup();
        inputStreamRef.current = stream;

        // Create hidden video element for input
        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.srcObject = stream;
        videoRef.current = video;

        // Create canvas for output
        const canvas = document.createElement('canvas');
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        canvas.width = settings.width || 1280;
        canvas.height = settings.height || 720;
        canvasRef.current = canvas;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError('Could not create canvas context');
            return;
        }
        ctxRef.current = ctx;

        // Start processing loop
        video.onloadeddata = () => {
            const detector = faceDetectorRef.current as {
                send: (opts: { image: HTMLVideoElement }) => Promise<void>;
            };

            let lastDetectionTime = 0;
            const DETECTION_INTERVAL = 100; // Run detection every 100ms

            const processFrame = async (timestamp: number) => {
                if (!video || video.paused || video.ended) return;

                // Run face detection at intervals (expensive operation)
                if (timestamp - lastDetectionTime > DETECTION_INTERVAL) {
                    try {
                        await detector.send({ image: video });
                    } catch { /* ignore detection errors */ }
                    lastDetectionTime = timestamp;
                }

                // Draw cropped/zoomed frame
                if (ctx && canvas && options.enabled) {
                    const box = currentBoxRef.current;
                    const zoom = options.zoomLevel;

                    // Calculate crop region
                    const cropWidth = (1 / zoom);
                    const cropHeight = (1 / zoom);
                    const cropX = Math.max(0, Math.min(1 - cropWidth, box.x - cropWidth / 2));
                    const cropY = Math.max(0, Math.min(1 - cropHeight, box.y - cropHeight / 2));

                    // Draw cropped region scaled to full canvas
                    ctx.drawImage(
                        video,
                        cropX * video.videoWidth,
                        cropY * video.videoHeight,
                        cropWidth * video.videoWidth,
                        cropHeight * video.videoHeight,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                } else if (ctx && canvas) {
                    // No tracking, just draw normally
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }

                animationRef.current = requestAnimationFrame(processFrame);
            };

            animationRef.current = requestAnimationFrame(processFrame);

            // Capture canvas as MediaStream
            try {
                const outputStream = canvas.captureStream(30);
                setTrackedStream(outputStream);
            } catch (e) {
                console.error('[FaceTracking] Failed to capture stream:', e);
                setError('Failed to capture tracked stream');
            }
        };

        video.play().catch((e) => {
            setError(`Failed to play video: ${e.message}`);
        });
    }, [isLoaded, initFaceDetection, cleanup, options.enabled, options.zoomLevel]);

    // Stop tracking
    const stopTracking = useCallback(() => {
        cleanup();
        inputStreamRef.current = null;
    }, [cleanup]);

    // Update options
    const setOptions = useCallback((newOptions: Partial<FaceTrackingOptions>) => {
        setOptionsState(prev => ({ ...prev, ...newOptions }));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        isLoaded,
        isLoading,
        error,
        trackedStream,
        faceDetected,
        startTracking,
        stopTracking,
        setOptions,
        options,
    };
}
