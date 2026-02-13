import { type FC, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from './Modal.interface';

const Modal: FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 'max-w-lg', icon: Icon }) => {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={`w-full ${maxWidth} rounded-lg border border-neutral-800 bg-neutral-500 overflow-hidden`}>
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-600/60 px-4 py-3">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <Icon
                                width={32}
                                height={32}
                                className="rounded-lg border border-neutral-800 text-neutral-800 p-1"
                            />
                        )}
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                    <button onClick={onClose} type="button">
                        <X className="h-5 w-5 text-neutral-900" />
                    </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-4 py-4 s768:px-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
