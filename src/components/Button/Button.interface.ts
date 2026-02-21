import type { Icon } from '@phosphor-icons/react';

export interface ButtonProps {
    /**
     * Instead of providing direct access to the button styles, we use the variant prop to control
     * the button style.
     *
     * @default solid
     */
    variant?: 'outline' | 'solid' | 'ghost';
    icon?: Icon;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
}
