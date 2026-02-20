import type { FC } from 'react';

import { classnames } from '@utils/classnames.ts';

interface SurfaceProps {
    open: boolean;
    onClose: () => void;
}

const Surface: FC<SurfaceProps> = ({ onClose, open }) => (
    <div
        className={classnames(
            'fixed inset-0 z-50 bg-black/50 transition-all duration-200 ease-in-out',
            's992:opacity-0 s992:pointer-events-none',
            {
                'opacity-100': open,
                'opacity-0 pointer-events-none': !open,
            }
        )}
        onClick={onClose}
    ></div>
);

export default Surface;
