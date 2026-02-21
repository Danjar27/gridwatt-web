import type { OfflineMutation } from '@lib/offline-store.ts';

export interface Context {
    /**
     * The selected inventory item ID. Used to target mutations (e.g. update, delete).
     */
    selected: string | number | null;
    /**
     * Whether the creation modal is currently open.
     */
    isCreateOpen: boolean;
    /**
     * Whether the update modal is currently open.
     */
    isUpdateOpen: boolean;
    /**
     * Offline mutations pending sync for this inventory entity type.
     */
    pendingMutations: Array<OfflineMutation>;
}

export interface Actions {
    /**
     * Selects an inventory item by its ID and opens the update modal.
     */
    select: (id?: string | number) => void;
    /**
     * Clears the current selection and closes the update modal.
     */
    deselect: () => void;
    /**
     * Opens the creation modal.
     */
    openCreate: () => void;
    /**
     * Closes the creation modal.
     */
    closeCreate: () => void;
    /**
     * Opens the update modal.
     */
    openUpdate: () => void;
    /**
     * Closes the update modal.
     */
    closeUpdate: () => void;
}

export interface InventoryProviderProps {
    /**
     * The entity type used to filter pending offline mutations (e.g. 'activity', 'material').
     */
    type: string;
}
