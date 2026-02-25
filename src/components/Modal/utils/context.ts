import type { Context, Actions } from '../Modal.interface.ts';

import { createContext, useContext } from 'react';

export const ModalContext = createContext<Context>({
    isOpen: false,
});

export const ModalActions = createContext<Actions>({
    open: () => {},
    close: () => {},
});

export const useModalContext = () => useContext(ModalContext);

export const useModalActions = () => useContext(ModalActions);
