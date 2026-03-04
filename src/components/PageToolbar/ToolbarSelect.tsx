import type { ToolbarSelectProps } from '@components/PageToolbar/ToolbarSelect.interface.ts';
import { CaretDownIcon } from '@phosphor-icons/react';
import { classnames } from '@utils/classnames.ts';
import { useEffect, useRef, useState } from 'react';

const ToolbarSelect = <T extends string | number | null>({ value, onChange, options }: ToolbarSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', onMouseDown);

        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
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

            {isOpen && (
                <div className="absolute top-full left-0 mt-1.5 min-w-full z-50 bg-neutral-600 border border-neutral-700 rounded-xl shadow-lg overflow-hidden py-1">
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
                </div>
            )}
        </div>
    );
};

export default ToolbarSelect;
