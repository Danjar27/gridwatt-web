import type { Icon } from '@phosphor-icons/react';

export interface Context {
    /**
     * Whether the modal is open or not
     */
    isOpen: boolean;
}

export interface Actions {
    /**
     * Opens the modal
     */
    open: () => void;
    /**
     * Closes the modal
     */
    close: () => void;
}

export interface ModalProps {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    className?: string;
}

export interface WindowProps {
    title: string;
    icon?: Icon;
    className?: string;
    hideTitle?: boolean;
    scrollable?: boolean;
}

export interface EscapeProps {
    className?: string;
    theme?: 'light' | 'dark';
    icon: Icon;
    background?: boolean;
}
