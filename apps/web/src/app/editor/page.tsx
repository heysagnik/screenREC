'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import PreviewPlayer from '@/components/editor/PreviewPlayer';
import Timeline from '@/components/editor/Timeline';
import ToolsBar from '@/components/editor/ToolsBar';
import CutPanel from '@/components/editor/CutPanel';
import LayoutPanel from '@/components/editor/LayoutPanel';
import ClipPropertiesPanel from '@/components/editor/ClipPropertiesPanel';
import ExportModal from '@/components/editor/ExportModal';
import { useVideoStorage, ProjectUrls, ProjectManifest } from '@/hooks/useVideoStorage';
import { Track } from '@/types/editor';
import { ChevronLeft, Undo, Redo, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

function UndoRedoButtons() {
    const { undo, redo, canUndo, canRedo } = useEditor();
    return (
        <>
            <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition disabled:opacity-30"
                title="Undo (⌘Z)"
            >
                <Undo size={16} />
            </button>
            <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition disabled:opacity-30"
                title="Redo (⌘⇧Z)"
            >
                <Redo size={16} />
            </button>
        </>
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
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                    }
                    break;
                case 'y':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        redo();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, deleteSelectedClip, splitAtPlayhead, undo, redo]);

    return null;
}

function EditorContent() {
    const searchParams = useSearchParams();

    const projectId = searchParams.get('projectId') || undefined;
    const videoUrl = searchParams.get('video') || searchParams.get('screen') || undefined;
    const webcamUrl = searchParams.get('webcam') || undefined;
    const durationParam = searchParams.get('duration');

    const [activePanel, setActivePanel] = useState('cut');
    const [showExportModal, setShowExportModal] = useState(false);
    const [isLoading, setIsLoading] = useState(!!projectId);
    const [projectUrls, setProjectUrls] = useState<ProjectUrls | null>(null);
    const [projectManifest, setProjectManifest] = useState<ProjectManifest | null>(null);

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
    const duration = projectManifest?.duration || (durationParam ? parseInt(durationParam, 10) : 10);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <span className="text-gray-600">Loading project...</span>
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
                startTime: 0,
                duration: duration,
                sourceStart: 0,
                sourceEnd: duration,
                mediaUrl: screenUrl,
                type: 'video',
                name: 'Screen',
                speed: 1,
                muted: false,
                volume: 1,
            }] : [],
        },
        {
            id: 'webcam-track',
            type: 'webcam',
            name: 'Camera',
            muted: false,
            locked: false,
            color: '#10b981',
            clips: cameraUrl ? [{
                id: 'webcam-clip',
                trackId: 'webcam-track',
                startTime: 0,
                duration: duration,
                sourceStart: 0,
                sourceEnd: duration,
                mediaUrl: cameraUrl,
                type: 'video',
                name: 'Camera',
                speed: 1,
                muted: false,
                volume: 1,
            }] : [],
        },
        {
            id: 'audio-track',
            type: 'audio',
            name: 'Microphone',
            muted: false,
            locked: false,
            color: '#f59e0b',
            clips: audioUrl ? [{
                id: 'audio-clip',
                trackId: 'audio-track',
                startTime: 0,
                duration: duration,
                sourceStart: 0,
                sourceEnd: duration,
                mediaUrl: audioUrl,
                type: 'audio',
                name: 'Microphone',
                speed: 1,
                muted: false,
                volume: 1,
            }] : [],
        },
        {
            id: 'music-track',
            type: 'audio',
            name: 'Music',
            muted: false,
            locked: false,
            color: '#f43f5e',
            clips: [],
        },
    ];

    const renderPanel = () => {
        switch (activePanel) {
            case 'cut':
                return <CutPanel />;
            case 'clip':
                return <ClipPropertiesPanel />;
            case 'layout':
                return <LayoutPanel />;
            default:
                return <CutPanel />;
        }
    };

    return (
        <EditorProvider initialTracks={initialTracks}>
            <KeyboardShortcuts />
            <div className="fixed inset-0 bg-white flex flex-col">
                {/* Header with Export button */}
                <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Link href="/record" className="p-2 hover:bg-gray-100 rounded-xl transition">
                            <ChevronLeft size={18} className="text-gray-500" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-bold">S</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">Untitled Video</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <UndoRedoButtons />
                        <div className="w-px h-5 bg-gray-200 mx-2" />
                        <button
                            onClick={() => setShowExportModal(true)}
                            disabled={!videoUrl}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl transition text-sm font-medium"
                        >
                            <Download size={15} />
                            Export
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <main className="flex-1 bg-gray-100">
                        <PreviewPlayer screenVideoUrl={videoUrl} webcamVideoUrl={webcamUrl} />
                    </main>

                    <aside className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex">
                        {renderPanel()}
                        <ToolsBar activePanel={activePanel} onPanelChange={setActivePanel} />
                    </aside>
                </div>

                <div className="flex-shrink-0">
                    <Timeline />
                </div>
            </div>

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                videoUrl={videoUrl}
            />
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
