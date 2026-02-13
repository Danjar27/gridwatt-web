import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: string;
    icon?: LucideIcon;
}
