import type { State } from '@context/sidebar/interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { useLocalStorage } from '@hooks/useLocalStorage.ts';
import { SidebarActions, SidebarContext } from './context';
import { useMemo, useState } from 'react';

const SidebarProvider: FC<PropsWithChildren> = ({ children }) => {
    const [collapsed, setCollapsed] = useLocalStorage<State>('sidebar', 'expanded');
    const [isOpen, setIsOpen] = useState(false);

    const collapse = () => setCollapsed('collapsed');

    const expand = () => setCollapsed('expanded');

    const open = () => setIsOpen(true);

    const close = () => setIsOpen(false);

    const toggle = () => {
        if (collapsed === 'expanded') {
            return collapse();
        }

        expand();
    };

    const context = useMemo(
        () => ({
            isOpen,
            isCollapsed: collapsed === 'collapsed',
        }),
        [collapsed, isOpen]
    );

    const actions = useMemo(
        () => ({
            collapse,
            expand,
            open,
            close,
            toggle,
        }),
        [collapse, expand, open, close, toggle]
    );

    return (
        <SidebarContext.Provider value={context}>
            <SidebarActions.Provider value={actions}>{children}</SidebarActions.Provider>
        </SidebarContext.Provider>
    );
};

export default SidebarProvider;
