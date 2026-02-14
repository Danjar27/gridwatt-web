import type { ToolbarProps } from '@components/Toolbar/Toolbar.interface.ts';
import type { FC } from 'react';

import { classnames } from '@utils/classnames.ts';

import Theme from './blocks/Theme.tsx';
import Connection from './blocks/Connection.tsx';
import Logout from './blocks/Logout.tsx';

const Toolbar: FC<ToolbarProps> = ({ className }) => (
    <div className={classnames('flex gap-5', className)}>
        <div className="flex bg-neutral-500 w-full rounded-lg justify-center items-center p-5 gap-5 border border-neutral-800">
            <Connection />
            <Theme />
            <Logout />
        </div>
    </div>
);

export default Toolbar;
