import type { PageToolbarProps } from '@components/PageToolbar/PageToolbar.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';

const PageToolbar: FC<PropsWithChildren<PageToolbarProps>> = ({ children, className }) => (
    <div className={classnames('inline-flex items-center gap-1.5', className)}>
        {children}
    </div>
);

export default PageToolbar;
