import type { FC } from 'react';

import Item from '@components/organisms/Sidebar/blocks/Item';
import Logo from '@components/atoms/Logo';
import Section from './blocks/Section';
import { useTranslations } from 'use-intl';

const Sidebar: FC = () => {
    const i18n = useTranslations();

    return (
        <aside className="flex flex-col w-1/4 bg-neutral-500 rounded-[20px] p-5 gap-5">
            <div className="flex items-center w-full justify-center h-25">
                <Logo className="h-14 w-14 text-black" />
                <span className="text-xl font-semibold">Grid Watt</span>
            </div>
            <Section title={i18n('sidebar.sections.general')}>
                <Item href="/dashboard">{i18n('routes.dashboard')}</Item>
            </Section>
            <Section title={i18n('sidebar.sections.catalogs')}>
                <Item href="/activities">{i18n('routes.activities')}</Item>
                <Item href="/orders">{i18n('routes.orders')}</Item>
                <Item href="/materials">{i18n('routes.materials')}</Item>
                <Item href="/seals">{i18n('routes.seals')}</Item>
            </Section>
            <Section title={i18n('sidebar.sections.settings')}>
                <Item href="/users">{i18n('routes.users')}</Item>
            </Section>
        </aside>
    );
};

export default Sidebar;
