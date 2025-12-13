'use client';

import { useState } from 'react';
import { HelpCircle, X, ExternalLink, Bug, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import { GitHubIcon, LinkedInIcon, XIcon } from './icons/SocialIcons';

const PROFILE_IMAGE_URL = 'https://unavatar.io/x/heysagnik';

export default function InfoButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        setTimeout(() => setIsAnimating(true), 10);
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => setIsOpen(false), 200);
    };

    return (
        <>
            {/* Floating trigger button */}
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-full shadow-md flex items-center justify-center transition-all hover:scale-105"
                aria-label="About ScreenREC"
            >
                <HelpCircle className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isAnimating ? 'bg-black/40' : 'bg-transparent'
                        }`}
                    onClick={handleClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="info-modal-title"
                >
                    <div
                        className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transition-all duration-200 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
                            aria-label="Close modal"
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>

                        {/* Modal content */}
                        <div className="p-6">
                            {/* Logo and title */}
                            <div className="flex items-center gap-3 mb-5">
                                <Image
                                    src="/logo.png"
                                    alt="ScreenREC"
                                    width={40}
                                    height={40}
                                    className="rounded-xl"
                                />
                                <div>
                                    <h2 id="info-modal-title" className="text-lg font-semibold text-gray-900">
                                        ScreenREC
                                    </h2>
                                    <p className="text-xs text-gray-400">v2.0</p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
                                A simple, privacy-first screen recorder. No downloads, no accounts—just open and record. Built for people who value simplicity.
                            </p>

                            {/* Product Hunt badges */}
                            <div className="flex flex-row gap-5 items-center mb-4">
                                <a
                                    href="https://www.producthunt.com/posts/screenrec"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-80 transition-opacity"
                                    aria-label="View on Product Hunt"
                                >
                                    <Image
                                        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=322532&theme=dark"
                                        alt="Product Hunt Featured"
                                        width={160}
                                        height={160}
                                        className="inline-block"
                                    />
                                </a>
                                <a
                                    href="https://www.producthunt.com/posts/screenrec"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-80 transition-opacity"
                                    aria-label="Top Post on Product Hunt"
                                >
                                    <Image
                                        src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=322532&theme=dark&period=daily"
                                        alt="Product Hunt Top Post"
                                        width={160}
                                        height={160}
                                        className="inline-block"
                                    />
                                </a>
                            </div>

                            <div className="h-px bg-gray-100 mb-5" aria-hidden="true" />

                            {/* Builder info */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                        {imageError ? (
                                            <span className="text-xs font-semibold text-gray-600">SS</span>
                                        ) : (
                                            <Image
                                                src={PROFILE_IMAGE_URL}
                                                alt="Sagnik Sahoo"
                                                width={32}
                                                height={32}
                                                className="w-full h-full object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Sagnik Sahoo</p>
                                        <p className="text-xs text-gray-400">Builder</p>
                                    </div>
                                </div>

                                {/* Social links */}
                                <div className="flex gap-1">
                                    <a
                                        href="https://www.linkedin.com/in/heysagnik"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                        aria-label="Connect on LinkedIn"
                                    >
                                        <LinkedInIcon />
                                    </a>
                                    <a
                                        href="https://twitter.com/heysagnik"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                        aria-label="Follow on X (Twitter)"
                                    >
                                        <XIcon />
                                    </a>
                                </div>
                            </div>

                            <div className="mb-4 space-y-2">
                                <a
                                    href="https://github.com/heysagnik/screenREC/issues/new?labels=bug&template=bug_report.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Bug className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-900">Report a Bug</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-red-400 group-hover:text-red-600" />
                                </a>
                                <a
                                    href="https://github.com/heysagnik/screenREC/issues/new?labels=enhancement&template=feature_request.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-medium text-indigo-900">Request Feature</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600" />
                                </a>
                            </div>

                            <a
                                href="https://screen-rec-legacy.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                            >
                                <span className="text-sm text-gray-600">Looking for v1?</span>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                            </a>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-transparent border-t border-gray-100">
                            <a
                                href="https://github.com/heysagnik/screenREC"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full py-2.5 bg-black hover:bg-neutral-900 text-white rounded-lg text-sm font-normal transition-colors gap-2"
                            >
                                <GitHubIcon className="w-4 h-4" />
                                Star us on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
