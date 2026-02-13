import type { FC, PropsWithChildren } from 'react';

interface Props {
    id: string;
    title: string;
    subtitle?: string;
}

const Page: FC<PropsWithChildren<Props>> = ({ id, children, title, subtitle }) => (
    <section id={id} className="flex flex-col gap-4 s768:gap-6 s992:gap-10">
        <div className="flex flex-col gap-2">
            <h1 className="text-xl s768:text-2xl s992:text-3xl font-bold capitalize">{title}</h1>
            <h2 className="text-sm text-neutral-900">{subtitle}</h2>
        </div>
        {children}
    </section>
);

export default Page;
