import type { Actions, Context } from './interface.ts';

import { createContext, useContext } from 'react';

export const SidebarContext = createContext<Context>({
    isOpen: false,
    isCollapsed: false,
});

export const SidebarActions = createContext<Actions>({
    open: () => {},
    close: () => {},
    expand: () => {},
    collapse: () => {},
    toggle: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export const useSidebarActions = () => useContext(SidebarActions);
