import type { Section } from './Sidebar.interface.ts';
import type { FC } from 'react';

import { NAVIGATION_ITEMS } from './utils/constants.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';

import SidebarSection from './blocks/Section.tsx';
import Logo from '@components/atoms/Logo.tsx';
import User from './blocks/User.tsx';
import Item from './blocks/Item.tsx';

const Sidebar: FC = () => {
    const i18n = useTranslations();

    const { user } = useAuthContext();

    const userRole = user!.role.name;

    const validSections: Array<Section> = [];

    for (const section of NAVIGATION_ITEMS) {
        const allowedRoutes = section.routes.filter((route) => !route.roles || route.roles.includes(userRole));

        if (allowedRoutes.length > 0) {
            validSections.push({ ...section, routes: allowedRoutes });
        }
    }

    return (
        <aside className="flex flex-col gap-5 min-w-76 justify-start">
            <div className="flex flex-col w-full bg-neutral-500 rounded-[20px] px-5 py-10 gap-6 border border-neutral-800">
                <div className="flex items-center w-full justify-center py-5">
                    <Logo className="h-14 w-14 text-black dark:text-white" />
                    <span className="text-xl font-semibold">{i18n('brand')}</span>
                </div>
                {validSections.map((section) => (
                    <SidebarSection key={section.name} title={i18n(section.label)}>
                        {section.routes.map(({ name, href, icon: Icon, label }) => (
                            <Item key={name} href={href}>
                                <Icon width={20} height={20} />
                                {i18n(label)}
                            </Item>
                        ))}
                    </SidebarSection>
                ))}
            </div>
            <div className="flex flex-col w-full bg-neutral-500 rounded-[20px] p-5 gap-5 border border-neutral-800">
                <User />
            </div>
        </aside>
    );
};

export default Sidebar;
