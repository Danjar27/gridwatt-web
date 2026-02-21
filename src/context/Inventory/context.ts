import type { Actions, Context } from './interface.ts';

import { createContext, useContext } from 'react';

export const InventoryContext = createContext<Context>({
    selected: null,
    isCreateOpen: false,
    isUpdateOpen: false,
    pendingMutations: [],
});

export const InventoryActions = createContext<Actions>({
    select: () => {},
    deselect: () => {},
    openCreate: () => {},
    closeCreate: () => {},
    openUpdate: () => {},
    closeUpdate: () => {},
});

export const useInventoryContext = () => useContext(InventoryContext);

export const useInventoryActions = () => useContext(InventoryActions);
