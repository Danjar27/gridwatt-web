import type { Role } from '@interfaces/user.interface.ts';
import type { LucideIcon } from 'lucide-react';

export interface ItemProps {
    className?: string;
    href: string;
}

export interface SectionProps {
    title: string;
}

interface Route {
    name: string;
    href: string;
    label: string;
    icon: LucideIcon;
    roles?: Array<Role>;
}

export interface Section {
    name: string;
    label: string;
    routes: Array<Route>;
}
