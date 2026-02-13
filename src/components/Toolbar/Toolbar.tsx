import type { ToolbarProps } from '@components/Toolbar/Toolbar.interface.ts';
import type { FC } from 'react';

import { classnames } from '@utils/classnames.ts';

import Theme from './blocks/Theme.tsx';
import Notifications from './blocks/Notifications.tsx';
import Connection from './blocks/Connection.tsx';
import Search from './blocks/Search.tsx';
import Logout from './blocks/Logout.tsx';

const Toolbar: FC<ToolbarProps> = ({ className }) => (
    <div className={classnames('flex gap-5', className)}>
        <div className="flex bg-neutral-500 rounded-lg justify-center items-center p-5 gap-5 border border-neutral-800">
            <Search />
        </div>

        <div className="flex bg-neutral-500 rounded-lg justify-center items-center p-5 gap-5 border border-neutral-800">
            <Connection />
            <Notifications />
            <Theme />
            <Logout />
        </div>
    </div>
);

export default Toolbar;
