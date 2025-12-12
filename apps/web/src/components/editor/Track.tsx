'use client';

import { useEditor } from '@/contexts/EditorContext';
import { Track as TrackType } from '@/types/editor';
import { Volume2, VolumeX, Lock, Unlock } from 'lucide-react';

interface TrackProps {
    track: TrackType;
    pixelsPerSecond: number;
}

export default function Track({ track, pixelsPerSecond }: TrackProps) {
    const { state, dispatch, selectClip } = useEditor();

    const handleClipClick = (clipId: string) => {
        if (!track.locked) {
            selectClip(clipId);
        }
    };

    const toggleMute = () => {
        dispatch({ type: 'TOGGLE_TRACK_MUTE', payload: track.id });
    };

    const toggleLock = () => {
        dispatch({ type: 'TOGGLE_TRACK_LOCK', payload: track.id });
    };

    return (
        <div className="flex items-stretch border-b border-gray-700">
            <div className="w-32 flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-800 border-r border-gray-700">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: track.color }}
                />
                <span className="text-xs text-gray-300 truncate flex-1">{track.name}</span>
                <button
                    onClick={toggleMute}
                    className="p-1 text-gray-400 hover:text-white transition"
                >
                    {track.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <button
                    onClick={toggleLock}
                    className="p-1 text-gray-400 hover:text-white transition"
                >
                    {track.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
            </div>

            <div className="flex-1 relative h-16 bg-gray-900">
                {track.clips.map((clip) => (
                    <div
                        key={clip.id}
                        onClick={() => handleClipClick(clip.id)}
                        className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all ${state.selectedClipId === clip.id ? 'ring-2 ring-white' : ''
                            } ${track.locked ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
                        style={{
                            left: clip.startTime * pixelsPerSecond,
                            width: clip.duration * pixelsPerSecond,
                            backgroundColor: track.color,
                        }}
                    >
                        <div className="px-2 py-1 text-xs text-white truncate">
                            {clip.name}
                        </div>
                        {clip.type === 'audio' && (
                            <div className="absolute inset-x-2 bottom-1 top-6 flex items-end gap-px">
                                {Array.from({ length: 40 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-white/50 rounded-t"
                                        style={{ height: `${20 + Math.random() * 60}%` }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
