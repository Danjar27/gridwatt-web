import type { FC } from 'react';

import { LayoutDashboard, ClipboardList, Briefcase, User, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { classnames } from '@utils/classnames.ts';
import { useAuthContext } from '@context/auth/context.ts';

interface MobileNavProps {
    onMenuOpen: () => void;
}

const MobileNav: FC<MobileNavProps> = ({ onMenuOpen }) => {
    const location = useLocation();
    const { user } = useAuthContext();
    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';

    console.log('userRole:', userRole);

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ...(isTechnician
            ? [{ href: '/jobs', icon: Briefcase, label: 'Jobs' }]
            : [{ href: '/orders', icon: ClipboardList, label: 'Orders' }]),
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex s992:hidden bg-neutral-500 border-t border-neutral-800 safe-bottom">
            {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={classnames(
                            'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs',
                            isActive ? 'text-primary-500' : 'text-neutral-900'
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
            <button
                onClick={onMenuOpen}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs text-neutral-900 cursor-pointer"
            >
                <Menu className="h-5 w-5" />
                <span>Menu</span>
            </button>
        </nav>
    );
};

export default MobileNav;
