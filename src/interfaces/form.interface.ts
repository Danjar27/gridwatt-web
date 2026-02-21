export interface MutationForm {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    onSubmit: () => void;
    onCancel: () => void;
}
