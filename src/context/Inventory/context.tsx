import type { Actions, Context } from './interface.ts';
import type { PropsWithChildren } from 'react';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useModal } from '@hooks/useModal.ts';

export function createInventoryContext<T>() {
    const InventoryContext = createContext<Context<T>>({
        selected: null,
        isCreateOpen: false,
        isUpdateOpen: false,
        isDeleteOpen: false,
    });

    const InventoryActionsContext = createContext<Actions<T>>({
        select: () => {},
        openCreate: () => {},
        closeCreate: () => {},
        openUpdate: () => {},
        closeUpdate: () => {},
        openDelete: () => {},
        closeDelete: () => {},
    });

    function Provider({ children }: PropsWithChildren) {
        const [selected, setSelected] = useState<T | null>(null);
        const [isCreateOpen, openCreate, closeCreate] = useModal();
        const [isUpdateOpen, openUpdate, closeUpdate] = useModal();
        const [isDeleteOpen, openDelete, closeDelete] = useModal();

        const select = useCallback((record: T) => {
            setSelected(record);
        }, []);

        const handleCloseUpdate = useCallback(() => {
            setSelected(null);
            closeUpdate();
        }, [closeUpdate]);

        const handleCloseDelete = useCallback(() => {
            setSelected(null);
            closeDelete();
        }, [closeDelete]);

        const context: Context<T> = useMemo(
            () => ({
                selected,
                isCreateOpen,
                isUpdateOpen,
                isDeleteOpen,
            }),
            [selected, isCreateOpen, isUpdateOpen, isDeleteOpen]
        );

        const actions: Actions<T> = useMemo(
            () => ({
                select,
                openCreate,
                closeCreate,
                openUpdate,
                closeUpdate: handleCloseUpdate,
                openDelete,
                closeDelete: handleCloseDelete,
            }),
            [select, openCreate, closeCreate, openUpdate, handleCloseUpdate, openDelete, handleCloseDelete]
        );

        return (
            <InventoryContext.Provider value={context}>
                <InventoryActionsContext.Provider value={actions}>{children}</InventoryActionsContext.Provider>
            </InventoryContext.Provider>
        );
    }

    return {
        Provider,
        useContext: () => useContext(InventoryContext),
        useActions: () => useContext(InventoryActionsContext),
    };
}
