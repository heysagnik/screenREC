'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import PreviewPlayer, { CanvasSettings } from '@/components/editor/PreviewPlayer';
import Timeline from '@/components/editor/Timeline';
import { useVideoStorage, ProjectUrls, ProjectManifest } from '@/hooks/useVideoStorage';
import { Track } from '@/types/editor';
import {
    ChevronLeft, Undo, Redo, Download, Play, Pause, Scissors, Trash2,
    Eye, Sparkles, Sliders, Layout, ZoomIn, Palette, Square, Subtitles
} from 'lucide-react';
import Link from 'next/link';

// Tool icons matching ScreenStudio
const TOOLS = [
    { id: 'setup', icon: Sliders, label: 'Setup' },
    { id: 'cut', icon: Scissors, label: 'Cut' },
    { id: 'layout', icon: Layout, label: 'Layout' },
    { id: 'zoom', icon: ZoomIn, label: 'Zoom' },
    { id: 'effect', icon: Sparkles, label: 'Effect' },
    { id: 'background', icon: Palette, label: 'BG' },
    { id: 'border', icon: Square, label: 'Border' },
    { id: 'subtitles', icon: Subtitles, label: 'Subs' },
];

// Deterministic waveform heights to avoid hydration mismatch (pre-generated)
const WAVEFORM_HEIGHTS: number[] = [
    25, 32, 18, 38, 22, 35, 28, 15, 40, 20, 33, 26, 19, 37, 24, 30, 21, 36, 27, 16,
    39, 23, 34, 29, 17, 38, 25, 31, 20, 35, 28, 14, 40, 22, 33, 27, 18, 37, 24, 30,
    21, 36, 26, 15, 39, 23, 34, 29, 16, 38, 25, 32, 19, 36, 27, 14, 40, 22, 33, 28,
    17, 37, 24, 31, 20, 35, 26, 15, 39, 23, 34, 30, 18, 38, 25, 32, 21, 36, 27, 16,
    40, 22, 33, 28, 19, 37, 24, 31, 14, 35, 26, 17, 39, 23, 34, 30, 20, 38, 25, 32,
];

function UndoRedoButtons() {
    const { undo, redo, canUndo, canRedo } = useEditor();
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-30"
                title="Undo"
            >
                <Undo size={16} />
            </button>
            <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-30"
                title="Redo"
            >
                <Redo size={16} />
            </button>
        </div>
    );
}



function KeyboardShortcuts() {
    const { togglePlay, deleteSelectedClip, splitAtPlayhead, undo, redo } = useEditor();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'delete':
                case 'backspace':
                    e.preventDefault();
                    deleteSelectedClip();
                    break;
                case 's':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        splitAtPlayhead();
                    }
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        e.shiftKey ? redo() : undo();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, deleteSelectedClip, splitAtPlayhead, undo, redo]);

    return null;
}

function ToolsPanel({ activeTool }: { activeTool: string }) {
    // Panel content based on active tool
    const renderContent = () => {
        switch (activeTool) {
            case 'cut':
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <span className="text-lg">😊</span> Mistakes
                                <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">New</span>
                            </h4>
                            <p className="text-xs text-gray-500 mb-3">Find and cut mistakes in your clip.</p>
                            <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">
                                Find mistakes
                            </button>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <span className="text-lg">🎯</span> Buffers
                            </h4>
                            <p className="text-xs text-gray-500 mb-3">No buffers found.</p>
                            <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">
                                Remove buffers
                            </button>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <span className="text-lg">🔇</span> Silences
                            </h4>
                            <p className="text-xs text-gray-500 mb-3">No silences found.</p>
                            <div className="flex gap-2 mb-3">
                                <button className="flex-1 py-1.5 px-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium">Natural</button>
                                <button className="flex-1 py-1.5 px-3 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">Fast</button>
                                <button className="flex-1 py-1.5 px-3 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">Faster</button>
                            </div>
                            <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">
                                Remove silences
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-center text-gray-500 py-8">
                        <p className="text-sm">Select a tool to see options</p>
                    </div>
                );
        }
    };

    return (
        <div className="p-4">
            <div className="flex border-b border-gray-200 mb-4">
                <button className="flex-1 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
                    <span className="flex items-center justify-center gap-1.5">
                        <Sliders size={14} /> Tools
                    </span>
                </button>
                <button className="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    <span className="flex items-center justify-center gap-1.5">
                        <Subtitles size={14} /> Transcript
                    </span>
                </button>
            </div>
            {renderContent()}
        </div>
    );
}

function MiniTimeline() {
    const { state, setPlayhead, togglePlay, splitAtPlayhead, deleteSelectedClip } = useEditor();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        setPlayhead(Math.max(0, Math.min(state.duration, percentage * state.duration)));
    };

    const progress = state.duration > 0 ? (state.playhead / state.duration) * 100 : 0;

    return (
        <div className="bg-white border-t border-gray-200">
            {/* Compact timeline with waveform */}
            <div
                className="relative h-14 bg-gradient-to-b from-gray-50 to-gray-100 cursor-pointer group"
                onClick={handleTimelineClick}
            >
                {/* Waveform bars */}
                <div className="absolute inset-0 flex items-center px-2">
                    <svg className="w-full h-10" viewBox="0 0 800 40" preserveAspectRatio="none">
                        {WAVEFORM_HEIGHTS.map((height, i) => (
                            <rect
                                key={i}
                                x={i * 8}
                                y={(40 - height * 0.8) / 2}
                                width="5"
                                height={height * 0.8}
                                className="fill-indigo-300 group-hover:fill-indigo-400 transition-colors"
                                rx="2"
                            />
                        ))}
                    </svg>
                </div>

                {/* Progress overlay */}
                <div
                    className="absolute inset-y-0 left-0 bg-indigo-500/10 pointer-events-none"
                    style={{ width: `${progress}%` }}
                />

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 z-10 shadow-sm"
                    style={{ left: `${progress}%` }}
                >
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-600 rounded-full shadow" />
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-600 rounded-full shadow" />
                </div>
            </div>

            {/* Controls bar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="w-9 h-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition shadow-sm"
                    >
                        {state.isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>

                    {/* Time display */}
                    <div className="text-sm font-mono text-gray-700">
                        <span className="font-medium">{formatTime(state.playhead)}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-gray-500">{formatTime(state.duration)}</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={splitAtPlayhead}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
                        title="Split at playhead (S)"
                    >
                        <Scissors size={14} />
                        <span className="hidden sm:inline">Split</span>
                    </button>
                    <button
                        onClick={deleteSelectedClip}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition"
                        title="Delete selected (Del)"
                    >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}


function EditorContent() {
    const searchParams = useSearchParams();

    const projectId = searchParams.get('projectId') || undefined;
    const videoUrl = searchParams.get('video') || searchParams.get('screen') || undefined;
    const webcamUrl = searchParams.get('webcam') || undefined;

    const [activeTool, setActiveTool] = useState('cut');
    const [isLoading, setIsLoading] = useState(!!projectId);
    const [projectUrls, setProjectUrls] = useState<ProjectUrls | null>(null);
    const [projectManifest, setProjectManifest] = useState<ProjectManifest | null>(null);
    const [projectName, setProjectName] = useState('Untitled Recording');
    const [isEditingName, setIsEditingName] = useState(false);
    const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
        aspectRatio: '16:9',
        background: { type: 'gradient', value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
        cameraPosition: 'bottom-left',
        cameraSize: 0.25,
        cameraShape: 'rectangle',
    });

    const { getProjectUrls, loadProjectManifest } = useVideoStorage();

    useEffect(() => {
        if (projectId) {
            setIsLoading(true);
            Promise.all([
                getProjectUrls(projectId),
                loadProjectManifest(projectId)
            ]).then(([urls, manifest]) => {
                setProjectUrls(urls);
                setProjectManifest(manifest);
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        }
    }, [projectId, getProjectUrls, loadProjectManifest]);

    const screenUrl = projectUrls?.screen || videoUrl;
    const cameraUrl = projectUrls?.camera || webcamUrl;
    const audioUrl = projectUrls?.audio;
    const duration = projectManifest?.duration || 10;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-gray-500">Loading project...</span>
                </div>
            </div>
        );
    }

    const initialTracks: Track[] = [
        {
            id: 'screen-track',
            type: 'screen',
            name: 'Screen',
            muted: false,
            locked: false,
            color: '#6366f1',
            clips: screenUrl ? [{
                id: 'screen-clip',
                trackId: 'screen-track',
                name: 'Screen Recording',
                type: 'video',
                startTime: 0,
                duration: duration,
                sourceStart: 0,
                sourceEnd: duration,
                mediaUrl: screenUrl,
                speed: 1,
                muted: false,
                volume: 1,
            }] : [],
        },
    ];

    return (
        <EditorProvider initialTracks={initialTracks}>
            <KeyboardShortcuts />
            <div className="fixed inset-0 bg-gray-50 flex flex-col select-none">
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Link href="/record" className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <ChevronLeft size={18} className="text-gray-500" />
                        </Link>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white text-sm font-bold">{projectName.charAt(0).toUpperCase()}</span>
                            </div>
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                    autoFocus
                                    className="text-sm font-medium text-gray-800 bg-transparent border-b-2 border-indigo-500 outline-none px-1 py-0.5 min-w-[100px]"
                                />
                            ) : (
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="text-sm font-medium text-gray-800 hover:text-indigo-600 transition"
                                >
                                    {projectName}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <UndoRedoButtons />
                        <div className="w-px h-5 bg-gray-200 mx-1" />
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition">
                            <Eye size={14} /> View
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </header>

                {/* Main content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Preview area */}
                    <main className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
                        <PreviewPlayer
                            screenVideoUrl={screenUrl}
                            webcamVideoUrl={cameraUrl}
                            audioUrl={audioUrl}
                            canvasSettings={canvasSettings}
                        />
                    </main>

                    {/* Right sidebar */}
                    <aside className="w-80 flex bg-white border-l border-gray-200">
                        {/* Panel content */}
                        <div className="flex-1 overflow-y-auto">
                            <ToolsPanel activeTool={activeTool} />
                        </div>

                        {/* Tool icons bar */}
                        <div className="w-14 flex flex-col items-center py-3 bg-gray-50 border-l border-gray-200">
                            {TOOLS.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => setActiveTool(tool.id)}
                                    className={`flex flex-col items-center gap-1 p-2.5 w-full transition ${activeTool === tool.id
                                        ? 'text-indigo-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <tool.icon size={18} strokeWidth={activeTool === tool.id ? 2 : 1.5} />
                                    <span className="text-[10px] font-medium">{tool.label}</span>
                                </button>
                            ))}
                        </div>
                    </aside>
                </div>

                {/* Timeline */}
                <Timeline screenVideoUrl={screenUrl} webcamVideoUrl={cameraUrl} />
            </div>
        </EditorProvider>
    );
}

export default function EditorPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-gray-500">Loading editor...</div>
            </div>
        }>
            <EditorContent />
        </Suspense>
    );
}
