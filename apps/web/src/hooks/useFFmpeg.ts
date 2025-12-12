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
    };
}
