'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { Track, Clip } from '@/types/editor';
import { ZoomIn, ZoomOut, Scissors, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface TimelineProps {
    screenVideoUrl?: string;
    webcamVideoUrl?: string;
}

const generateWaveform = (length: number): number[] => {
    const waveform: number[] = [];
    for (let i = 0; i < length; i++) {
        const base = Math.sin(i * 0.3) * 0.3 + 0.5;
        const detail = Math.sin(i * 1.7) * 0.15 + Math.sin(i * 0.7) * 0.1;
        waveform.push(Math.max(0.1, Math.min(1, base + detail)));
    }
    return waveform;
};

const WAVEFORM_DATA = generateWaveform(300);
type TrimEdge = 'left' | 'right' | null;

export default function Timeline({ screenVideoUrl, webcamVideoUrl }: TimelineProps) {
    const {
        state, setPlayhead, selectClip, dispatch,
        zoomIn, zoomOut, splitAtPlayhead, togglePlay,
        deleteSelectedClip
    } = useEditor();

    const timelineRef = useRef<HTMLDivElement>(null);

    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [webcamThumbnails, setWebcamThumbnails] = useState<string[]>([]);
    const [trimmingClip, setTrimmingClip] = useState<{
        clipId: string;
        edge: TrimEdge;
        initialX: number;
        initialDuration: number;
        initialStart: number;
        initialSourceStart: number;
        initialSourceEnd: number;
    } | null>(null);

    const pixelsPerSecond = 80 * state.zoom;
    const timelineWidth = Math.max(state.duration * pixelsPerSecond, 800);
    const playheadPosition = state.playhead * pixelsPerSecond;

    // Get selected clip
    const selectedClip = useMemo(() => {
        if (!state.selectedClipId) return null;
        for (const track of state.tracks) {
            const clip = track.clips.find(c => c.id === state.selectedClipId);
            if (clip) return clip;
        }
        return null;
    }, [state.selectedClipId, state.tracks]);

    // Can split check
    const canSplit = useMemo(() => {
        return selectedClip &&
            state.playhead > selectedClip.startTime + 0.1 &&
            state.playhead < selectedClip.startTime + selectedClip.duration - 0.1;
    }, [selectedClip, state.playhead]);

    // Auto-scroll playhead
    useEffect(() => {
        if (!state.isPlaying || !timelineRef.current) return;
        const container = timelineRef.current;
        const margin = 100;
        if (playheadPosition < container.scrollLeft + margin) {
            container.scrollLeft = Math.max(0, playheadPosition - margin);
        } else if (playheadPosition > container.scrollLeft + container.clientWidth - margin) {
            container.scrollLeft = playheadPosition - container.clientWidth + margin;
        }
    }, [state.isPlaying, playheadPosition]);

    // Generate thumbnails
    useEffect(() => {
        if (!screenVideoUrl || state.duration <= 0) return;
        const video = document.createElement('video');
        video.src = screenVideoUrl;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = 160;
            canvas.height = 90;
            const thumbs: string[] = [];
            const numThumbs = Math.max(6, Math.min(15, Math.ceil(state.duration / 2)));
            const interval = state.duration / numThumbs;
            let currentTime = 0;
            const captureFrame = () => {
                if (currentTime >= state.duration || thumbs.length >= numThumbs) {
                    setThumbnails(thumbs);
                    return;
                }
                video.currentTime = Math.min(currentTime, video.duration - 0.1);
            };
            video.onseeked = () => {
                try { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); thumbs.push(canvas.toDataURL('image/jpeg', 0.5)); } catch { }
                currentTime += interval;
                captureFrame();
            };
            captureFrame();
        };
    }, [screenVideoUrl, state.duration]);

    useEffect(() => {
        if (!webcamVideoUrl || state.duration <= 0) return;
        const video = document.createElement('video');
        video.src = webcamVideoUrl;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = 60;
            canvas.height = 60;
            const thumbs: string[] = [];
            const interval = Math.max(1, state.duration / 4);
            let currentTime = 0;
            const captureFrame = () => {
                if (currentTime >= state.duration) { setWebcamThumbnails(thumbs); return; }
                video.currentTime = currentTime;
            };
            video.onseeked = () => {
                try { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); thumbs.push(canvas.toDataURL('image/jpeg', 0.5)); } catch { }
                currentTime += interval;
                captureFrame();
            };
            captureFrame();
        };
    }, [webcamVideoUrl, state.duration]);

    // Timeline click
    const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (trimmingClip || !timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
        const time = Math.max(0, Math.min(state.duration, x / pixelsPerSecond));
        setPlayhead(time);
        selectClip(null);
    }, [pixelsPerSecond, state.duration, setPlayhead, trimmingClip, selectClip]);

    // Playhead drag
    const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDraggingPlayhead(true);
    }, []);

    useEffect(() => {
        if (!isDraggingPlayhead) return;
        const handleMouseMove = (e: MouseEvent) => {
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
            setPlayhead(Math.max(0, Math.min(state.duration, x / pixelsPerSecond)));
        };
        const handleMouseUp = () => setIsDraggingPlayhead(false);
        document.body.style.cursor = 'grabbing';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingPlayhead, pixelsPerSecond, state.duration, setPlayhead]);

    // Trim drag - CapCut style
    const handleTrimStart = useCallback((e: React.MouseEvent, clipId: string, edge: TrimEdge, clip: Clip) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch({ type: 'PUSH_HISTORY' });
        setTrimmingClip({
            clipId,
            edge,
            initialX: e.clientX,
            initialDuration: clip.duration,
            initialStart: clip.startTime,
            // Store original source values for proper trimming
            initialSourceStart: clip.sourceStart,
            initialSourceEnd: clip.sourceEnd,
        });
        selectClip(clipId);
    }, [dispatch, selectClip]);

    useEffect(() => {
        if (!trimmingClip) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - trimmingClip.initialX;
            const deltaTime = deltaX / pixelsPerSecond;

            if (trimmingClip.edge === 'left') {
                // Trimming left edge: moves start point forward/backward
                // This changes both startTime and sourceStart
                const timeDelta = deltaTime;
                const newStart = Math.max(0, trimmingClip.initialStart + timeDelta);
                const maxStart = trimmingClip.initialStart + trimmingClip.initialDuration - 0.5; // Keep min 0.5s
                const clampedStart = Math.min(newStart, maxStart);
                const actualDelta = clampedStart - trimmingClip.initialStart;
                const newDuration = trimmingClip.initialDuration - actualDelta;
                const newSourceStart = trimmingClip.initialSourceStart + actualDelta;

                dispatch({
                    type: 'UPDATE_CLIP',
                    payload: {
                        clipId: trimmingClip.clipId,
                        updates: {
                            startTime: clampedStart,
                            duration: newDuration,
                            sourceStart: newSourceStart,
                            // sourceEnd stays the same when trimming left
                        }
                    },
                });
            } else {
                // Trimming right edge: changes duration and sourceEnd
                const newDuration = Math.max(0.5, trimmingClip.initialDuration + deltaTime);
                const maxDuration = state.duration - trimmingClip.initialStart;
                const clampedDuration = Math.min(newDuration, maxDuration);
                const newSourceEnd = trimmingClip.initialSourceStart + clampedDuration;

                dispatch({
                    type: 'UPDATE_CLIP',
                    payload: {
                        clipId: trimmingClip.clipId,
                        updates: {
                            duration: clampedDuration,
                            sourceEnd: newSourceEnd,
                            // sourceStart stays the same when trimming right
                        }
                    },
                });
            }
        };

        const handleMouseUp = () => setTrimmingClip(null);

        document.body.style.cursor = 'ew-resize';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [trimmingClip, pixelsPerSecond, state.duration, dispatch]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    const formatTimecode = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
    };

    const renderTimeRuler = useMemo(() => {
        const markers: React.ReactElement[] = [];
        let interval = state.zoom > 1.5 ? 1 : state.zoom > 0.5 ? 2 : 5;
        if (state.duration > 60) interval = state.zoom > 1 ? 5 : 10;
        if (state.duration > 300) interval = state.zoom > 0.5 ? 30 : 60;
        for (let t = 0; t <= state.duration; t += interval) {
            markers.push(
                <div key={t} className="absolute flex flex-col items-center" style={{ left: t * pixelsPerSecond }}>
                    <span className="text-[10px] text-gray-400 font-medium">{formatTime(t)}</span>
                    <div className="w-px h-2 bg-gray-300" />
                </div>
            );
        }
        return markers;
    }, [state.duration, state.zoom, pixelsPerSecond]);

    // Render video clip with CapCut-style trim handles
    const renderVideoClip = (clip: Clip, track: Track) => {
        const clipWidth = clip.duration * pixelsPerSecond;
        const clipLeft = clip.startTime * pixelsPerSecond;
        const isSelected = state.selectedClipId === clip.id;
        const isScreenTrack = track.type === 'screen';
        const thumbsToUse = isScreenTrack ? thumbnails : webcamThumbnails;
        const isTrimming = trimmingClip?.clipId === clip.id;

        return (
            <div
                key={clip.id}
                className={`absolute h-full cursor-pointer rounded-lg overflow-visible
                    ${isSelected ? 'z-10' : 'z-0'}`}
                style={{ left: clipLeft, width: Math.max(clipWidth, 30) }}
                onClick={(e) => { e.stopPropagation(); selectClip(clip.id); }}
            >
                {/* Main clip container */}
                <div className={`relative h-full rounded-lg overflow-hidden
                    ${isSelected ? 'ring-2 ring-yellow-400' : 'ring-1 ring-gray-400'}
                    ${isTrimming ? 'ring-2 ring-yellow-500' : ''}`}
                >
                    {/* Thumbnails */}
                    <div className="absolute inset-0 flex bg-gray-800">
                        {thumbsToUse.length > 0 ? thumbsToUse.map((thumb, i) => (
                            <div key={i} className="h-full flex-shrink-0"
                                style={{ width: `${100 / thumbsToUse.length}%`, backgroundImage: `url(${thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            />
                        )) : <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-600" />}
                    </div>

                    {/* Webcam pip */}
                    {isScreenTrack && webcamThumbnails.length > 0 && (
                        <div className="absolute bottom-1 right-1 w-7 h-7 rounded overflow-hidden ring-1 ring-white/50">
                            <img src={webcamThumbnails[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Duration badge */}
                    <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/70 rounded text-[9px] text-white">
                        {formatTime(clip.duration)}
                    </div>
                </div>

                {/* LEFT TRIM HANDLE - CapCut style rounded bar */}
                <div
                    className={`absolute -left-1 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center
                        ${isSelected || isTrimming ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                    onMouseDown={(e) => handleTrimStart(e, clip.id, 'left', clip)}
                >
                    <div className={`w-1.5 h-12 rounded-full shadow-md
                        ${isTrimming && trimmingClip?.edge === 'left' ? 'bg-yellow-400 scale-110' : 'bg-white'}`}
                    />
                </div>

                {/* RIGHT TRIM HANDLE - CapCut style rounded bar */}
                <div
                    className={`absolute -right-1 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center
                        ${isSelected || isTrimming ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                    onMouseDown={(e) => handleTrimStart(e, clip.id, 'right', clip)}
                >
                    <div className={`w-1.5 h-12 rounded-full shadow-md
                        ${isTrimming && trimmingClip?.edge === 'right' ? 'bg-yellow-400 scale-110' : 'bg-white'}`}
                    />
                </div>

                {/* Trim time preview */}
                {isTrimming && (
                    <div className="absolute -top-6 left-0 right-0 flex justify-between text-[9px] font-mono pointer-events-none">
                        <span className="bg-gray-800 text-white px-1 rounded">{formatTimecode(clip.startTime)}</span>
                        <span className="bg-gray-800 text-white px-1 rounded">{formatTimecode(clip.startTime + clip.duration)}</span>
                    </div>
                )}
            </div>
        );
    };

    const renderAudioClip = (clip: Clip) => {
        const clipWidth = clip.duration * pixelsPerSecond;
        const clipLeft = clip.startTime * pixelsPerSecond;
        const isSelected = state.selectedClipId === clip.id;
        const barsToShow = Math.max(10, Math.floor(clipWidth / 4));
        const isTrimming = trimmingClip?.clipId === clip.id;

        return (
            <div
                key={clip.id}
                className={`absolute h-full cursor-pointer overflow-visible ${isSelected ? 'z-10' : 'z-0'}`}
                style={{ left: clipLeft, width: Math.max(clipWidth, 30) }}
                onClick={(e) => { e.stopPropagation(); selectClip(clip.id); }}
            >
                <div className={`relative h-full rounded-full overflow-hidden
                    ${isSelected ? 'ring-2 ring-yellow-400' : 'ring-1 ring-gray-400'}
                    ${isTrimming ? 'ring-2 ring-yellow-500' : ''}`}
                >
                    <div className={`w-full h-full flex items-center justify-center px-2 ${isSelected ? 'bg-indigo-700' : 'bg-gray-700'}`}>
                        <svg className="w-full h-6" viewBox={`0 0 ${barsToShow * 4} 24`} preserveAspectRatio="none">
                            {WAVEFORM_DATA.slice(0, barsToShow).map((height, i) => (
                                <rect key={i} x={i * 4} y={12 - height * 10} width="2" height={height * 20} fill={isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(251,113,133,0.7)'} rx="1" />
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Trim handles */}
                <div
                    className={`absolute -left-1 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center
                        ${isSelected || isTrimming ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                    onMouseDown={(e) => handleTrimStart(e, clip.id, 'left', clip)}
                >
                    <div className={`w-1.5 h-8 rounded-full shadow-md ${isTrimming && trimmingClip?.edge === 'left' ? 'bg-yellow-400' : 'bg-white'}`} />
                </div>
                <div
                    className={`absolute -right-1 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center
                        ${isSelected || isTrimming ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                    onMouseDown={(e) => handleTrimStart(e, clip.id, 'right', clip)}
                >
                    <div className={`w-1.5 h-8 rounded-full shadow-md ${isTrimming && trimmingClip?.edge === 'right' ? 'bg-yellow-400' : 'bg-white'}`} />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white border-t border-gray-200">
            {/* Controls */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-1">
                    <button onClick={() => setPlayhead(0)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                        <SkipBack size={14} />
                    </button>
                    <button onClick={() => setPlayhead(Math.max(0, state.playhead - 5))} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                        {state.isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <button onClick={() => setPlayhead(Math.min(state.duration, state.playhead + 5))} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                        <ChevronRight size={16} />
                    </button>
                    <button onClick={() => setPlayhead(state.duration)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                        <SkipForward size={14} />
                    </button>
                    <div className="ml-2 px-2 py-0.5 bg-gray-900 text-white text-xs font-mono rounded">
                        {formatTimecode(state.playhead)} / {formatTimecode(state.duration)}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={splitAtPlayhead} disabled={!canSplit}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${canSplit ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-400 cursor-not-allowed'}`}>
                        <Scissors size={12} /> Split
                    </button>
                    <button onClick={deleteSelectedClip} disabled={!state.selectedClipId}
                        className={`p-1.5 rounded ${state.selectedClipId ? 'text-red-600 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'}`}>
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={zoomOut} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"><ZoomOut size={14} /></button>
                    <span className="text-xs text-gray-500 w-12 text-center">{Math.round(state.zoom * 100)}%</span>
                    <button onClick={zoomIn} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"><ZoomIn size={14} /></button>
                </div>
            </div>

            {/* Timeline */}
            <div ref={timelineRef} className="relative overflow-x-auto overflow-y-hidden" style={{ height: 140 }}>
                <div className="relative min-w-full" style={{ width: timelineWidth + 50 }} onClick={handleTimelineClick}>
                    <div className="h-6 border-b border-gray-100 relative">{renderTimeRuler}</div>

                    <div className="py-3 px-2 space-y-2">
                        {state.tracks.map((track) => (
                            <div key={track.id} className="relative" style={{ height: track.type === 'audio' ? 40 : 68 }}>
                                {track.clips.map((clip) => track.type === 'audio' ? renderAudioClip(clip) : renderVideoClip(clip, track))}
                            </div>
                        ))}
                        {state.tracks.length === 0 && <div className="h-16 flex items-center justify-center text-gray-400 text-sm">Record a video to start editing</div>}
                    </div>

                    {/* Playhead */}
                    <div className="absolute top-0 bottom-0 z-30 pointer-events-none" style={{ left: playheadPosition }}>
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 pointer-events-auto cursor-grab active:cursor-grabbing" onMouseDown={handlePlayheadMouseDown}>
                            <div className="w-3 h-4 bg-red-500 rounded-b" />
                        </div>
                        <div className="absolute top-4 bottom-0 left-1/2 w-0.5 bg-red-500 -translate-x-1/2" />
                    </div>
                </div>
            </div>
        </div>
    );
}
