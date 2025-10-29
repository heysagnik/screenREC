import { useEffect } from 'react';

/**
 * Keyboard shortcuts for recording controls
 * - Ctrl/Cmd + R: Start/Stop recording
 * - Ctrl/Cmd + P: Pause/Resume recording
 * - Ctrl/Cmd + M: Toggle microphone
 * - Ctrl/Cmd + C: Toggle camera
 * - Ctrl/Cmd + S: Share/Stop screen
 */
export interface KeyboardShortcutHandlers {
  onStartStopRecording?: () => void;
  onPauseRecording?: () => void;
  onToggleMic?: () => void;
  onToggleCamera?: () => void;
  onShareScreen?: () => void;
}

export function useKeyboardShortcuts({
  onStartStopRecording,
  onPauseRecording,
  onToggleMic,
  onToggleCamera,
  onShareScreen,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
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
        case 'r':
          event.preventDefault();
          onStartStopRecording?.();
          break;
        case 'p':
          event.preventDefault();
          onPauseRecording?.();
          break;
        case 'm':
          event.preventDefault();
          onToggleMic?.();
          break;
        case 'c':
          event.preventDefault();
          onToggleCamera?.();
          break;
        case 's':
          event.preventDefault();
          onShareScreen?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onStartStopRecording, onPauseRecording, onToggleMic, onToggleCamera, onShareScreen]);
}
