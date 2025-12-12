'use client';

import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export type NotificationType = 'error' | 'success' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  actionLabel?: string; // e.g., "Settings"
  onAction?: () => void;
}

export default function Notification({ message, type, onClose, actionLabel, onAction }: NotificationProps) {
  // Match screenshot: dark toast, subtle border, rounded corners, inline action
  const styles = {
    error: 'bg-neutral-800 text-white border border-white/10',
    success: 'bg-neutral-800 text-white border border-white/10',
    info: 'bg-neutral-800 text-white border border-white/10',
  } as const;

  const iconColors = {
    error: 'text-amber-400',
    success: 'text-green-400',
    info: 'text-blue-400',
  } as const;

  const icons = {
    error: <AlertTriangle className={`w-4 h-4 ${iconColors.error}`} />,
    success: <CheckCircle className={`w-4 h-4 ${iconColors.success}`} />,
    info: <Info className={`w-4 h-4 ${iconColors.info}`} />,
  } as const;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        pointer-events-auto relative flex min-w-80 max-w-lg items-center gap-2
        rounded-xl p-2.5 pl-3 pr-9 shadow-md
        animate-in slide-in-from-top-2 fade-in duration-200
        ${styles[type]}
      `}
    >
      <div className="flex-shrink-0 self-start mt-0.5">{icons[type]}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-medium leading-5 text-white whitespace-pre-wrap">{message}</p>
        {actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="shrink-0 text-[13px] font-medium text-gray-300 underline-offset-2 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}