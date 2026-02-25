import type { BackdropProps } from './Backdrop.interface.ts';
import type { FC } from 'react';

import { classnames } from '@utils/classnames.ts';

const Backdrop: FC<BackdropProps> = ({ isEnabled, className, onClick, type = 'dark', boundTo = 'screen' }) => (
    <div
        role="presentation"
        onClick={onClick}
        className={classnames(
            'transition-opacity duration-200 ease-[ease-in-out]',
            'absolute w-full left-0 top-0',
            className,
            {
                'opacity-0': !isEnabled,
                'opacity-100': isEnabled,
                'h-screen': isEnabled && boundTo === 'screen',
                'h-full': isEnabled && boundTo === 'parent',
                'bg-black/40 h-screen': type === 'dark',
                'bg-[#e2e2e2b3] backdrop-blur-lg delay-200': type === 'blur',
            }
        )}
        data-testid="backdrop"
    >
        {type === 'blur' && (
            <div
                className={classnames('transition-transform duration-0 ease-[ease-in-out] w-full', {
                    'scale-y-0 h-0': !isEnabled,
                    'scale-y-100': isEnabled,
                    'h-screen': isEnabled && boundTo === 'screen',
                    'h-full': isEnabled && boundTo === 'parent',
                })}
            ></div>
        )}
    </div>
);

export default Backdrop;
