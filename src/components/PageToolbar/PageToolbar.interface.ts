import type { ReactNode } from 'react';

export interface PageToolbarProps {
    /** Content rendered in the right slot (selects, filters, etc.) */
    right?: ReactNode;
    className?: string;
}
