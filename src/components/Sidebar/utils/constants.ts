import type { Section } from '../Sidebar.interface.ts';

import { Clipboard, LayoutDashboard, Package, Users, Briefcase, BookA, Tag, Building2 } from 'lucide-react';

export const NAVIGATION_ITEMS: Array<Section> = [
    {
        name: 'general',
        label: 'sidebar.sections.general',
        routes: [
            { name: 'dashboard', label: 'routes.dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'jobs', label: 'routes.jobs', href: '/jobs', icon: Briefcase, roles: ['technician'] },
        ],
    },
    {
        name: 'catalogs',
        label: 'sidebar.sections.catalogs',
        routes: [
            {
                name: 'activities',
                label: 'routes.activities',
                href: '/activities',
                icon: Clipboard,
                roles: ['admin', 'manager'],
            },
            {
                name: 'orders',
                label: 'routes.orders',
                href: '/orders',
                icon: BookA,
                roles: ['admin', 'manager'],
            },
            {
                name: 'materials',
                label: 'routes.materials',
                href: '/materials',
                icon: Package,
                roles: ['admin', 'manager'],
            },
            { name: 'seals', label: 'routes.seals', href: '/seals', icon: Tag, roles: ['admin', 'manager'] },
        ],
    },
    {
        name: 'settings',
        label: 'sidebar.sections.settings',
        routes: [
            { name: 'users', label: 'routes.users', href: '/users', icon: Users, roles: ['admin'] },
            { name: 'tenants', label: 'routes.tenants', href: '/tenants', icon: Building2, roles: ['admin'] },
        ],
    },
];
