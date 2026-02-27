import type { ToolbarProps } from '@components/Toolbar/Toolbar.interface.ts';
import type { FC } from 'react';

import { useSidebarContext } from '@context/sidebar/context.ts';
import { classnames } from '@utils/classnames.ts';

import Refresh from '@components/Toolbar/blocks/Refresh';
import Logout from '@components/Toolbar/blocks/Logout';
import Theme from './blocks/Theme';

const Toolbar: FC<ToolbarProps> = ({ className }) => {
    const { isCollapsed } = useSidebarContext();

    return (
        <div className={classnames('flex gap-2', className)}>
            <div
                className={classnames(
                    'flex w-full rounded-lg justify-center items-center gap-2',
                    'flex-row',
                    isCollapsed && 's992:flex-col'
                )}
            >
                <Refresh />
                <Theme />
                <Logout />
            </div>
        </div>
    );
};

export default Toolbar;
