import type { EscapeProps } from '@components/Modal/Modal.interface.ts';
import type { FC } from 'react';

import { useModalActions } from '@components/Modal/utils/context.ts';
import { classnames } from '@utils/classnames.ts';

export const Escape: FC<EscapeProps> = ({ className, icon: Icon }) => {
    const { close } = useModalActions();

    return (
        <button
            className={classnames(
                className,
                'fill-current w-6 h-6 absolute cursor-pointer z-1000 bg-transparent border-0 left-4 top-4 p-0 flex items-stretch'
            )}
            onClick={close}
        >
            <Icon />
        </button>
    );
};
