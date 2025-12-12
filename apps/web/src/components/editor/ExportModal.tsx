'use client';

import { useState } from 'react';
import { X, Download, Loader2, Check } from 'lucide-react';
import { useFFmpeg } from '@/hooks/useFFmpeg';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string;
}

export default function ExportModal({ isOpen, onClose, videoUrl }: ExportModalProps) {
    const [quality, setQuality] = useState<'720p' | '1080p' | '4k'>('1080p');
    const [exporting, setExporting] = useState(false);
    const [done, setDone] = useState(false);
    const { loading, progress, exportWithQuality, load } = useFFmpeg();

    const handleExport = async () => {
        if (!videoUrl) return;

        setExporting(true);
        setDone(false);

        try {
            // Fetch video blob from URL
            const response = await fetch(videoUrl);
            const videoBlob = await response.blob();

            // Export with selected quality
            const exportedBlob = await exportWithQuality(videoBlob, quality);

            if (exportedBlob) {
                // Use File System Access API if available
                if ('showSaveFilePicker' in window) {
                    try {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: `export-${quality}.mp4`,
                            types: [{
                                description: 'MP4 Video',
                                accept: { 'video/mp4': ['.mp4'] },
                            }],
                        });
                        const writable = await handle.createWritable();
                        await writable.write(exportedBlob);
                        await writable.close();
                        setDone(true);
                    } catch (e) {
                        if ((e as Error).name !== 'AbortError') {
                            // Fallback to download
                            const url = URL.createObjectURL(exportedBlob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `export-${quality}.mp4`;
                            a.click();
                            URL.revokeObjectURL(url);
                            setDone(true);
                        }
                    }
                } else {
                    // Fallback to download
                    const url = URL.createObjectURL(exportedBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `export-${quality}.mp4`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setDone(true);
                }
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Export Video</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Quality Selection */}
                <div className="mb-6">
                    <label className="text-sm text-gray-600 font-medium mb-3 block">Quality</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['720p', '1080p', '4k'] as const).map((q) => (
                            <button
                                key={q}
                                onClick={() => setQuality(q)}
                                disabled={exporting}
                                className={`py-3 rounded-xl border-2 font-medium transition ${quality === q
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    } ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress */}
                {(loading || exporting) && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">
                                {loading ? 'Loading FFmpeg...' : 'Exporting...'}
                            </span>
                            <span className="text-gray-500">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Done Message */}
                {done && (
                    <div className="mb-6 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                        <Check size={18} />
                        <span className="text-sm font-medium">Export complete! Download started.</span>
                    </div>
                )}

                {/* Export Button */}
                <button
                    onClick={handleExport}
                    disabled={exporting || !videoUrl}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition"
                >
                    {exporting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            Export as MP4
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                    First export may take longer to load FFmpeg (~25MB)
                </p>
            </div>
        </div>
    );
}
