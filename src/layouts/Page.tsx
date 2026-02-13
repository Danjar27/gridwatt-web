import type { FC, PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { usePageTitleActions } from '@context/page-title/context.ts';

interface Props {
    id: string;
    title: string;
    subtitle?: string;
}

const Page: FC<PropsWithChildren<Props>> = ({ id, children, title, subtitle }) => {
    const { setTitle, setSubtitle } = usePageTitleActions();

    useEffect(() => {
        setTitle(title);
        setSubtitle(subtitle ?? '');
    }, [title, subtitle, setTitle, setSubtitle]);

    return (
        <section id={id} className="flex flex-col flex-1 gap-4 s768:gap-6 s992:gap-10">
            <div className="flex flex-col gap-2 s992:hidden">
                <h1 className="text-xl s768:text-2xl font-bold capitalize">{title}</h1>
                <h2 className="text-sm text-neutral-900">{subtitle}</h2>
            </div>
            {children}
        </section>
    );
};

export default Page;
