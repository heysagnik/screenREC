import { useCallback, useRef, useState } from 'react';
import { RECORDING_CONFIG } from '@/config/recording';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
    message: string;
    type: NotificationType;
    id: number;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationState[]>([]);
    const idRef = useRef(0);

    const showNotification = useCallback((message: string, type: NotificationType) => {
        idRef.current += 1;
        const id = idRef.current;

        setNotifications((prev) => [...prev, { message, type, id }]);

        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, RECORDING_CONFIG.NOTIFICATIONS.AUTO_DISMISS_MS);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        showNotification,
        removeNotification,
        clearAll,
    };
}
