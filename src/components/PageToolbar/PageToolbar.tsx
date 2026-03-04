import type { PageToolbarProps } from '@components/PageToolbar/PageToolbar.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';

const PageToolbar: FC<PropsWithChildren<PageToolbarProps>> = ({ children, className }) => (
    <div
        className={classnames(
            'inline-flex items-center gap-2 p-1',
            'bg-neutral-600 border border-neutral-700 rounded-xl',
            className
        )}
    >
        {children}
    </div>
);

export default PageToolbar;
