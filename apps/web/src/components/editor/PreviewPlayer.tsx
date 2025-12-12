'use client';

import { useEffect, useRef } from 'react';
import { useEditor } from '@/contexts/EditorContext';

interface PreviewPlayerProps {
    screenVideoUrl?: string;
    webcamVideoUrl?: string;
}

export default function PreviewPlayer({ screenVideoUrl, webcamVideoUrl }: PreviewPlayerProps) {
    const { state, setPlayhead, dispatch } = useEditor();
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const webcamVideoRef = useRef<HTMLVideoElement>(null);
    const animationRef = useRef<number | undefined>(undefined);

    const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (video.duration && video.duration !== Infinity) {
            dispatch({ type: 'SET_DURATION', payload: video.duration });
        }
    };

    useEffect(() => {
        const screenVideo = screenVideoRef.current;
        const webcamVideo = webcamVideoRef.current;

        if (state.isPlaying) {
            if (screenVideo) {
                screenVideo.currentTime = state.playhead;
                screenVideo.play();
            }
            if (webcamVideo) {
                webcamVideo.currentTime = state.playhead;
                webcamVideo.play();
            }

            const updatePlayhead = () => {
                if (screenVideo) {
                    setPlayhead(screenVideo.currentTime);
                    if (screenVideo.currentTime >= state.duration) {
                        dispatch({ type: 'SET_PLAYING', payload: false });
                        return;
                    }
                }
                animationRef.current = requestAnimationFrame(updatePlayhead);
            };
            animationRef.current = requestAnimationFrame(updatePlayhead);
        } else {
            if (screenVideo) screenVideo.pause();
            if (webcamVideo) webcamVideo.pause();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [state.isPlaying, state.playhead, state.duration, setPlayhead, dispatch]);

    useEffect(() => {
        if (!state.isPlaying) {
            if (screenVideoRef.current) {
                screenVideoRef.current.currentTime = state.playhead;
            }
            if (webcamVideoRef.current) {
                webcamVideoRef.current.currentTime = state.playhead;
            }
        }
    }, [state.playhead, state.isPlaying]);

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                {screenVideoUrl ? (
                    <video
                        ref={screenVideoRef}
                        src={screenVideoUrl}
                        className="w-full h-full object-contain"
                        onLoadedMetadata={handleLoadedMetadata}
                    />
                ) : webcamVideoUrl ? (
                    <video
                        ref={webcamVideoRef}
                        src={webcamVideoUrl}
                        className="w-full h-full object-cover"
                        onLoadedMetadata={handleLoadedMetadata}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-400 via-blue-500 to-teal-600 flex items-center justify-center">
                        <div className="text-center text-white/80">
                            <p className="text-lg">Demo Preview</p>
                            <p className="text-sm">Record a video to see it here</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
