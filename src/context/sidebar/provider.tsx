import type { State } from '@context/sidebar/interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { useLocalStorage } from '@hooks/useLocalStorage.ts';
import { SidebarActions, SidebarContext } from './context';
import { useMemo } from 'react';

const SidebarProvider: FC<PropsWithChildren> = ({ children }) => {
    const [collapsed, setCollapsed] = useLocalStorage<State>('sidebar', 'expanded');

    const toggleCollapsed = () => {
        if (collapsed === 'expanded') {
            return setCollapsed('collapsed');
        }

        setCollapsed('expanded');
    };

    const context = useMemo(
        () => ({
            collapsed: collapsed === 'collapsed',
        }),
        [collapsed]
    );

    const actions = useMemo(
        () => ({
            toggleCollapsed,
        }),
        [toggleCollapsed]
    );

    return (
        <SidebarContext.Provider value={context}>
            <SidebarActions.Provider value={actions}>{children}</SidebarActions.Provider>
        </SidebarContext.Provider>
    );
};

export default SidebarProvider;
