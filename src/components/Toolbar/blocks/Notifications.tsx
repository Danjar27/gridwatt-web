import { Bell, BellPlus, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthContext } from '@context/auth/context.ts';
import Visible from '@components/atoms/Visible';
import { classnames } from '@utils/classnames.ts';

interface LocalNotification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
}

const STORAGE_KEY_PREFIX = 'gw_notifications_';

function getStorageKey(userId: number) {
    return `${STORAGE_KEY_PREFIX}${userId}`;
}

function getStoredData(userId: number): { orderCount: number; notifications: Array<LocalNotification> } {
    try {
        const raw = localStorage.getItem(getStorageKey(userId));
        if (raw) {return JSON.parse(raw);}
    } catch {
        // ignore parse errors
    }

    return { orderCount: -1, notifications: [] };
}

function setStoredData(userId: number, data: { orderCount: number; notifications: Array<LocalNotification> }) {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
}

const Notifications = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Array<LocalNotification>>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthContext();
    const isTechnician = user?.role?.name === 'technician';

    // Poll my orders count for technicians
    const { data: myOrders = [] } = useQuery({
        queryKey: ['orders', 'my'],
        queryFn: () => apiClient.getMyOrders(),
        enabled: isTechnician && !!user,
        refetchInterval: 30_000,
    });

    // Check for new assignments by comparing order count
    useEffect(() => {
        if (!user || !isTechnician) {return;}

        const stored = getStoredData(user.id);
        const currentCount = myOrders.length;

        // Load existing notifications from storage
        if (notifications.length === 0 && stored.notifications.length > 0) {
            setNotifications(stored.notifications);
        }

        // First load — just store the count, don't notify
        if (stored.orderCount === -1) {
            setStoredData(user.id, { orderCount: currentCount, notifications: stored.notifications });

            return;
        }

        // New orders detected
        if (currentCount > stored.orderCount) {
            const diff = currentCount - stored.orderCount;
            const newNotification: LocalNotification = {
                id: `notif_${Date.now()}`,
                title: 'New Orders Assigned',
                message: `You have ${diff} new order${diff > 1 ? 's' : ''} assigned to you.`,
                timestamp: Date.now(),
            };

            const updated = [newNotification, ...stored.notifications].slice(0, 20); // keep max 20
            setNotifications(updated);
            setStoredData(user.id, { orderCount: currentCount, notifications: updated });
        } else if (currentCount !== stored.orderCount) {
            // Count decreased (orders completed/removed) — just update count
            setStoredData(user.id, { orderCount: currentCount, notifications: stored.notifications });
        }
    }, [myOrders.length, user, isTechnician]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {document.addEventListener('mousedown', handler);}

        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const dismissNotification = useCallback(
        (id: string) => {
            if (!user) {return;}
            const updated = notifications.filter((n) => n.id !== id);
            setNotifications(updated);
            const stored = getStoredData(user.id);
            setStoredData(user.id, { ...stored, notifications: updated });
        },
        [notifications, user]
    );

    const clearAll = useCallback(() => {
        if (!user) {return;}
        setNotifications([]);
        const stored = getStoredData(user.id);
        setStoredData(user.id, { ...stored, notifications: [] });
    }, [user]);

    const hasNotifications = notifications.length > 0;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className={classnames('cursor-pointer p-2 flex justify-center items-center rounded-lg', {
                    'hover:bg-neutral-700 bg-neutral-600': !hasNotifications,
                    'bg-secondary-500 hover:bg-secondary-600 text-white': hasNotifications,
                })}
            >
                <Visible when={hasNotifications}>
                    <div className="absolute inset-1.5 bg-secondary-500 animate-ping rounded-lg"></div>
                </Visible>
                <div className="z-10">
                    <Visible when={hasNotifications}>
                        <BellPlus />
                    </Visible>
                    <Visible when={!hasNotifications}>
                        <Bell />
                    </Visible>
                </div>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-600 shadow-lg z-50">
                    <div className="flex items-center justify-between border-b border-neutral-800 p-3">
                        <span className="text-sm font-semibold">Notifications</span>
                        {hasNotifications && (
                            <button onClick={clearAll} className="text-xs text-primary-500 hover:underline">
                                Clear all
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-neutral-900">No new notifications</div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-start gap-2 border-b border-neutral-800 p-3"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{notification.title}</p>
                                        <p className="text-xs text-neutral-900 mt-0.5">{notification.message}</p>
                                        <p className="text-xs text-neutral-900 mt-1">
                                            {new Date(notification.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => dismissNotification(notification.id)}
                                        className="shrink-0 p-1 rounded hover:bg-neutral-600/40 text-neutral-900"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
