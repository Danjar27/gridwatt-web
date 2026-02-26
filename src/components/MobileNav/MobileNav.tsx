import type { FC } from 'react';
import type { Icon } from '@phosphor-icons/react';

import { HouseIcon, TruckIcon, BagSimpleIcon, AddressBookIcon, UsersIcon, UserIcon } from '@phosphor-icons/react';
import { useSidebarActions } from '@context/sidebar/context.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { Link, useLocation } from 'react-router-dom';
import { classnames } from '@utils/classnames.ts';
import { useTranslations } from 'use-intl';
import { Menu } from 'lucide-react';

interface NavItem {
    href: string;
    icon: Icon;
    label: string;
}

const PINNED_BY_ROLE: Record<string, Array<NavItem>> = {
    admin: [
        { href: '/tenants', icon: AddressBookIcon, label: 'routes.tenants' },
        { href: '/users', icon: UsersIcon, label: 'routes.users' },
    ],
    manager: [
        { href: '/dashboard', icon: HouseIcon, label: 'routes.dashboard' },
        { href: '/orders', icon: TruckIcon, label: 'routes.orders' },
    ],
    technician: [
        { href: '/jobs', icon: BagSimpleIcon, label: 'routes.jobs' },
        { href: '/profile', icon: UserIcon, label: 'routes.profile' },
    ],
};

const MobileNav: FC = () => {
    const i18n = useTranslations();
    const location = useLocation();
    const { open } = useSidebarActions();

    const { user } = useAuthContext();

    if (!user) {
        return null;
    }

    const items = PINNED_BY_ROLE[user.role?.name] ?? [];

    return (
        <nav className="shrink-0 flex flex-col s992:hidden bg-neutral-500 border-t border-neutral-800 h-16.25">
            <div className="flex">
                {items.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={classnames(
                                'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs',
                                {
                                    'text-primary-500': isActive,
                                    'text-neutral-900/50': !isActive,
                                }
                            )}
                        >
                            <Icon width={20} height={20} weight="duotone" />
                            <span>{i18n(item.label)}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={open}
                    className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs text-neutral-900 cursor-pointer"
                >
                    <Menu className="h-5 w-5" />
                    <span>{i18n('sidebar.menu')}</span>
                </button>
            </div>
            <div className="safe-bottom" />
        </nav>
    );
};

export default MobileNav;
