'use client';

import { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';

export default function KeyboardShortcutsHint() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('shortcuts-hint-dismissed');
    if (dismissed) {
      setHasBeenDismissed(true);
      return;
    }

    // Show after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    localStorage.setItem('shortcuts-hint-dismissed', 'true');
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  if (hasBeenDismissed && !isVisible) {
    return (
      <button
        onClick={handleToggle}
        className="fixed bottom-6 left-6 w-12 h-12 bg-white hover:bg-gray-50 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all z-50"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard size={20} className="text-gray-600" />
      </button>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Keyboard size={20} className="text-gray-700" />
          <h3 className="font-semibold text-gray-900">Keyboard Shortcuts</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <ShortcutRow shortcut="Ctrl/Cmd + R" action="Start/Stop Recording" />
        <ShortcutRow shortcut="Ctrl/Cmd + P" action="Pause/Resume" />
        <ShortcutRow shortcut="Ctrl/Cmd + M" action="Toggle Microphone" />
        <ShortcutRow shortcut="Ctrl/Cmd + C" action="Toggle Camera" />
        <ShortcutRow shortcut="Ctrl/Cmd + S" action="Share Screen" />
      </div>
    </div>
  );
}

function ShortcutRow({ shortcut, action }: { shortcut: string; action: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-600">{action}</span>
      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700 border border-gray-300">
        {shortcut}
      </kbd>
    </div>
  );
}
