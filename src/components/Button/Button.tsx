import type { ButtonProps } from '@components/Button/Button.interface.ts';
import type { FC, PropsWithChildren } from 'react';
import { classnames } from '@utils/classnames.ts';

const Button: FC<PropsWithChildren<ButtonProps>> = ({
    onClick,
    icon: Icon,
    variant = 'solid',
    children,
    type = 'button',
    disabled,
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={classnames(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90',
            'cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed',
            {
                'bg-primary-500 hover:bg-primary-600 text-white': variant === 'solid',
                'border border-primary-500 hover:bg-neutral-600': variant === 'outline',
            }
        )}
    >
        {Icon && <Icon width={20} height={20} weight="fill" className="text-white/80" />}
        {children}
    </button>
);

export default Button;
