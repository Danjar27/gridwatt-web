import type { ButtonProps } from '@components/Button/Button.interface.ts';
import type { FC, PropsWithChildren } from 'react';
import { classnames } from '@utils/classnames.ts';
import { Link } from 'react-router-dom';

const Button: FC<PropsWithChildren<ButtonProps>> = ({
    onClick,
    icon: Icon,
    variant = 'solid',
    children,
    type = 'button',
    disabled,
    as = 'button',
    to,
}) => {
    const commonProps = {
        onClick,
        disabled,
        className: classnames(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium',
            'cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed',
            {
                'bg-primary-500 hover:bg-primary-600 text-white px-4 py-2': variant === 'solid',
                'border border-primary-500 hover:bg-neutral-600 px-4 py-2': variant === 'outline',
                'hover:bg-neutral-600 text-primary-500': variant === 'ghost',
            }
        ),
    };

    const Content = () => (
        <>
            {Icon && (
                <Icon
                    width={20}
                    height={20}
                    weight={variant === 'solid' ? 'fill' : 'duotone'}
                    className={classnames({
                        'text-white/80': variant === 'solid',
                        'text-primary-500': variant === 'outline' || variant === 'ghost',
                    })}
                />
            )}
        </>
    );

    if (as === 'a' && to) {
        return (
            <Link to={to} {...commonProps}>
                <Content />
                {children}
            </Link>
        );
    }

    return (
        <button type={type} {...commonProps}>
            <Content />
            {children}
        </button>
    );
};

export default Button;
