import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, ClipboardList, Package, Activity, Lock, Users } from 'lucide-react';
import { classnames } from '@utils/classnames.ts';
import { useAuthContext } from '@context/auth/context.ts';

import Logo from '@components/atoms/Logo.tsx';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Orders', href: '/orders', icon: ClipboardList },
    {
        name: 'Materials',
        href: '/materials',
        icon: Package,
        roles: ['admin', 'manager'],
    },
    {
        name: 'Activities',
        href: '/activities',
        icon: Activity,
        roles: ['admin', 'manager'],
    },
    { name: 'Seals', href: '/seals', icon: Lock, roles: ['admin', 'manager'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin', 'manager'] },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { user } = useAuthContext();
    const location = useLocation();
    const userRole = user?.role?.name || user?.roleName;

    const validRoutes = navigation.filter((item) => !item.roles || (userRole && item.roles.includes(userRole)));

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={classnames(
                    'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={classnames(
                    'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-main-400 bg-main-500 text-white transition-transform duration-300 ease-in-out lg:static lg:block lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-16 items-center justify-center gap-2 border-b border-main-400 px-6">
                    <Logo className="h-10 w-10 text-white" />
                    <span className="text-xl font-bold">Grid Watt</span>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                    {validRoutes.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={classnames(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    {
                                        'bg-main-400': isActive,
                                        'hover:bg-main-400/30 hover:text-white': !isActive,
                                    }
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
