import type { ItemProps } from '../Sidebar.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';
import { Link, useLocation } from 'react-router-dom';

const Item: FC<PropsWithChildren<ItemProps>> = ({ children, className, href, onClick }) => {
    const location = useLocation();

    const isActive = location.pathname.startsWith(href);

    return (
        <Link
            to={href}
            onClick={onClick}
            className={classnames(
                'px-4 py-2 rounded-lg w-full font-normal',
                {
                    'bg-primary-500 text-white': isActive,
                    'hover:bg-neutral-500': !isActive,
                },
                className
            )}
        >
            <div className="flex gap-3">
                <div className="flex gap-3 justify-center items-center">{children}</div>
            </div>
        </Link>
    );
};

export default Item;
