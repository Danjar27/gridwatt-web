import type { Icon } from '@phosphor-icons/react';

export interface SummaryProps {
    title: string;
    subtitle?: string;
    icon?: Icon;
    legend?: string;
    className?: string;
}
