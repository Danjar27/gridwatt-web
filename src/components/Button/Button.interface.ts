import type { Icon } from '@phosphor-icons/react';
import type { To } from 'react-router-dom';

export interface ButtonProps {
    /**
     * Instead of providing direct access to the button styles, we use the variant prop to control
     * the button style.
     *
     * @default solid
     */
    variant?: 'outline' | 'solid' | 'ghost';
    as?: 'button' | 'a';
    to?: To;
    icon?: Icon;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
}
