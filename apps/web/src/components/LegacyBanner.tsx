'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'screenrec-legacy-popup-dismissed-v2';
const SCREENSHOT_URL =
  'https://api.microlink.io?url=https%3A%2F%2Fscreen-rec-legacy.vercel.app%2F' +
  '&overlay.browser=dark' +
  '&overlay.background=linear-gradient(225deg%2C%20%23FF057C%200%25%2C%20%238D0B93%2050%25%2C%20%23321575%20100%25)' +
  '&screenshot=true&meta=false&embed=screenshot.url';

export default function LegacyBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  const handleVisitLegacy = () => {
    window.open('https://screen-rec-legacy.vercel.app/', '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[72px] right-6 z-40 animate-fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-[280px] border border-gray-200">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full shadow-sm border border-gray-200 transition-all"
          aria-label="Close legacy banner"
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        <div className="block group">
          <div className="relative w-full h-[150px] bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SCREENSHOT_URL}
              alt="ScreenREC Legacy Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <div className="p-4">
            <button
              onClick={handleVisitLegacy}
              className="w-full bg-black text-white font-normal py-2 rounded-lg transition-colors hover:bg-zinc-900"
            >
              Visit Old Site (v1)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
