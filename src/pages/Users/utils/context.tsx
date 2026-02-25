import type { PropsWithChildren } from 'react';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useModal } from '@hooks/useModal.ts';
import type {User} from "@interfaces/user.interface.ts";

interface UsersContext {
    selected: User | null;
    isCreateOpen: boolean;
    isUpdateOpen: boolean;
    isDeleteOpen: boolean;
    isPasswordResetOpen: boolean;
    isRoleChangeOpen: boolean;
}

interface UsersActions {
    select: (user: User) => void;
    selectForDelete: (user: User) => void;
    selectForPasswordReset: (user: User) => void;
    selectForRoleChange: (user: User) => void;
    openCreate: () => void;
    closeCreate: () => void;
    openUpdate: () => void;
    closeUpdate: () => void;
    openDelete: () => void;
    closeDelete: () => void;
    openPasswordReset: () => void;
    closePasswordReset: () => void;
    openRoleChange: () => void;
    closeRoleChange: () => void;
}

const UsersContext = createContext<UsersContext>({
    selected: null,
    isCreateOpen: false,
    isUpdateOpen: false,
    isDeleteOpen: false,
    isPasswordResetOpen: false,
    isRoleChangeOpen: false,
});

const UsersActionsContext = createContext<UsersActions>({
    select: () => {},
    selectForDelete: () => {},
    selectForPasswordReset: () => {},
    selectForRoleChange: () => {},
    openCreate: () => {},
    closeCreate: () => {},
    openUpdate: () => {},
    closeUpdate: () => {},
    openDelete: () => {},
    closeDelete: () => {},
    openPasswordReset: () => {},
    closePasswordReset: () => {},
    openRoleChange: () => {},
    closeRoleChange: () => {},
});

function Provider({ children }: PropsWithChildren) {
    const [selected, setSelected] = useState<User | null>(null);
    const [isCreateOpen, openCreate, closeCreate] = useModal();
    const [isUpdateOpen, openUpdate, closeUpdate] = useModal();
    const [isDeleteOpen, openDelete, closeDelete] = useModal();
    const [isPasswordResetOpen, openPasswordReset, closePasswordReset] = useModal();
    const [isRoleChangeOpen, openRoleChange, closeRoleChange] = useModal();

    const clearSelected = useCallback(() => setSelected(null), []);

    const select = useCallback(
        (user: User) => {
            setSelected(user);
            openUpdate();
        },
        [openUpdate]
    );
    const selectForDelete = useCallback(
        (user: User) => {
            setSelected(user);
            openDelete();
        },
        [openDelete]
    );
    const selectForPasswordReset = useCallback(
        (user: User) => {
            setSelected(user);
            openPasswordReset();
        },
        [openPasswordReset]
    );
    const selectForRoleChange = useCallback(
        (user: User) => {
            setSelected(user);
            openRoleChange();
        },
        [openRoleChange]
    );

    const handleCloseUpdate = useCallback(() => {
        clearSelected();
        closeUpdate();
    }, [clearSelected, closeUpdate]);
    const handleCloseDelete = useCallback(() => {
        clearSelected();
        closeDelete();
    }, [clearSelected, closeDelete]);
    const handleClosePasswordReset = useCallback(() => {
        clearSelected();
        closePasswordReset();
    }, [clearSelected, closePasswordReset]);
    const handleCloseRoleChange = useCallback(() => {
        clearSelected();
        closeRoleChange();
    }, [clearSelected, closeRoleChange]);

    const context: UsersContext = useMemo(
        () => ({ selected, isCreateOpen, isUpdateOpen, isDeleteOpen, isPasswordResetOpen, isRoleChangeOpen }),
        [selected, isCreateOpen, isUpdateOpen, isDeleteOpen, isPasswordResetOpen, isRoleChangeOpen]
    );

    const actions: UsersActions = useMemo(
        () => ({
            select,
            selectForDelete,
            selectForPasswordReset,
            selectForRoleChange,
            openCreate,
            closeCreate,
            openUpdate,
            closeUpdate: handleCloseUpdate,
            openDelete,
            closeDelete: handleCloseDelete,
            openPasswordReset,
            closePasswordReset: handleClosePasswordReset,
            openRoleChange,
            closeRoleChange: handleCloseRoleChange,
        }),
        [
            select,
            selectForDelete,
            selectForPasswordReset,
            selectForRoleChange,
            openCreate,
            closeCreate,
            openUpdate,
            handleCloseUpdate,
            openDelete,
            handleCloseDelete,
            openPasswordReset,
            handleClosePasswordReset,
            openRoleChange,
            handleCloseRoleChange,
        ]
    );

    return (
        <UsersContext.Provider value={context}>
            <UsersActionsContext.Provider value={actions}>{children}</UsersActionsContext.Provider>
        </UsersContext.Provider>
    );
}

export { Provider };

export const useUsersContext = () => useContext(UsersContext);
export const useUsersActions = () => useContext(UsersActionsContext);
