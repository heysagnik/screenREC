'use client';

import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function useFFmpeg() {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    const load = useCallback(async () => {
        if (loaded || loading) return ffmpegRef.current;

        setLoading(true);
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on('progress', (event) => {
            setProgress(Math.round(event.progress * 100));
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setLoaded(true);
        setLoading(false);
        return ffmpeg;
    }, [loaded, loading]);

    const extractAudio = useCallback(async (videoBlob: Blob): Promise<Blob | null> => {
        const ffmpeg = await load();
        if (!ffmpeg) return null;

        const inputName = 'input.webm';
        const outputName = 'output.mp3';

        await ffmpeg.writeFile(inputName, await fetchFile(videoBlob));
        await ffmpeg.exec(['-i', inputName, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputName]);

        const data = await ffmpeg.readFile(outputName);
        const uint8Array = data instanceof Uint8Array ? data : new Uint8Array();
        return new Blob([new Uint8Array(uint8Array)], { type: 'audio/mp3' });
    }, [load]);

    const extractVideo = useCallback(async (videoBlob: Blob): Promise<Blob | null> => {
        const ffmpeg = await load();
        if (!ffmpeg) return null;

        const inputName = 'input.webm';
        const outputName = 'output.mp4';

        await ffmpeg.writeFile(inputName, await fetchFile(videoBlob));
        await ffmpeg.exec(['-i', inputName, '-an', '-c:v', 'copy', outputName]);

        const data = await ffmpeg.readFile(outputName);
        const uint8Array = data instanceof Uint8Array ? data : new Uint8Array();
        return new Blob([new Uint8Array(uint8Array)], { type: 'video/mp4' });
    }, [load]);

    const trimVideo = useCallback(async (
        videoBlob: Blob,
        startTime: number,
        endTime: number
    ): Promise<Blob | null> => {
        const ffmpeg = await load();
        if (!ffmpeg) return null;

        const inputName = 'input.webm';
        const outputName = 'trimmed.mp4';
        const duration = endTime - startTime;

        await ffmpeg.writeFile(inputName, await fetchFile(videoBlob));
        await ffmpeg.exec([
            '-ss', startTime.toString(),
            '-i', inputName,
            '-t', duration.toString(),
            '-c', 'copy',
            outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        const uint8Array = data instanceof Uint8Array ? data : new Uint8Array();
        return new Blob([new Uint8Array(uint8Array)], { type: 'video/mp4' });
    }, [load]);

    const exportWithQuality = useCallback(async (
        videoBlob: Blob,
        quality: '720p' | '1080p' | '4k'
    ): Promise<Blob | null> => {
        const ffmpeg = await load();
        if (!ffmpeg) return null;

        const resolutions = {
            '720p': '1280:720',
            '1080p': '1920:1080',
            '4k': '3840:2160',
        };

        const inputName = 'input.webm';
        const outputName = 'export.mp4';

        await ffmpeg.writeFile(inputName, await fetchFile(videoBlob));
        await ffmpeg.exec([
            '-i', inputName,
            '-vf', `scale=${resolutions[quality]}:force_original_aspect_ratio=decrease,pad=${resolutions[quality]}:(ow-iw)/2:(oh-ih)/2`,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        const uint8Array = data instanceof Uint8Array ? data : new Uint8Array();
        return new Blob([new Uint8Array(uint8Array)], { type: 'video/mp4' });
    }, [load]);

    const convertToMp4 = useCallback(async (webmBlob: Blob): Promise<Blob | null> => {
        const ffmpeg = await load();
        if (!ffmpeg) return null;

        setProgress(0);

        const inputName = 'input.webm';
        const outputName = 'output.mp4';

        await ffmpeg.writeFile(inputName, await fetchFile(webmBlob));

        await ffmpeg.exec([
            '-i', inputName,
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        const uint8Array = data instanceof Uint8Array ? data : new Uint8Array();
        setProgress(100);
        return new Blob([new Uint8Array(uint8Array)], { type: 'video/mp4' });
    }, [load]);

    interface CompositeOptions {
        screenBlob?: Blob;
        cameraBlob?: Blob;
        audioBlob?: Blob;
        aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
        backgroundColor: string;
        cameraPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        cameraSize: number; // 0.15 to 0.4
        quality: '720p' | '1080p' | '4k';
    }

    const compositeStreams = useCallback(async (options: CompositeOptions): Promise<Blob | null> => {
        const ffmpeg = await load();
        if (!ffmpeg) return null;

        setProgress(0);

        const resolutions = {
            '720p': { w: 1280, h: 720 },
            '1080p': { w: 1920, h: 1080 },
            '4k': { w: 3840, h: 2160 },
        };

        const aspectRatios = {
            '16:9': 16 / 9,
            '9:16': 9 / 16,
            '1:1': 1,
            '4:3': 4 / 3,
        };

        const baseRes = resolutions[options.quality];
        const targetRatio = aspectRatios[options.aspectRatio];

        // Calculate output dimensions based on aspect ratio
        let outW = baseRes.w;
        let outH = baseRes.h;
        if (targetRatio < 1) {
            // Portrait
            outW = Math.round(baseRes.h * targetRatio);
            outH = baseRes.h;
        } else if (targetRatio === 1) {
            // Square
            outW = Math.min(baseRes.w, baseRes.h);
            outH = outW;
        }

        const inputs: string[] = [];
        const inputFiles: string[] = [];

        // Write input files
        if (options.screenBlob) {
            await ffmpeg.writeFile('screen.webm', await fetchFile(options.screenBlob));
            inputs.push('-i', 'screen.webm');
            inputFiles.push('screen');
        }

        if (options.cameraBlob) {
            await ffmpeg.writeFile('camera.webm', await fetchFile(options.cameraBlob));
            inputs.push('-i', 'camera.webm');
            inputFiles.push('camera');
        }

        if (options.audioBlob) {
            await ffmpeg.writeFile('audio.webm', await fetchFile(options.audioBlob));
            inputs.push('-i', 'audio.webm');
            inputFiles.push('audio');
        }

        if (inputFiles.length === 0) return null;

        // Build filter complex
        const filters: string[] = [];
        let currentOutput = '';

        // Only screen
        if (options.screenBlob && !options.cameraBlob) {
            filters.push(`[0:v]scale=${outW}:${outH}:force_original_aspect_ratio=decrease,pad=${outW}:${outH}:(ow-iw)/2:(oh-ih)/2:color=${options.backgroundColor.replace('#', '0x')}[outv]`);
            currentOutput = '[outv]';
        }
        // Only camera
        else if (!options.screenBlob && options.cameraBlob) {
            filters.push(`[0:v]scale=${outW}:${outH}:force_original_aspect_ratio=decrease,pad=${outW}:${outH}:(ow-iw)/2:(oh-ih)/2:color=${options.backgroundColor.replace('#', '0x')}[outv]`);
            currentOutput = '[outv]';
        }
        // Both screen and camera (PiP)
        else if (options.screenBlob && options.cameraBlob) {
            const camSize = Math.round(Math.min(outW, outH) * options.cameraSize);
            const padding = 20;

            let overlayPos = '';
            switch (options.cameraPosition) {
                case 'top-left': overlayPos = `${padding}:${padding}`; break;
                case 'top-right': overlayPos = `main_w-overlay_w-${padding}:${padding}`; break;
                case 'bottom-left': overlayPos = `${padding}:main_h-overlay_h-${padding}`; break;
                case 'bottom-right': overlayPos = `main_w-overlay_w-${padding}:main_h-overlay_h-${padding}`; break;
            }

            filters.push(
                `[0:v]scale=${outW}:${outH}:force_original_aspect_ratio=decrease,pad=${outW}:${outH}:(ow-iw)/2:(oh-ih)/2:color=${options.backgroundColor.replace('#', '0x')}[bg]`,
                `[1:v]scale=${camSize}:${camSize}:force_original_aspect_ratio=decrease,format=rgba[cam]`,
                `[bg][cam]overlay=${overlayPos}[outv]`
            );
            currentOutput = '[outv]';
        }

        // Build FFmpeg command
        const command = [
            ...inputs,
            '-filter_complex', filters.join(';'),
            '-map', currentOutput,
        ];

        // Map audio
        const audioIndex = inputFiles.indexOf('audio');
        if (audioIndex !== -1) {
            command.push('-map', `${audioIndex}:a`);
        } else if (options.screenBlob) {
            // Try to use screen audio
            command.push('-map', '0:a?');
        }

        command.push(
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            'output.mp4'
        );

        await ffmpeg.exec(command);

        const data = await ffmpeg.readFile('output.mp4');
        const uint8Array = data instanceof Uint8Array ? data : new Uint8Array();
        setProgress(100);
        return new Blob([new Uint8Array(uint8Array)], { type: 'video/mp4' });
    }, [load]);

    // Fast export - mux streams without re-encoding (instant, no quality loss)
    const fastExport = useCallback(async (
        videoBlob: Blob,
        audioBlob?: Blob
    ): Promise<Blob | null> => {
        const ffmpeg = await load();
        if (!ffmpeg) return null;

        setProgress(0);

        // Write video
        await ffmpeg.writeFile('video.webm', await fetchFile(videoBlob));

        const command: string[] = ['-i', 'video.webm'];

        // Add audio if provided
        if (audioBlob) {
            await ffmpeg.writeFile('audio.webm', await fetchFile(audioBlob));
            command.push('-i', 'audio.webm');
            command.push(
                '-c:v', 'copy',     // Copy video without re-encoding
                '-c:a', 'aac',      // Convert audio to AAC for MP4 compatibility
                '-shortest',        // Match duration to shortest stream
                'output.mp4'
            );
        } else {
            command.push(
                '-c:v', 'copy',     // Copy video without re-encoding
                '-c:a', 'copy',     // Copy audio if present
                'output.mp4'
            );
        }

        await ffmpeg.exec(command);

        const data = await ffmpeg.readFile('output.mp4');
        const uint8Array = data instanceof Uint8Array ? data : new Uint8Array();
        setProgress(100);
        return new Blob([new Uint8Array(uint8Array)], { type: 'video/mp4' });
    }, [load]);

    return {
        loaded,
        loading,
        progress,
        load,
        extractAudio,
        extractVideo,
        trimVideo,
        exportWithQuality,
        convertToMp4,
        compositeStreams,
        fastExport,
    };
}
