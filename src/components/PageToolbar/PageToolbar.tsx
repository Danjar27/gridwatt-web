import type { PageToolbarProps } from '@components/PageToolbar/PageToolbar.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';

const PageToolbar: FC<PropsWithChildren<PageToolbarProps>> = ({ children, right, className }) => (
    <div
        className={classnames(
            'flex items-center justify-between gap-3',
            'bg-neutral-600 border border-neutral-700 rounded-xl px-2 py-1.5',
            className
        )}
    >
        <div className="flex items-center">{children}</div>
        {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
);

export default PageToolbar;
