import { useSidebarActions, useSidebarContext } from '@context/sidebar/context.ts';
import { SidebarSimpleIcon } from '@phosphor-icons/react';

import Connection from '@components/Toolbar/blocks/Connection.tsx';
import Refresh from '@components/Toolbar/blocks/Refresh.tsx';
import Logout from '@components/Toolbar/blocks/Logout.tsx';
import Theme from '@components/Toolbar/blocks/Theme.tsx';

const Topbar = () => {
    const { isCollapsed } = useSidebarContext();
    const { toggle } = useSidebarActions();

    return (
        <div className="hidden s992:flex items-center justify-between gap-3 rounded-lg">
            <div className="flex items-center border border-neutral-800 rounded-lg">
                <button
                    onClick={toggle}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="cursor-pointer flex shrink-0 items-center justify-center p-2.5 rounded-lg text-neutral-900 hover:bg-neutral-500 hover:text-black dark:hover:text-white transition-colors duration-200"
                >
                    <SidebarSimpleIcon weight="duotone" size={20} />
                </button>
            </div>

            <Connection />

            <div className="flex items-center ml-auto border border-neutral-800 rounded-lg gap-1">
                <Refresh />
                <Theme />
                <Logout />
            </div>
        </div>
    );
};

export default Topbar;
