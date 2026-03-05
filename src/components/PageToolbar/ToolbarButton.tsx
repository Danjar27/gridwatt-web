import type { ToolbarButtonProps } from '@components/PageToolbar/ToolbarButton.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';
import { Link } from 'react-router-dom';

const ToolbarButton: FC<PropsWithChildren<ToolbarButtonProps>> = ({
    onClick,
    icon: Icon,
    variant = 'secondary',
    children,
    disabled,
    as = 'button',
    to,
}) => {
    const className = classnames(
        'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors select-none',
        'cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
        {
            'bg-primary-500 hover:bg-primary-600 text-white': variant === 'primary',
            'text-primary-500/80 dark:text-white/80 dark:hover:text-white hover:text-primary-500 hover:bg-neutral-700':
                variant === 'secondary',
        }
    );

    const content = (
        <>
            {Icon && (
                <Icon
                    width={16}
                    height={16}
                    weight={variant === 'primary' ? 'fill' : 'duotone'}
                    className={classnames({
                        'text-white/80': variant === 'primary',
                        'opacity-70': variant === 'secondary',
                    })}
                />
            )}
            {children}
        </>
    );

    if (as === 'a' && to) {
        return (
            <Link to={to} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} disabled={disabled} className={className}>
            {content}
        </button>
    );
};

export default ToolbarButton;
