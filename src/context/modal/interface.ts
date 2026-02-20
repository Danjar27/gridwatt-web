export interface Context {
    /**
     * Whether the modal is open or not
     */
    isOpen: boolean;
}

export interface Actions {
    /**
     * Opens the modal
     */
    open: () => void;
    /**
     * Closes the modal
     */
    close: () => void;
}
