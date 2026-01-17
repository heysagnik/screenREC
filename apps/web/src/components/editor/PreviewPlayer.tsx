'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useEditor } from '@/contexts/EditorContext';

export interface CanvasSettings {
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
    background: {
        type: 'gradient' | 'solid' | 'image';
        value: string;
    };
    cameraPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
    cameraSize: number;
    cameraShape: 'circle' | 'rectangle' | 'rounded';
}

interface PreviewPlayerProps {
    screenVideoUrl?: string;
    webcamVideoUrl?: string;
    audioUrl?: string;
    canvasSettings?: CanvasSettings;
}

const ASPECT_RATIOS = {
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '1:1': 1,
    '4:3': 4 / 3,
};

const CAMERA_POSITIONS = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

export default function PreviewPlayer({
    screenVideoUrl,
    webcamVideoUrl,
    audioUrl,
    canvasSettings,
}: PreviewPlayerProps) {
    const { state, setPlayhead, dispatch } = useEditor();
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const webcamVideoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const wasPlayingRef = useRef(false);

    const settings = canvasSettings || {
        aspectRatio: '16:9' as const,
        background: { type: 'gradient' as const, value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
        cameraPosition: 'bottom-left' as const,
        cameraSize: 0.25,
        cameraShape: 'rectangle' as const,
    };

    const aspectRatio = ASPECT_RATIOS[settings.aspectRatio];

    // Find the active screen clip at current playhead
    const activeScreenClip = useMemo(() => {
        for (const track of state.tracks) {
            if (track.type === 'screen') {
                for (const clip of track.clips) {
                    if (state.playhead >= clip.startTime && state.playhead < clip.startTime + clip.duration) {
                        return clip;
                    }
                }
            }
        }
        return null;
    }, [state.tracks, state.playhead]);

    // Convert timeline playhead to source video time
    const getScreenSourceTime = (playhead: number): number => {
        if (!activeScreenClip) return playhead;
        const clipOffset = playhead - activeScreenClip.startTime;
        return activeScreenClip.sourceStart + clipOffset;
    };

    const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (video.duration && video.duration !== Infinity && state.duration === 0) {
            dispatch({ type: 'SET_DURATION', payload: video.duration });
        }
    };

    // Handle play/pause state changes
    useEffect(() => {
        const screenVideo = screenVideoRef.current;
        const webcamVideo = webcamVideoRef.current;
        const audio = audioRef.current;

        if (state.isPlaying && !wasPlayingRef.current) {
            wasPlayingRef.current = true;

            // Sync all media to playhead ONCE at start
            if (screenVideo) {
                screenVideo.currentTime = getScreenSourceTime(state.playhead);
                screenVideo.play().catch(() => { });
            }
            if (webcamVideo) {
                webcamVideo.currentTime = state.playhead;
                webcamVideo.play().catch(() => { });
            }
            if (audio) {
                audio.currentTime = state.playhead;
                audio.play().catch(() => { });
            }

            // Animation loop - only update playhead, don't touch media currentTime
            const updatePlayhead = () => {
                if (screenVideo && !screenVideo.paused) {
                    // Find current clip based on video time
                    let currentClip = null;
                    for (const track of state.tracks) {
                        if (track.type === 'screen') {
                            for (const clip of track.clips) {
                                const videoTime = screenVideo.currentTime;
                                if (videoTime >= clip.sourceStart && videoTime < clip.sourceStart + clip.duration) {
                                    currentClip = clip;
                                    break;
                                }
                            }
                        }
                    }

                    if (currentClip) {
                        const videoTime = screenVideo.currentTime;
                        const timelineTime = currentClip.startTime + (videoTime - currentClip.sourceStart);

                        // Check if we've reached the end of the clip
                        if (videoTime >= currentClip.sourceStart + currentClip.duration - 0.05) {
                            // Pause all and loop to start
                            screenVideo.pause();
                            if (webcamVideo) webcamVideo.pause();
                            if (audio) audio.pause();

                            screenVideo.currentTime = currentClip.sourceStart;
                            if (webcamVideo) webcamVideo.currentTime = currentClip.startTime;
                            if (audio) audio.currentTime = currentClip.startTime;

                            setPlayhead(currentClip.startTime);
                            dispatch({ type: 'SET_PLAYING', payload: false });
                            wasPlayingRef.current = false;
                            return;
                        }

                        setPlayhead(timelineTime);
                    } else {
                        // No clip - use raw video time
                        const time = screenVideo.currentTime;
                        setPlayhead(time);

                        if (time >= state.duration - 0.1) {
                            screenVideo.pause();
                            if (webcamVideo) webcamVideo.pause();
                            if (audio) audio.pause();

                            screenVideo.currentTime = 0;
                            if (webcamVideo) webcamVideo.currentTime = 0;
                            if (audio) audio.currentTime = 0;

                            setPlayhead(0);
                            dispatch({ type: 'SET_PLAYING', payload: false });
                            wasPlayingRef.current = false;
                            return;
                        }
                    }

                    animationRef.current = requestAnimationFrame(updatePlayhead);
                }
            };
            animationRef.current = requestAnimationFrame(updatePlayhead);
        } else if (!state.isPlaying && wasPlayingRef.current) {
            wasPlayingRef.current = false;

            if (screenVideo) screenVideo.pause();
            if (webcamVideo) webcamVideo.pause();
            if (audio) audio.pause();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [state.isPlaying, state.duration, state.tracks, setPlayhead, dispatch]);

    // Sync video when scrubbing (not playing)
    useEffect(() => {
        if (!state.isPlaying) {
            const screenVideo = screenVideoRef.current;
            const webcamVideo = webcamVideoRef.current;
            const audio = audioRef.current;

            if (screenVideo) {
                screenVideo.currentTime = getScreenSourceTime(state.playhead);
            }
            if (webcamVideo) {
                webcamVideo.currentTime = state.playhead;
            }
            if (audio) {
                audio.currentTime = state.playhead;
            }
        }
    }, [state.playhead, state.isPlaying, activeScreenClip]);

    const getCameraStyles = () => {
        const size = settings.cameraSize * 100;
        const baseSize = Math.max(15, Math.min(40, size));
        return { width: `${baseSize}%`, aspectRatio: '1' };
    };

    const getCameraShapeClass = () => {
        switch (settings.cameraShape) {
            case 'circle': return 'rounded-full';
            case 'rounded': return 'rounded-2xl';
            default: return 'rounded-lg';
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <div
                className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl"
                style={{
                    aspectRatio: aspectRatio,
                    background: settings.background.type === 'gradient' || settings.background.type === 'solid'
                        ? settings.background.value
                        : undefined,
                    backgroundImage: settings.background.type === 'image'
                        ? `url(${settings.background.value})`
                        : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Screen video */}
                {screenVideoUrl ? (
                    <div className="absolute inset-4 flex items-center justify-center">
                        <video
                            ref={screenVideoRef}
                            src={screenVideoUrl}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                            onLoadedMetadata={handleLoadedMetadata}
                            muted
                            playsInline
                        />
                    </div>
                ) : (
                    <div className="absolute inset-4 flex items-center justify-center">
                        <div className="w-full h-full bg-gray-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <div className="text-center text-white/60">
                                <p className="text-lg font-medium">No Screen Recording</p>
                                <p className="text-sm">Record your screen to preview it here</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Webcam video overlay */}
                {webcamVideoUrl && (
                    <div
                        className={`absolute ${CAMERA_POSITIONS[settings.cameraPosition]} overflow-hidden shadow-lg border-2 border-white/20 ${getCameraShapeClass()}`}
                        style={getCameraStyles()}
                    >
                        <video
                            ref={webcamVideoRef}
                            src={webcamVideoUrl}
                            className={`w-full h-full object-cover ${getCameraShapeClass()}`}
                            muted
                            playsInline
                        />
                    </div>
                )}

                {/* Audio */}
                {audioUrl && (
                    <audio ref={audioRef} src={audioUrl} className="hidden" />
                )}
            </div>
        </div>
    );
}
