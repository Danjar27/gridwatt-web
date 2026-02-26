import type { SidebarProps } from './Sidebar.interface.ts';
import type { FC } from 'react';

import { getAvailableRoutesByRole } from '@components/Sidebar/utils/data.ts';
import { useSidebarActions, useSidebarContext } from '@context/sidebar/context';
import { useAuthContext } from '@context/auth/context.ts';
import { classnames } from '@utils/classnames.ts';
import { useTranslations } from 'use-intl';

import Surface from '@components/Sidebar/blocks/Surface';
import User from '@components/Sidebar/blocks/User';
import SidebarSection from './blocks/Section';
import Logo from '@components/atoms/Logo';
import Item from './blocks/Item';

const Sidebar: FC<SidebarProps> = ({ className }) => {
    const i18n = useTranslations();

    const { isCollapsed, isOpen } = useSidebarContext();
    const { close } = useSidebarActions();
    const { user } = useAuthContext();

    if (!user) {
        return null;
    }

    const sections = getAvailableRoutesByRole(user.role?.name);

    return (
        <>
            <Surface open={isOpen} onClose={close} />
            <aside
                className={classnames(
                    'flex shrink-0 flex-col justify-between overflow-hidden',
                    'fixed top-0 left-0 z-50 h-full bg-neutral-600 w-64 py-4',
                    'transition-[transform,width] duration-200 ease-in-out',
                    's992:static s992:translate-x-0 s992:rounded-lg',
                    {
                        'translate-x-0': isOpen,
                        '-translate-x-full': !isOpen,
                        's992:w-54': !isCollapsed,
                        's992:w-14': isCollapsed,
                    },
                    className
                )}
            >
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-3 pb-2">
                        <Logo className="h-7 w-7 shrink-0 text-black dark:text-white" />
                        <span
                            className={classnames(
                                'text-base font-semibold whitespace-nowrap overflow-hidden',
                                isCollapsed && 's992:max-w-0'
                            )}
                        >
                            {i18n('brand')}
                        </span>
                    </div>

                    <nav className="flex flex-col gap-3 px-2">
                        {sections.map((section) => (
                            <SidebarSection key={section.name} title={i18n(section.label)} collapsed={isCollapsed}>
                                {section.routes.map(({ name, href, icon: Icon, label }) => (
                                    <Item
                                        key={name}
                                        href={href}
                                        onClick={close}
                                        icon={<Icon width={20} height={20} weight="duotone" />}
                                        label={i18n(label)}
                                    />
                                ))}
                            </SidebarSection>
                        ))}
                    </nav>
                </div>

                <User />
            </aside>
        </>
    );
};

export default Sidebar;
