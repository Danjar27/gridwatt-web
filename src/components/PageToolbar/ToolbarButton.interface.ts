import type { Icon } from '@phosphor-icons/react';
import type { To } from 'react-router-dom';

export interface ToolbarButtonProps {
    /**
     * primary – filled with brand color, high visual weight (use once per toolbar for the main CTA)
     * secondary – flat/ghost, low visual weight (use for auxiliary actions)
     */
    variant?: 'primary' | 'secondary';
    icon?: Icon;
    onClick?: () => void;
    disabled?: boolean;
    as?: 'button' | 'a';
    to?: To;
}
