import type { DesktopSidebarProps } from '@components/Sidebar/Sidebar.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';

import User from '@components/Sidebar/blocks/User.tsx';

const DesktopSidebar: FC<PropsWithChildren<DesktopSidebarProps>> = ({ children, className }) => (
    <aside className={classnames('flex flex-col gap-5 w-full max-w-70 justify-start', className)}>
        {children}
        <div className="hidden s992:flex flex-col w-full bg-neutral-500 rounded-lg p-5 gap-5 border border-neutral-800">
            <User />
        </div>
    </aside>
);

export default DesktopSidebar;
