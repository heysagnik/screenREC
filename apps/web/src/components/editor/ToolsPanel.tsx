'use client';

import { Scissors, Trash2, Clock, Volume2, LayoutGrid, Wand2 } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';

export default function ToolsPanel() {
    const { state, splitAtPlayhead, deleteSelectedClip } = useEditor();

    const tools = [
        { icon: Scissors, label: 'Split', onClick: splitAtPlayhead, disabled: !state.selectedClipId },
        { icon: Trash2, label: 'Delete', onClick: deleteSelectedClip, disabled: !state.selectedClipId },
        { icon: Clock, label: 'Speed', onClick: () => { }, disabled: true },
        { icon: Volume2, label: 'Volume', onClick: () => { }, disabled: true },
        { icon: LayoutGrid, label: 'Layout', onClick: () => { }, disabled: false },
        { icon: Wand2, label: 'Effects', onClick: () => { }, disabled: true },
    ];

    return (
        <div className="flex flex-col gap-1 p-2 bg-gray-800 rounded-lg">
            {tools.map((tool) => (
                <button
                    key={tool.label}
                    onClick={tool.onClick}
                    disabled={tool.disabled}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition ${tool.disabled
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                    title={tool.label}
                >
                    <tool.icon size={20} />
                    <span className="text-xs">{tool.label}</span>
                </button>
            ))}
        </div>
    );
}
