import type { ItemProps } from '../Sidebar.interface.ts';
import type { FC } from 'react';

import { classnames } from '@utils/classnames.ts';
import { Link, useLocation } from 'react-router-dom';
import { useSidebarContext } from '@context/sidebar/context.ts';

const Item: FC<ItemProps> = ({ className, href, onClick, icon, label }) => {
    const { isCollapsed } = useSidebarContext();
    const location = useLocation();
    const isActive = location.pathname.startsWith(href);

    return (
        <Link
            to={href}
            onClick={onClick}
            title={isCollapsed ? label : undefined}
            className={classnames(
                'flex items-center w-full rounded-lg font-normal transition-colors duration-200 p-2.5',
                {
                    'bg-primary-500 text-white': isActive,
                    'text-black dark:text-white hover:bg-neutral-500': !isActive,
                },
                className
            )}
        >
            <span className="shrink-0">{icon}</span>
            <span
                className={classnames(
                    'ml-3 text-sm font-medium whitespace-nowrap overflow-hidden',
                    isCollapsed && 's992:max-w-0 s992:ml-0'
                )}
            >
                {label}
            </span>
        </Link>
    );
};

export default Item;
