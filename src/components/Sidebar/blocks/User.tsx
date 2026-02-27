import type { FC } from 'react';

import { useSidebarContext } from '@context/sidebar/context.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { buildUserInitials } from '../utils/format.ts';
import { classnames } from '@utils/classnames.ts';
import { Link } from 'react-router-dom';

const User: FC = () => {
    const { isCollapsed } = useSidebarContext();
    const { user } = useAuthContext();

    if (!user) {
        return null;
    }

    const fullName = `${user?.name} ${user?.lastName}`;
    const initials = buildUserInitials(fullName);

    return (
        <Link
            to="/profile"
            title={isCollapsed ? fullName : undefined}
            className="flex items-center w-full rounded-lg px-2 py-2 hover:bg-neutral-500 transition-colors duration-200"
        >
            <div className="flex shrink-0 items-center justify-center h-8 w-8 rounded-md bg-primary-500">
                <span className="text-xs font-bold text-white uppercase">{initials}</span>
            </div>
            <div
                className={classnames(
                    'ml-3 flex flex-col gap-0.5 min-w-0 overflow-hidden',
                    isCollapsed && 's992:max-w-0 s992:ml-0'
                )}
            >
                <span className="text-sm font-medium whitespace-nowrap">{fullName}</span>
                <span className="w-fit px-1.5 py-0.5 text-xs bg-neutral-700 text-neutral-900 rounded whitespace-nowrap">
                    {user.role?.name}
                </span>
            </div>
        </Link>
    );
};

export default User;
