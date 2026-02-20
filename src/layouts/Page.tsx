import type { FC, PropsWithChildren } from 'react';
import Connection from '@components/Toolbar/blocks/Connection.tsx';

interface Props {
    id: string;
    title: string;
    subtitle?: string;
}

const Page: FC<PropsWithChildren<Props>> = ({ id, children, title, subtitle }) => (
    <section id={id} className="relative flex flex-col gap-10">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold capitalize">{title}</h1>
            <h2 className="text-sm text-neutral-900">{subtitle}</h2>
        </div>
        <div className=" hidden s992:flex rounded p-1 px-2 absolute top-0 right-0">
            <Connection />
        </div>
        {children}
    </section>
);

export default Page;
