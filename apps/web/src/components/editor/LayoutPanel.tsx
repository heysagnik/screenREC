'use client';

import { useState } from 'react';
import { Circle, Square, Monitor } from 'lucide-react';

type CameraPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type CameraShape = 'circle' | 'rectangle';

export default function LayoutPanel() {
    const [cameraPosition, setCameraPosition] = useState<CameraPosition>('bottom-right');
    const [cameraShape, setCameraShape] = useState<CameraShape>('circle');

    return (
        <div className="flex-1 p-4">
            <h3 className="text-gray-900 font-semibold text-base mb-4">Layout</h3>

            {/* Camera Shape */}
            <div className="mb-5">
                <label className="text-xs text-gray-500 font-medium uppercase mb-2 block">
                    Camera Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setCameraShape('circle')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition ${cameraShape === 'circle'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        <Circle size={16} />
                        <span className="text-sm font-medium">Circle</span>
                    </button>
                    <button
                        onClick={() => setCameraShape('rectangle')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition ${cameraShape === 'rectangle'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        <Square size={16} />
                        <span className="text-sm font-medium">Rectangle</span>
                    </button>
                </div>
            </div>

            {/* Camera Position */}
            <div>
                <label className="text-xs text-gray-500 font-medium uppercase mb-2 block">
                    Camera Position
                </label>
                <div className="relative w-full aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-3">
                    {/* Screen preview */}
                    <div className="absolute inset-4 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                        <Monitor size={24} className="text-gray-300" />
                    </div>

                    {/* Corner buttons */}
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as CameraPosition[]).map((pos) => (
                        <button
                            key={pos}
                            onClick={() => setCameraPosition(pos)}
                            className={`absolute w-8 h-8 transition-all duration-200 ${cameraShape === 'circle' ? 'rounded-full' : 'rounded-lg'
                                } ${cameraPosition === pos
                                    ? 'bg-indigo-600 shadow-lg scale-110'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                } ${pos === 'top-left' ? 'top-3 left-3' : ''} ${pos === 'top-right' ? 'top-3 right-3' : ''
                                } ${pos === 'bottom-left' ? 'bottom-3 left-3' : ''} ${pos === 'bottom-right' ? 'bottom-3 right-3' : ''
                                }`}
                        />
                    ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                    Click a corner to position camera
                </p>
            </div>
        </div>
    );
}
