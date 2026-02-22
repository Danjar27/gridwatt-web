import type { SidebarProps } from './Sidebar.interface.ts';
import type { FC } from 'react';

import { getAvailableRoutesByRole } from '@components/Sidebar/utils/data.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { classnames } from '@utils/classnames.ts';
import { useTranslations } from 'use-intl';

import Surface from '@components/Sidebar/blocks/Surface';
import User from '@components/Sidebar/blocks/User';
import Toolbar from '@components/Toolbar/Toolbar';
import SidebarSection from './blocks/Section';
import Logo from '@components/atoms/Logo';
import Item from './blocks/Item';

const Sidebar: FC<SidebarProps> = ({ open, onClose }) => {
    const i18n = useTranslations();

    const { user } = useAuthContext();

    if (!user) {
        return null;
    }

    const sections = getAvailableRoutesByRole(user.role?.name);

    return (
        <>
            <Surface open={open} onClose={onClose} />
            <aside
                className={classnames(
                    'flex flex-col justify-between',
                    's992:static s992:translate-x-0 s992:rounded-lg',
                    'fixed top-0 left-0 z-50 h-full w-64 bg-neutral-600 px-2 py-5 transition-transform duration-200',
                    {
                        'translate-x-0': open,
                        '-translate-x-full': !open,
                    }
                )}
            >
                <div>
                    <div className="flex flex-col w-full rounded-lg p-5 gap-5">
                        <div className="flex items-center justify-center">
                            <Logo className="h-14 w-14 text-black dark:text-white" />
                            <span className="text-xl font-semibold">{i18n('brand')}</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full rounded-lg px-2 py-6 gap-4">
                        {sections.map((section) => (
                            <SidebarSection key={section.name} title={i18n(section.label)}>
                                {section.routes.map(({ name, href, icon: Icon, label }) => (
                                    <Item key={name} href={href} onClick={onClose}>
                                        <Icon width={20} height={20} weight="duotone" />
                                        {i18n(label)}
                                    </Item>
                                ))}
                            </SidebarSection>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <Toolbar />
                    <User />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
