import { Bell, BellPlus } from 'lucide-react';
import Visible from '@components/atoms/Visible.tsx';
import { classnames } from '@utils/classnames.ts';

const Notifications = () => {
    const hasNotifications = false;

    return (
        <button
            className={classnames('cursor-pointer p-2 flex justify-center items-center rounded-lg', {
                'hover:bg-neutral-700 bg-neutral-600': !hasNotifications,
                'bg-primary-500 hover:bg-primary-600 text-white': hasNotifications,
            })}
        >
            <Visible when={hasNotifications}>
                <div className="absolute inset-1 bg-primary-500 animate-ping rounded-lg"></div>
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
    );
};

export default Notifications;
