import type { FC, PropsWithChildren } from 'react';
import type { BreadcrumbItem } from '@components/Breadcrumb/Breadcrumb.interface';

import { classnames } from '@utils/classnames.ts';

import Breadcrumb from '@components/Breadcrumb/Breadcrumb';

interface Props {
    id: string;
    breadcrumbs: Array<BreadcrumbItem>;
    className?: string;
}

const Page: FC<PropsWithChildren<Props>> = ({ id, children, breadcrumbs, className }) => (
    <section id={id} className={classnames('flex flex-col gap-6', className)}>
        <div className="flex flex-col gap-2">
            <Breadcrumb items={breadcrumbs} />
        </div>

        {children}
    </section>
);

export default Page;
