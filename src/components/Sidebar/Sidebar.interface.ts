import type { Role } from '@interfaces/user.interface.ts';
import type { Icon } from '@phosphor-icons/react';

export interface ItemProps {
    className?: string;
    href: string;
    onClick?: () => void;
}

export interface SectionProps {
    title: string;
}

export interface MobileSidebarProps {
    className?: string;
    open: boolean;
    onClose: () => void;
}

export interface DesktopSidebarProps {
    className?: string;
}

export type SidebarProps = MobileSidebarProps & DesktopSidebarProps;

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
