export interface Context<T> {
    /**
     * The selected record. Used as default values for the update and delete forms.
     */
    selected: T | null;
    /**
     * Whether the creation modal is currently open.
     */
    isCreateOpen: boolean;
    /**
     * Whether the update modal is currently open.
     */
    isUpdateOpen: boolean;
    /**
     * Whether the delete modal is currently open.
     */
    isDeleteOpen: boolean;
}

export interface Actions<T> {
    /**
     * Selects a record and opens the update modal.
     */
    select: (record: T) => void;
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
     * Closes the update modal and clears the selection.
     */
    closeUpdate: () => void;
    /**
     * Opens the delete modal.
     */
    openDelete: () => void;
    /**
     * Closes the delete modal and clears the selection.
     */
    closeDelete: () => void;
}
