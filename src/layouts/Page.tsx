import type { FC, PropsWithChildren } from 'react';

import { ArrowLeftIcon } from '@phosphor-icons/react';
import { classnames } from '@utils/classnames.ts';
import { Link } from 'react-router-dom';

import Breadcrumb from '@components/Breadcrumb/Breadcrumb';

interface Props {
    id: string;
    title: string;
    subtitle?: string;
    backRoute?: string;
    className?: string;
}

const Page: FC<PropsWithChildren<Props>> = ({ id, children, title, subtitle, backRoute, className }) => (
    <section id={id} className={classnames('flex flex-col gap-8 s992:gap-10', className)}>
        {/* Page header */}
        <div className="flex flex-col gap-3">
            <Breadcrumb />
            <div className="flex flex-col gap-2">
                {backRoute && (
                    <Link to={backRoute} className="flex items-center gap-1.5 text-sm text-primary-500 w-fit">
                        <ArrowLeftIcon size={14} />
                        Back
                    </Link>
                )}
                <h1 className="text-3xl font-bold capitalize">{title}</h1>
                {subtitle && <p className="text-sm text-neutral-900">{subtitle}</p>}
            </div>
        </div>

        {children}
    </section>
);

export default Page;
