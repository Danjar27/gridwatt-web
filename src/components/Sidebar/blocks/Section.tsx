import type { SectionProps } from '../Sidebar.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { Children } from 'react';

const Section: FC<PropsWithChildren<SectionProps>> = ({ title, children }) => (
    <div className="flex flex-col gap-3">
        <span className="font-semibold uppercase text-xs text-neutral-800">{title}</span>
        <ul>
            {Children.map(children, (child, index) => (
                <li key={index} className="flex">
                    {child}
                </li>
            ))}
        </ul>
    </div>
);

export default Section;
