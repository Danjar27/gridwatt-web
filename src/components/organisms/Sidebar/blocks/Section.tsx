import type { SectionProps } from '../Sidebar.interface';
import type { FC, PropsWithChildren } from 'react';

import { Children } from 'react';

const Section: FC<PropsWithChildren<SectionProps>> = ({ title, children }) => (
    <div className="flex flex-col gap-3 px-2.5">
        <span className="font-semibold">{title}</span>
        <ul className="px-2.5">
            {Children.map(children, (child, index) => (
                <li key={index} className="flex">
                    {child}
                </li>
            ))}
        </ul>
    </div>
);

export default Section;
