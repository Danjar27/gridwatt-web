import type { ToolbarProps } from '@components/Toolbar/Toolbar.interface.ts';
import type { FC } from 'react';

import { classnames } from '@utils/classnames.ts';

import Theme from './blocks/Theme';
import Logout from '@components/Toolbar/blocks/Logout';
import Refresh from '@components/Toolbar/blocks/Refresh';

const Toolbar: FC<ToolbarProps> = ({ className }) => (
    <div className={classnames('flex gap-2', className)}>
        <div className="flex w-full rounded-lg justify-center items-center gap-3">
            <Refresh />
            <Theme />
            <Logout />
        </div>
    </div>
);

export default Toolbar;
