import type { WindowProps } from '@components/Modal/Modal.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';
import Visible from '@components/atoms/Visible.tsx';

const Window: FC<PropsWithChildren<WindowProps>> = ({ children, className, icon: Icon, title, hideTitle = false }) => (
    <div
        className={classnames(
            'relative max-w-full max-h-full flex items-center s1600:items-start text-black dark:text-white',
            className
        )}
    >
        <div className="w-full rounded-lg border border-neutral-800 bg-neutral-500 overflow-hidden">
            <Visible when={!hideTitle}>
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-600/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <Icon
                                width={30}
                                height={30}
                                weight="duotone"
                                className="rounded-lg border border-neutral-800 text-neutral-800 p-1"
                            />
                        )}
                        <span className="font-semibold">{title}</span>
                    </div>
                </div>
            </Visible>

            <div className="px-4 py-4 s768:px-6">{children}</div>
        </div>
    </div>
);

export default Window;
