import type { ToolbarProps } from '@components/Toolbar/Toolbar.interface.ts';
import type { FC } from 'react';

import { classnames } from '@utils/classnames.ts';

import Theme from './blocks/Theme.tsx';
import Logout from '@components/Toolbar/blocks/Logout.tsx';

const Toolbar: FC<ToolbarProps> = ({ className }) => (
    <div className={classnames('flex gap-2', className)}>
        <div className="flex w-full rounded-lg justify-center items-center gap-3">
            <Theme />
            <Logout />
        </div>
    </div>
);

export default Toolbar;
