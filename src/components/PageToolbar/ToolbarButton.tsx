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
        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors select-none',
        'cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
        {
            'bg-primary-500 hover:bg-primary-600 text-white': variant === 'primary',
            'border border-neutral-800 dark:border-neutral-700 text-primary-500 dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-700':
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
