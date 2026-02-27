import type { SectionProps } from '../Sidebar.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { useSidebarContext } from '@context/sidebar/context.ts';
import { classnames } from '@utils/classnames.ts';
import { Children } from 'react';

const Section: FC<PropsWithChildren<SectionProps>> = ({ title, children }) => {
    const { isCollapsed } = useSidebarContext();

    return (
        <div className="flex flex-col gap-1">
            <div className="h-6 flex items-center relative">
                <div
                    className={classnames(
                        'opacity-0 absolute inset-x-2 top-1/2 -translate-y-1/2 h-px bg-neutral-800 duration-200',
                        {
                            's992:opacity-100': isCollapsed,
                        }
                    )}
                />
                <span
                    className={classnames('relative px-2.5 text-xs font-semibold text-neutral-800 whitespace-nowrap', {
                        's992:opacity-0': isCollapsed,
                    })}
                >
                    {title}
                </span>
            </div>
            <ul className="flex flex-col gap-0.5">
                {Children.map(children, (child, index) => (
                    <li key={index}>{child}</li>
                ))}
            </ul>
        </div>
    );
};

export default Section;
