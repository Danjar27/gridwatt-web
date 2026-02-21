import type { Actions, Context, InventoryProviderProps } from './interface.ts';
import type { OfflineMutation } from '@lib/offline-store.ts';
import type { FC, PropsWithChildren } from 'react';

import { getPendingMutationsByType } from '@lib/offline-store.ts';
import { InventoryContext, InventoryActions } from './context.ts';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useModal } from '@hooks/useModal.ts';

const InventoryProvider: FC<PropsWithChildren<InventoryProviderProps>> = ({ type, children }) => {
    const [selected, setSelected] = useState<string | number | null>(null);
    const [isCreateOpen, openCreate, closeCreate] = useModal();
    const [isUpdateOpen, openUpdate, closeUpdate] = useModal();
    const [pendingMutations, setPendingMutations] = useState<Array<OfflineMutation>>([]);

    // useEffect(() => {
    //     const fetchPending = async () => {
    //         const pending = await getPendingMutationsByType(type);
    //         setPendingMutations(pending);
    //     };
    //
    //     fetchPending();
    //     const interval = setInterval(fetchPending, 2000);
    //
    //     return () => clearInterval(interval);
    // }, [type]);

    const select = useCallback((id: string | number) => {
        setSelected(id);
        openUpdate();
    }, []);

    const deselect = useCallback(() => {
        setSelected(null);
        closeUpdate();
    }, []);

    const context: Context = useMemo(
        () => ({
            selected,
            isCreateOpen,
            isUpdateOpen,
            pendingMutations,
        }),
        [selected, isCreateOpen, isUpdateOpen, pendingMutations]
    );

    const actions: Actions = useMemo(
        () => ({
            select,
            deselect,
            openCreate,
            closeCreate,
            openUpdate,
            closeUpdate,
        }),
        [select, deselect, openCreate, closeCreate]
    );

    return (
        <InventoryContext.Provider value={context}>
            <InventoryActions.Provider value={actions}>{children}</InventoryActions.Provider>
        </InventoryContext.Provider>
    );
};

export default InventoryProvider;
