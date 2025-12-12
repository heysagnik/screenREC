'use client';

import { useState } from 'react';
import { X, Download, FileVideo } from 'lucide-react';

interface DownloadSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: (settings: DownloadSettings) => void;
    videoBlob: Blob | null;
}

export interface DownloadSettings {
    name: string;
    format: 'webm' | 'mp4';
}

export default function DownloadSettingsModal({
    isOpen,
    onClose,
    onDownload,
    videoBlob
}: DownloadSettingsModalProps) {
    const [name, setName] = useState(`Recording ${new Date().toLocaleDateString()}`);
    const [format, setFormat] = useState<'webm' | 'mp4'>('webm');

    if (!isOpen) return null;

    const handleDownload = () => {
        onDownload({ name, format });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <FileVideo size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Save Recording</h2>
                            {videoBlob && (
                                <p className="text-sm text-gray-500">{formatFileSize(videoBlob.size)}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Recording Name */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        placeholder="My Recording"
                    />
                </div>

                {/* Format Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setFormat('webm')}
                            className={`px-4 py-3 rounded-xl border-2 font-medium transition ${format === 'webm'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                        >
                            <span className="block text-sm">WebM</span>
                            <span className="block text-xs text-gray-500 mt-1">Instant download</span>
                        </button>
                        <button
                            onClick={() => setFormat('mp4')}
                            className={`px-4 py-3 rounded-xl border-2 font-medium transition ${format === 'mp4'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                        >
                            <span className="block text-sm">MP4</span>
                            <span className="block text-xs text-gray-500 mt-1">Best compatibility</span>
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}
