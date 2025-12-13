import { useCallback, useEffect } from 'react';

interface KeyboardShortcutsConfig {
    isRecording: boolean;
    isCameraOn: boolean;
    isScreenShared: boolean;
    onPause: () => void;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleScreen: () => void;
}

export function useKeyboardShortcuts({
    isRecording,
    isCameraOn,
    isScreenShared,
    onPause,
    onToggleMic,
    onToggleCamera,
    onToggleScreen,
}: KeyboardShortcutsConfig) {
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            const key = event.key.toLowerCase();
            const hasModifier = event.ctrlKey || event.metaKey;

            if (!hasModifier) return;

            switch (key) {
                case 'p':
                    event.preventDefault();
                    if (isRecording) onPause();
                    break;
                case 'm':
                    event.preventDefault();
                    onToggleMic();
                    break;
                case 'c':
                    event.preventDefault();
                    onToggleCamera();
                    break;
                case 's':
                    event.preventDefault();
                    onToggleScreen();
                    break;
            }
        },
        [isRecording, isCameraOn, isScreenShared, onPause, onToggleMic, onToggleCamera, onToggleScreen]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);
}
