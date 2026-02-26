import type { Role } from '@interfaces/user.interface.ts';
import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

export interface ItemProps {
    className?: string;
    href: string;
    onClick?: () => void;
    icon: ReactNode;
    label: string;
}

export interface SectionProps {
    title: string;
    collapsed?: boolean;
}

export interface SidebarProps {
    className?: string;
}

interface Route {
    name: string;
    href: string;
    label: string;
    icon: Icon;
    roles?: Array<Role>;
}

export interface Section {
    name: string;
    label: string;
    routes: Array<Route>;
}
