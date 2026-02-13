import type { MobileSidebarProps } from '@components/Sidebar/Sidebar.interface.ts';
import type { FC, PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { classnames } from '@utils/classnames.ts';
import { X } from 'lucide-react';
import User from '@components/Sidebar/blocks/User.tsx';
import Connection from '@components/Toolbar/blocks/Connection.tsx';
import Notifications from '@components/Toolbar/blocks/Notifications.tsx';
import Theme from '@components/Toolbar/blocks/Theme.tsx';
import Logout from '@components/Toolbar/blocks/Logout.tsx';
import { useLocation } from 'react-router-dom';

const MobileSidebar: FC<PropsWithChildren<MobileSidebarProps>> = ({ className, open, onClose, children }) => {
    const location = useLocation();

    useEffect(() => {
        if (open && onClose) {
            onClose();
        }
    }, [location.pathname]);

    return (
        <>
            <div
                className={classnames(
                    'fixed inset-0 z-50 bg-black/50 transition-opacity s992:hidden',
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />
            <div
                className={classnames(
                    'fixed top-0 left-0 z-50 h-full w-72 overflow-y-auto bg-neutral-600 p-4 transition-transform duration-300 s992:hidden',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <aside className={classnames('flex flex-col gap-5 w-full max-w-70 justify-start', className)}>
                    <div className="flex justify-end p-2">
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-600 cursor-pointer">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {children}
                    <div className="hidden s992:flex flex-col w-full bg-neutral-500 rounded-lg p-5 gap-5 border border-neutral-800">
                        <User />
                    </div>

                    <div className="flex bg-neutral-500 rounded-lg justify-center items-center p-5 gap-5 border border-neutral-800">
                        <Connection />
                        <Notifications />
                        <Theme />
                        <Logout />
                    </div>
                </aside>
            </div>
        </>
    );
};

export default MobileSidebar;
