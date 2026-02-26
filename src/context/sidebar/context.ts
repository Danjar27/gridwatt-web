import type { Actions, Context } from './interface.ts';

import { createContext, useContext } from 'react';

export const SidebarContext = createContext<Context>({
    collapsed: false,
});

export const SidebarActions = createContext<Actions>({
    toggleCollapsed: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export const useSidebarActions = () => useContext(SidebarActions);
