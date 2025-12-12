'use client';

import { useRef, useCallback, useState } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { Monitor, Camera, Mic, Music, Volume2, VolumeX, Plus, Minus, Play, Pause } from 'lucide-react';

export default function Timeline() {
    const { state, setPlayhead, dispatch, togglePlay } = useEditor();
    const timelineRef = useRef<HTMLDivElement>(null);
    const [isDragging] = useState(false);

    const pixelsPerSecond = 80 * state.zoom;
    const totalDuration = Math.max(state.duration, 10);

    const handleTimelineClick = useCallback(
        (e: React.MouseEvent) => {
            if (isDragging) return;
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left - 100;
            const time = Math.max(0, x / pixelsPerSecond);
            setPlayhead(Math.min(time, totalDuration));
        },
        [pixelsPerSecond, setPlayhead, totalDuration, isDragging]
    );

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const trackIcons = {
        screen: Monitor,
        webcam: Camera,
        audio: Mic,
        music: Music,
    };

    const trackColors = {
        screen: 'bg-indigo-500',
        webcam: 'bg-emerald-500',
        audio: 'bg-amber-500',
        music: 'bg-rose-500',
    };

    const trackBgColors = {
        screen: 'bg-indigo-50',
        webcam: 'bg-emerald-50',
        audio: 'bg-amber-50',
        music: 'bg-rose-50',
    };

    return (
        <div className="bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
                <button
                    onClick={togglePlay}
                    className="w-9 h-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition shadow-sm"
                >
                    {state.isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>

                <div className="flex items-center gap-2 text-sm font-mono">
                    <span className="text-gray-900 font-medium">{formatTime(state.playhead)}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500">{formatTime(totalDuration)}</span>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => dispatch({ type: 'SET_ZOOM', payload: state.zoom / 1.25 })}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-xs text-gray-500 w-12 text-center">{Math.round(state.zoom * 100)}%</span>
                    <button
                        onClick={() => dispatch({ type: 'SET_ZOOM', payload: state.zoom * 1.25 })}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded transition"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="flex">
                <div className="w-[100px] flex-shrink-0 border-r border-gray-200 bg-white">
                    {state.tracks.map((track) => {
                        const Icon = trackIcons[track.type] || Monitor;
                        return (
                            <div
                                key={track.id}
                                className="h-14 flex items-center gap-2 px-3 border-b border-gray-100"
                            >
                                <Icon size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-600 font-medium truncate flex-1">
                                    {track.type.charAt(0).toUpperCase() + track.type.slice(1)}
                                </span>
                                <button
                                    onClick={() => dispatch({ type: 'TOGGLE_TRACK_MUTE', payload: track.id })}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div
                    ref={timelineRef}
                    className="flex-1 overflow-x-auto cursor-pointer"
                    onClick={handleTimelineClick}
                >
                    <div className="h-6 bg-gray-100 border-b border-gray-200 relative">
                        {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute top-0 h-full flex flex-col justify-end"
                                style={{ left: i * pixelsPerSecond }}
                            >
                                <div className="w-px h-2 bg-gray-300" />
                                <span className="text-[10px] text-gray-400 ml-1">{formatTime(i)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative" style={{ width: Math.max(totalDuration * pixelsPerSecond + 200, 800) }}>
                        {state.tracks.map((track) => (
                            <div
                                key={track.id}
                                className={`h-14 border-b border-gray-100 relative ${trackBgColors[track.type] || 'bg-gray-50'}`}
                            >
                                {track.clips.map((clip) => (
                                    <div
                                        key={clip.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch({ type: 'SELECT_CLIP', payload: clip.id });
                                        }}
                                        className={`absolute top-1.5 bottom-1.5 rounded-lg cursor-pointer transition-all ${trackColors[track.type] || 'bg-gray-500'
                                            } ${state.selectedClipId === clip.id
                                                ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-50 shadow-lg'
                                                : 'hover:brightness-110'
                                            } ${clip.muted ? 'opacity-50' : ''}`}
                                        style={{
                                            left: clip.startTime * pixelsPerSecond,
                                            width: Math.max(clip.duration * pixelsPerSecond, 40),
                                        }}
                                    >
                                        <div className="h-full flex items-center px-2 overflow-hidden">
                                            <span className="text-xs text-white font-medium truncate">
                                                {clip.name}
                                            </span>
                                        </div>
                                        <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l-lg" />
                                        <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r-lg" />
                                    </div>
                                ))}
                            </div>
                        ))}

                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 z-20 pointer-events-none"
                            style={{ left: state.playhead * pixelsPerSecond }}
                        >
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-600 rounded-full shadow" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white border-t border-gray-100">
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 text-xs transition">
                    <Plus size={14} />
                    Add Music
                </button>
            </div>
        </div>
    );
}
