'use client';

import { Scissors, Trash2, Clock } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';

export default function EditPanel() {
    const { state, splitAtPlayhead, deleteSelectedClip } = useEditor();
    const hasSelection = !!state.selectedClipId;

    return (
        <div className="flex-1 p-4">
            <h3 className="text-gray-900 font-semibold text-base mb-4">Edit</h3>

            <div className="space-y-3">
                <button
                    onClick={splitAtPlayhead}
                    disabled={!hasSelection}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition text-left"
                >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Scissors size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Split Clip</p>
                        <p className="text-xs text-gray-500">Cut at playhead position</p>
                    </div>
                </button>

                <button
                    onClick={deleteSelectedClip}
                    disabled={!hasSelection}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition text-left group"
                >
                    <div className="w-10 h-10 bg-gray-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition">
                        <Trash2 size={18} className="text-gray-600 group-hover:text-red-600 transition" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-red-700 transition">Delete Clip</p>
                        <p className="text-xs text-gray-500">Remove selected clip</p>
                    </div>
                </button>
            </div>

            {!hasSelection && (
                <p className="text-xs text-gray-400 text-center mt-6">
                    Select a clip to edit
                </p>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-xs text-gray-500 font-medium uppercase mb-3">Shortcuts</h4>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                        <span>Split</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">S</kbd>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Delete</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">Del</kbd>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Undo</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">⌘Z</kbd>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Play/Pause</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">Space</kbd>
                    </div>
                </div>
            </div>
        </div>
    );
}
