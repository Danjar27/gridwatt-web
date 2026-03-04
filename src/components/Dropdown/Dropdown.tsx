import type { DropdownProps } from '@components/Dropdown/Dropdown.interface.ts';
import type { FC } from 'react';

import { CaretDownIcon } from '@phosphor-icons/react';
import { classnames } from '@utils/classnames.ts';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const Dropdown: FC<DropdownProps> = ({ value, onChange, options, disabled, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const open = () => {
        if (triggerRef.current) {
            setRect(triggerRef.current.getBoundingClientRect());
        }
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const close = (e: MouseEvent) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node) &&
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        const closeOnScroll = () => setIsOpen(false);

        document.addEventListener('mousedown', close);
        window.addEventListener('scroll', closeOnScroll, true);

        return () => {
            document.removeEventListener('mousedown', close);
            window.removeEventListener('scroll', closeOnScroll, true);
        };
    }, [isOpen]);

    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative w-full">
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => (isOpen ? setIsOpen(false) : open())}
                className={classnames(
                    'w-full flex items-center justify-between gap-2',
                    'rounded-lg border border-neutral-800 bg-neutral-600 px-3 py-2 text-sm transition-colors',
                    'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
                    isOpen && 'border-primary-500',
                    className
                )}
            >
                <span className={classnames(!selected || selected.value === '' ? 'text-neutral-900' : '')}>
                    {selected?.label ?? '\u00A0'}
                </span>
                <CaretDownIcon
                    width={13}
                    height={13}
                    weight="bold"
                    className={classnames(
                        'shrink-0 text-neutral-900 transition-transform duration-150',
                        isOpen && 'rotate-180 text-primary-500'
                    )}
                />
            </button>

            {isOpen &&
                rect &&
                createPortal(
                    <div
                        ref={popoverRef}
                        style={{
                            position: 'fixed',
                            top: rect.bottom + 6,
                            left: rect.left,
                            width: rect.width,
                            zIndex: 9999,
                        }}
                        className="bg-neutral-600 border border-neutral-700 rounded-xl shadow-lg overflow-hidden py-1"
                    >
                        {options.map((option) => (
                            <button
                                key={String(option.value)}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={classnames(
                                    'w-full flex items-center px-3 py-2 text-sm text-left transition-colors cursor-pointer',
                                    'hover:bg-neutral-700',
                                    option.value === value ? 'text-primary-500 font-medium' : 'text-neutral-900'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default Dropdown;
