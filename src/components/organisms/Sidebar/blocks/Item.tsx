import type { FC, PropsWithChildren } from 'react';
import type { ItemProps } from '../Sidebar.interface';

import { classnames } from '@utils/classnames';

const Item: FC<PropsWithChildren<ItemProps>> = ({ children, className, href }) => (
    <a className={classnames('hover:bg-neutral-600 px-4 py-2 rounded-20 w-full font-normal', className)} href={href}>
        {children}
    </a>
);

export default Item;
