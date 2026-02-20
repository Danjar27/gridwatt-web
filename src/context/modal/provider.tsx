import type { Actions, Context } from './interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { ModalActions, ModalContext } from '@context/modal/context.ts';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useMemo } from 'react';

const ModalProvider: FC<PropsWithChildren> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);

            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, handleKeyDown]);

    const context: Context = useMemo(
        () => ({
            isOpen: isOpen,
        }),
        [isOpen]
    );

    const actions: Actions = useMemo(
        () => ({
            open: openModal,
            close: closeModal,
        }),
        []
    );

    return (
        <ModalContext value={context}>
            <ModalActions value={actions}>{children}</ModalActions>
        </ModalContext>
    );
};

export default ModalProvider;
