import type { Actions, Context, ModalProps } from './Modal.interface';
import type { FC, PropsWithChildren } from 'react';

import { useCallback, useEffect, useMemo } from 'react';
import { ModalActions, ModalContext } from '@components/Modal/utils/context.ts';
import { classnames } from '@utils/classnames.ts';

import Backdrop from '@components/Backdrop/Backdrop.tsx';
import Visible from '@components/atoms/Visible.tsx';
import Portal from '@components/atoms/Portal.tsx';

const Modal: FC<PropsWithChildren<ModalProps>> = ({ children, className, isOpen, onClose, onOpen }) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);

            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [onOpen, handleKeyDown]);

    const context: Context = useMemo(
        () => ({
            isOpen: isOpen,
        }),
        [isOpen]
    );

    const actions: Actions = useMemo(
        () => ({
            open: onOpen,
            close: onClose,
        }),
        [onOpen, onClose]
    );

    return (
        <ModalContext.Provider value={context}>
            <ModalActions.Provider value={actions}>
                <Visible when={isOpen}>
                    <Portal>
                        <div
                            className={classnames(
                                className,
                                'fixed flex items-center justify-center z-5000 inset-0',
                                'transition-opacity linear duration-150'
                            )}
                            role="dialog"
                            aria-modal="true"
                            data-testid="modal-base"
                        >
                            <Backdrop isEnabled={isOpen} onClick={onClose} />
                            {children}
                        </div>
                    </Portal>
                </Visible>
            </ModalActions.Provider>
        </ModalContext.Provider>
    );
};

export default Modal;
