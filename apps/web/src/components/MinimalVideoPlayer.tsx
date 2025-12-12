'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

interface MinimalVideoPlayerProps {
    src: string;
    onLoadedMetadata?: (duration: number) => void;
}

export default function MinimalVideoPlayer({ src, onLoadedMetadata }: MinimalVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const formatTime = (time: number) => {
        if (!isFinite(time) || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getSafeDuration = useCallback(() => {
        const video = videoRef.current;
        if (!video) return 0;
        const dur = video.duration;
        if (!isFinite(dur) || isNaN(dur)) return 0;
        return dur;
    }, []);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const fixDuration = async () => {
            if (video.readyState < 1) {
                await new Promise(resolve => {
                    video.addEventListener('loadedmetadata', resolve, { once: true });
                });
            }

            if (!isFinite(video.duration) || isNaN(video.duration)) {
                const wasPlaying = !video.paused;

                video.currentTime = Number.MAX_SAFE_INTEGER;

                await new Promise(resolve => {
                    video.addEventListener('timeupdate', function handler() {
                        video.removeEventListener('timeupdate', handler);
                        resolve(null);
                    });
                    setTimeout(resolve, 500);
                });

                const realDuration = video.currentTime;
                video.currentTime = 0;

                if (isFinite(realDuration) && realDuration > 0) {
                    setDuration(realDuration);
                    onLoadedMetadata?.(realDuration);
                }

                if (wasPlaying) {
                    video.play();
                }
            } else {
                setDuration(video.duration);
                onLoadedMetadata?.(video.duration);
            }

            setIsReady(true);
        };

        fixDuration();
    }, [src, onLoadedMetadata]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const time = video.currentTime;
            if (isFinite(time)) setCurrentTime(time);
        };
        const handleEnded = () => setIsPlaying(false);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleDurationChange = () => {
            const dur = getSafeDuration();
            if (dur > 0) setDuration(dur);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [getSafeDuration]);

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const progressBar = progressRef.current;
        if (!video || !progressBar || duration <= 0) return;

        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = clickX / rect.width;
        const newTime = pct * duration;

        if (isFinite(newTime) && newTime >= 0) {
            video.currentTime = Math.max(0, Math.min(newTime, duration));
        }
    }, [duration]);

    const handleProgressDrag = useCallback((e: MouseEvent) => {
        if (!isDragging || duration <= 0) return;
        const video = videoRef.current;
        const progressBar = progressRef.current;
        if (!video || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const dragX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, dragX / rect.width));
        const newTime = pct * duration;

        if (isFinite(newTime)) {
            video.currentTime = newTime;
        }
    }, [isDragging, duration]);

    useEffect(() => {
        if (isDragging) {
            const stopDragging = () => setIsDragging(false);
            document.addEventListener('mousemove', handleProgressDrag);
            document.addEventListener('mouseup', stopDragging);
            return () => {
                document.removeEventListener('mousemove', handleProgressDrag);
                document.removeEventListener('mouseup', stopDragging);
            };
        }
    }, [isDragging, handleProgressDrag]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group shadow-xl border border-gray-200">
            <div
                className="absolute inset-0 cursor-pointer z-10"
                onClick={togglePlay}
            />

            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                playsInline
                preload="auto"
            />

            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}

            {!isPlaying && isReady && (
                <div
                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-20 h-20 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-2xl transition-transform hover:scale-105">
                        <Play size={32} className="text-gray-900 ml-1" fill="currentColor" />
                    </div>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                <div
                    ref={progressRef}
                    className="relative h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 group/progress"
                    onClick={handleProgressClick}
                    onMouseDown={() => duration > 0 && setIsDragging(true)}
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `calc(${Math.min(100, progress)}% - 8px)` }}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition"
                    >
                        {isPlaying ? (
                            <Pause size={20} className="text-white" fill="white" />
                        ) : (
                            <Play size={20} className="text-white ml-0.5" fill="white" />
                        )}
                    </button>

                    <span className="text-white text-sm font-medium tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
}
