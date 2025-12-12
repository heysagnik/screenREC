'use client';

import { Scissors, LayoutGrid, Film } from 'lucide-react';

interface ToolsBarProps {
    activePanel: string;
    onPanelChange: (panel: string) => void;
}

const tools = [
    { id: 'cut', icon: Scissors, label: 'Edit' },
    { id: 'clip', icon: Film, label: 'Clip' },
    { id: 'layout', icon: LayoutGrid, label: 'Layout' },
];

export default function ToolsBar({ activePanel, onPanelChange }: ToolsBarProps) {
    return (
        <div className="w-14 flex flex-col items-center py-3 bg-white border-l border-gray-100">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => onPanelChange(tool.id)}
                    className={`flex flex-col items-center gap-1 p-3 w-full transition rounded-lg mx-1 ${activePanel === tool.id
                            ? 'text-indigo-600 bg-indigo-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <tool.icon size={20} strokeWidth={activePanel === tool.id ? 2 : 1.5} />
                    <span className="text-[10px] font-medium">{tool.label}</span>
                </button>
            ))}
        </div>
    );
}
