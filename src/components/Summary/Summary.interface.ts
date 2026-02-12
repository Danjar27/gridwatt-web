import type { LucideIcon } from 'lucide-react';

export interface SummaryProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    legend?: string;
    className?: string;
}
