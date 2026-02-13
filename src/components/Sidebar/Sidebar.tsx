import type { Section, SidebarProps } from './Sidebar.interface.ts';
import type { FC } from 'react';

import { NAVIGATION_ITEMS } from './utils/constants.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';

import SidebarSection from './blocks/Section.tsx';
import Logo from '@components/atoms/Logo.tsx';
import Item from './blocks/Item.tsx';
import DesktopSidebar from '@components/Sidebar/blocks/Desktop.tsx';
import MobileSidebar from '@components/Sidebar/blocks/Mobile.tsx';

const Sidebar: FC<SidebarProps> = ({ open, onClose }) => {
    const i18n = useTranslations();

    const { user } = useAuthContext();

    if (!user) {
        return null;
    }

    const userRole = user.role?.name;

    const validSections: Array<Section> = [];

    for (const section of NAVIGATION_ITEMS) {
        const allowedRoutes = section.routes.filter((route) => !route.roles || route.roles.includes(userRole));

        if (allowedRoutes.length > 0) {
            validSections.push({ ...section, routes: allowedRoutes });
        }
    }

    const SideBarContent = () => (
        <>
            <div className="hidden s992:flex flex-col w-full bg-neutral-500 rounded-lg p-5 gap-5 border border-neutral-800">
                <div className="flex items-center w-full justify-center py-5">
                    <Logo className="h-14 w-14 text-black dark:text-white" />
                    <span className="text-xl font-semibold">{i18n('brand')}</span>
                </div>
            </div>
            <div className="flex flex-col w-full bg-neutral-500 rounded-lg px-5 py-10 gap-6 border border-neutral-800">
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
        </>
    );

    return (
        <>
            <MobileSidebar className="flex s992:hidden" open={open} onClose={onClose}>
                <SideBarContent />
            </MobileSidebar>
            <DesktopSidebar className="hidden s992:flex">
                <SideBarContent />
            </DesktopSidebar>
        </>
    );
};

export default Sidebar;
