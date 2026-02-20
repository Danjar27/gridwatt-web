import type { Section } from '../Sidebar.interface.ts';

import {
    HouseIcon,
    BagSimpleIcon,
    ClipboardIcon,
    TruckIcon,
    ToolboxIcon,
    StampIcon,
    UsersIcon,
    BuildingOfficeIcon,
} from '@phosphor-icons/react';

export const NAVIGATION_ITEMS: Array<Section> = [
    {
        name: 'general',
        label: 'sidebar.sections.general',
        routes: [
            {
                name: 'dashboard',
                label: 'routes.dashboard',
                href: '/dashboard',
                icon: HouseIcon,
                roles: ['manager'],
            },
            {
                name: 'jobs',
                label: 'routes.jobs',
                href: '/jobs',
                icon: BagSimpleIcon,
                roles: ['technician', 'manager'],
            },
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
                icon: ClipboardIcon,
                roles: ['manager'],
            },
            {
                name: 'orders',
                label: 'routes.orders',
                href: '/orders',
                icon: TruckIcon,
                roles: ['manager'],
            },
            {
                name: 'materials',
                label: 'routes.materials',
                href: '/materials',
                icon: ToolboxIcon,
                roles: ['manager'],
            },
            { name: 'seals', label: 'routes.seals', href: '/seals', icon: StampIcon, roles: ['manager'] },
        ],
    },
    {
        name: 'settings',
        label: 'sidebar.sections.settings',
        routes: [
            {
                name: 'users',
                label: 'routes.users',
                href: '/users',
                icon: UsersIcon,
                roles: ['admin', 'manager'],
            },
            { name: 'tenants', label: 'routes.tenants', href: '/tenants', icon: BuildingOfficeIcon, roles: ['admin'] },
        ],
    },
];
