import type { Actions, Context } from './interface.ts';
import type { PropsWithChildren } from 'react';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useModal } from '@hooks/useModal.ts';

export function createInventoryContext<T>() {
    const InventoryContext = createContext<Context<T>>({
        selected: null,
        isCreateOpen: false,
        isUpdateOpen: false,
    });

    const InventoryActionsContext = createContext<Actions<T>>({
        select: () => {},
        openCreate: () => {},
        closeCreate: () => {},
        openUpdate: () => {},
        closeUpdate: () => {},
    });

    function Provider({ children }: PropsWithChildren) {
        const [selected, setSelected] = useState<T | null>(null);
        const [isCreateOpen, openCreate, closeCreate] = useModal();
        const [isUpdateOpen, openUpdate, closeUpdate] = useModal();

        const select = useCallback(
            (record: T) => {
                setSelected(record);
                openUpdate();
            },
            [openUpdate]
        );

        const handleCloseUpdate = useCallback(() => {
            setSelected(null);
            closeUpdate();
        }, [closeUpdate]);

        const context: Context<T> = useMemo(
            () => ({
                selected,
                isCreateOpen,
                isUpdateOpen,
            }),
            [selected, isCreateOpen, isUpdateOpen]
        );

        const actions: Actions<T> = useMemo(
            () => ({
                select,
                openCreate,
                closeCreate,
                openUpdate,
                closeUpdate: handleCloseUpdate,
            }),
            [select, openCreate, closeCreate, openUpdate, handleCloseUpdate]
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
