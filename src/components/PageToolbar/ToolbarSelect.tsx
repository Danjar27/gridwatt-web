import type { ToolbarSelectProps } from '@components/PageToolbar/ToolbarSelect.interface.ts';
import { CaretDownIcon } from '@phosphor-icons/react';
import { classnames } from '@utils/classnames.ts';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ToolbarSelect = <T extends string | number | null>({ value, onChange, options }: ToolbarSelectProps<T>) => {
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
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => (isOpen ? setIsOpen(false) : open())}
                className={classnames(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors select-none cursor-pointer',
                    'text-primary-500/80 dark:text-white/80 dark:hover:text-white hover:text-primary-500 hover:bg-neutral-700',
                    isOpen && 'bg-neutral-700 text-primary-500'
                )}
            >
                {selected?.label}
                <CaretDownIcon
                    width={12}
                    height={12}
                    weight="bold"
                    className={classnames('opacity-60 transition-transform duration-150', isOpen && 'rotate-180')}
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
                            minWidth: rect.width,
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
                                    'w-full flex items-center px-3 py-1.5 text-sm text-left whitespace-nowrap transition-colors cursor-pointer',
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

export default ToolbarSelect;
