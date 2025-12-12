'use client';

import { Volume2, VolumeX, Clock } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';

export default function ClipPropertiesPanel() {
    const { state, toggleClipMute, setClipSpeed, dispatch } = useEditor();

    const selectedClip = state.tracks.flatMap(t => t.clips).find(c => c.id === state.selectedClipId);

    if (!selectedClip) {
        return (
            <div className="flex-1 p-4">
                <h3 className="text-gray-900 font-semibold text-lg mb-4">Clip Properties</h3>
                <p className="text-sm text-gray-500">Select a clip to edit its properties</p>
            </div>
        );
    }

    const handleVolumeChange = (volume: number) => {
        dispatch({
            type: 'SET_CLIP_VOLUME',
            payload: { clipId: selectedClip.id, volume },
        });
    };

    return (
        <div className="flex-1 p-4">
            <h3 className="text-gray-900 font-semibold text-lg mb-4">Clip Properties</h3>

            <div className="space-y-5">
                {/* Clip Name */}
                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Name</label>
                    <div className="text-sm font-medium text-gray-900">{selectedClip.name}</div>
                </div>

                {/* Audio Controls */}
                <div>
                    <label className="text-sm text-gray-600 mb-2 block">Audio</label>
                    <div className="space-y-3">
                        <button
                            onClick={() => toggleClipMute(selectedClip.id)}
                            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border transition ${selectedClip.muted
                                    ? 'bg-red-50 border-red-200 text-red-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {selectedClip.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            <span className="text-sm font-medium">
                                {selectedClip.muted ? 'Muted' : 'Audio On'}
                            </span>
                        </button>

                        {!selectedClip.muted && (
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Volume</span>
                                    <span>{Math.round((selectedClip.volume || 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={selectedClip.volume || 1}
                                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Speed Control */}
                <div>
                    <label className="text-sm text-gray-600 mb-2 block flex items-center gap-1">
                        <Clock size={14} />
                        Speed
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                        {[0.5, 1, 1.5, 2].map((speed) => (
                            <button
                                key={speed}
                                onClick={() => setClipSpeed(selectedClip.id, speed)}
                                className={`py-2 text-sm rounded-lg transition ${selectedClip.speed === speed
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration Info */}
                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Duration</label>
                    <div className="text-sm font-medium text-gray-900">
                        {selectedClip.duration.toFixed(1)}s
                    </div>
                </div>
            </div>
        </div>
    );
}
