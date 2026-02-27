export type State = 'expanded' | 'collapsed';

export interface Context {
    /**
     * On mobile, the sidebar is closed by default until the user expands it.
     * This property has no effect on desktop, where the sidebar is always open.
     */
    isOpen: boolean;
    /**
     * On desktop, the sidebar is collapsible to make more space for the main content.
     * This property has no effect on mobile, where the sidebar is either open or closed.
     */
    isCollapsed: boolean;
}

export interface Actions {
    open: () => void;
    close: () => void;
    collapse: () => void;
    expand: () => void;
    toggle: () => void;
}
