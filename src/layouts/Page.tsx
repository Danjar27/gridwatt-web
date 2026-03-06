import type { FC, PropsWithChildren } from 'react';

import { classnames } from '@utils/classnames.ts';

import Breadcrumb from '@components/Breadcrumb/Breadcrumb';

interface Props {
    id: string;
    title: string;
    className?: string;
}

const Page: FC<PropsWithChildren<Props>> = ({ id, children, title, className }) => (
    <section id={id} className={classnames('flex flex-col gap-6 s992:gap-8', className)}>
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <Breadcrumb />
            </div>
            <h1 className="text-xl font-semibold s992:hidden">{title}</h1>
        </div>

        {children}
    </section>
);

export default Page;
