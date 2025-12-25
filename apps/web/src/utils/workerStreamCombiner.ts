/**
 * Worker-based Stream Combiner
 * Maintains consistent frame rate even when browser tab is hidden
 */

import { RecordingLayout } from '@/types/layout';
import { RECORDING_CONFIG } from '@/config/recording';

export interface WorkerCombinerOptions {
    screenStream: MediaStream | null;
    cameraStream: MediaStream | null;
    audioStream: MediaStream | null;
    cameraPosition: { x: number; y: number };
    cameraPositionKey?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    layout: RecordingLayout;
}

export interface WorkerCombinerResult {
    stream: MediaStream;
    cleanup: () => void;
    updateCameraPosition: (position: { x: number; y: number }) => void;
    updateLayout: (layout: RecordingLayout) => void;
}

export async function createWorkerCombinedStream(
    options: WorkerCombinerOptions
): Promise<WorkerCombinerResult> {
    const { screenStream, cameraStream, audioStream } = options;

    // Direct passthrough for single-source recording (no canvas overhead)
    if (screenStream && !cameraStream) {
        return createDirectStream(screenStream, audioStream, 'screen');
    }
    if (cameraStream && !screenStream) {
        return createDirectStream(cameraStream, audioStream, 'camera');
    }

    // Canvas combining only for PiP mode
    return createCanvasCombinedStream(options);
}

async function createDirectStream(
    videoStream: MediaStream,
    audioStream: MediaStream | null,
    type: 'screen' | 'camera'
): Promise<WorkerCombinerResult> {
    const resultStream = new MediaStream();
    const videoTrack = videoStream.getVideoTracks()[0];
    if (videoTrack) resultStream.addTrack(videoTrack);

    // Mix audio tracks
    const hasScreenAudio = type === 'screen' && videoStream.getAudioTracks().length > 0;
    const hasMicAudio = audioStream && audioStream.getAudioTracks().length > 0;

    if (hasScreenAudio || hasMicAudio) {
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioCtx = new AudioCtx({ sampleRate: RECORDING_CONFIG.AUDIO.SAMPLE_RATE });
            const destination = audioCtx.createMediaStreamDestination();

            const addSource = (stream: MediaStream, gain: number) => {
                const tracks = stream.getAudioTracks();
                if (tracks.length === 0) return;
                const source = audioCtx.createMediaStreamSource(new MediaStream(tracks));
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = gain;
                source.connect(gainNode).connect(destination);
            };

            if (hasScreenAudio) addSource(videoStream, RECORDING_CONFIG.AUDIO_MIXING.GAIN.SCREEN);
            if (hasMicAudio) addSource(audioStream!, RECORDING_CONFIG.AUDIO_MIXING.GAIN.MICROPHONE);

            const mixedTrack = destination.stream.getAudioTracks()[0];
            if (mixedTrack) resultStream.addTrack(mixedTrack);
        } catch {
            const fallback = videoStream.getAudioTracks()[0] || audioStream?.getAudioTracks()[0];
            if (fallback) resultStream.addTrack(fallback);
        }
    }

    return {
        stream: resultStream,
        cleanup: () => {
            resultStream.getTracks().forEach(t => {
                if (t !== videoTrack) try { t.stop(); } catch { }
            });
        },
        updateCameraPosition: () => { },
        updateLayout: () => { },
    };
}

async function createCanvasCombinedStream(
    options: WorkerCombinerOptions
): Promise<WorkerCombinerResult> {
    const { screenStream, cameraStream, audioStream, cameraPosition, layout } = options;

    const screenTrack = screenStream?.getVideoTracks()[0];
    const settings = screenTrack?.getSettings();
    const width = settings?.width || 1920;
    const height = settings?.height || 1080;
    const fps = Math.min(settings?.frameRate || 30, 60);

    const worker = new Worker(
        new URL('./backgroundRenderer.worker.ts', import.meta.url),
        { type: 'module' }
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Failed to create canvas context');

    const screenVideo = document.createElement('video');
    const cameraVideo = document.createElement('video');
    [screenVideo, cameraVideo].forEach(v => {
        v.muted = true;
        v.autoplay = true;
        v.playsInline = true;
    });

    if (screenStream) {
        screenVideo.srcObject = screenStream;
        await screenVideo.play().catch(() => { });
    }
    if (cameraStream) {
        cameraVideo.srcObject = cameraStream;
        await cameraVideo.play().catch(() => { });
    }

    const scaleFactor = width / 1920;
    const overlayWidth = Math.round(400 * scaleFactor);
    const overlayHeight = layout === 'circle' ? overlayWidth : Math.round(280 * scaleFactor);
    const guidePad = Math.round(40 * scaleFactor);

    let camX = cameraPosition.x, camY = cameraPosition.y;
    switch (options.cameraPositionKey) {
        case 'top-left': camX = guidePad; camY = guidePad; break;
        case 'top-right': camX = width - overlayWidth - guidePad; camY = guidePad; break;
        case 'bottom-left': camX = guidePad; camY = height - overlayHeight - guidePad; break;
        case 'bottom-right': camX = width - overlayWidth - guidePad; camY = height - overlayHeight - guidePad; break;
    }

    await new Promise<void>(resolve => {
        const handler = (e: MessageEvent) => {
            if (e.data.type === 'initialized') {
                worker.removeEventListener('message', handler);
                resolve();
            }
        };
        worker.addEventListener('message', handler);
        worker.postMessage({
            type: 'init',
            data: {
                config: { width, height, fps, layout, cameraPosition: { x: camX, y: camY }, cameraSize: { width: overlayWidth, height: overlayHeight } }
            }
        });
    });

    let frameInterval: number | null = null;
    let cleanedUp = false;

    const renderFrame = () => {
        if (cleanedUp || !ctx) return;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (screenVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            const sw = screenVideo.videoWidth || 1, sh = screenVideo.videoHeight || 1;
            const scale = Math.min(canvas.width / sw, canvas.height / sh);
            const dw = sw * scale, dh = sh * scale;
            const dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
            ctx.drawImage(screenVideo, dx, dy, dw, dh);
        }

        if (cameraVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && screenVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            drawCameraOverlay(ctx, cameraVideo, camX, camY, overlayWidth, overlayHeight, layout);
        }
    };

    frameInterval = window.setInterval(renderFrame, 1000 / fps);
    const capturedStream = canvas.captureStream(fps);

    // Audio mixing
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx({ sampleRate: RECORDING_CONFIG.AUDIO.SAMPLE_RATE });
        const destination = audioCtx.createMediaStreamDestination();
        const compressor = audioCtx.createDynamicsCompressor();
        Object.assign(compressor.threshold, { value: RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.THRESHOLD });
        Object.assign(compressor.knee, { value: RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.KNEE });
        Object.assign(compressor.ratio, { value: RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.RATIO });
        Object.assign(compressor.attack, { value: RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.ATTACK });
        Object.assign(compressor.release, { value: RECORDING_CONFIG.AUDIO_MIXING.COMPRESSOR.RELEASE });

        let hasAudio = false;
        const addSource = (stream: MediaStream | null, gain: number) => {
            if (!stream) return;
            const tracks = stream.getAudioTracks();
            if (tracks.length === 0) return;
            hasAudio = true;
            const source = audioCtx.createMediaStreamSource(new MediaStream(tracks));
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = gain;
            source.connect(gainNode).connect(compressor);
        };

        addSource(screenStream, RECORDING_CONFIG.AUDIO_MIXING.GAIN.SCREEN);
        addSource(audioStream, RECORDING_CONFIG.AUDIO_MIXING.GAIN.MICROPHONE);

        if (hasAudio) {
            compressor.connect(destination);
            const mixedTrack = destination.stream.getAudioTracks()[0];
            if (mixedTrack) capturedStream.addTrack(mixedTrack);
        }
    } catch {
        const fallback = screenStream?.getAudioTracks()[0] || audioStream?.getAudioTracks()[0];
        if (fallback) capturedStream.addTrack(fallback);
    }

    return {
        stream: capturedStream,
        cleanup: () => {
            if (cleanedUp) return;
            cleanedUp = true;
            if (frameInterval) clearInterval(frameInterval);
            worker.postMessage({ type: 'stop' });
            setTimeout(() => worker.terminate(), 100);
            screenVideo.pause(); screenVideo.srcObject = null;
            cameraVideo.pause(); cameraVideo.srcObject = null;
            capturedStream.getTracks().forEach(t => { try { t.stop(); } catch { } });
        },
        updateCameraPosition: (pos) => {
            camX = pos.x; camY = pos.y;
            worker.postMessage({ type: 'updateConfig', data: { config: { cameraPosition: pos } } });
        },
        updateLayout: (l) => {
            worker.postMessage({ type: 'updateConfig', data: { config: { layout: l } } });
        },
    };
}

function drawCameraOverlay(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    x: number, y: number, w: number, h: number,
    layout: RecordingLayout
): void {
    const srcW = video.videoWidth || 1, srcH = video.videoHeight || 1;

    if (layout === 'circle') {
        const r = w / 2, cx = x + r, cy = y + r;
        const crop = Math.min(srcW, srcH), sx = (srcW - crop) / 2, sy = (srcH - crop) / 2;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
        ctx.translate(cx + r, cy - r); ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, crop, crop, 0, 0, w, w);
        ctx.restore();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    } else {
        const cr = 12;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, cr);
        ctx.clip();
        ctx.translate(x + w, y); ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, srcW, srcH, 0, 0, w, h);
        ctx.restore();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, cr); ctx.stroke();
    }
}
