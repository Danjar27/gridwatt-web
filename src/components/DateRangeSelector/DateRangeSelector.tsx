import type { FC } from 'react';
import type { DateRange } from 'react-day-picker';
import type { DateRangeSelectorProps } from './DateRangeSelector.interface';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarBlank, X, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { classnames } from '@utils/classnames';

const formatDateRange = (range: DateRange | undefined): string => {
    if (!range?.from) {
        return '';
    }

    const fromStr = format(range.from, 'd MMM yyyy', { locale: es });

    if (!range.to) {
        return fromStr;
    }

    const toStr = format(range.to, 'd MMM yyyy', { locale: es });

    return `${fromStr} - ${toStr}`;
};

const DateRangeSelector: FC<DateRangeSelectorProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Seleccionar rango de fechas',
    disabled = false,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [month, setMonth] = useState<Date>(value?.from ?? new Date());

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const open = useCallback(() => {
        if (triggerRef.current) {
            setRect(triggerRef.current.getBoundingClientRect());
        }
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleClear = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            onChange(undefined);
        },
        [onChange]
    );

    const handleSelect = useCallback(
        (range: DateRange | undefined) => {
            onChange(range);

            // Only close when both dates are selected (complete range)
            if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
                setTimeout(close, 200);
            }
        },
        [onChange, close]
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                triggerRef.current &&
                !triggerRef.current.contains(target) &&
                popoverRef.current &&
                !popoverRef.current.contains(target)
            ) {
                close();
            }
        };

        const handleScroll = () => close();
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen, close]);

    const displayValue = formatDateRange(value);
    const hasValue = Boolean(value?.from);

    return (
        <div className={classnames('relative', className)}>
            {label && <label className="block text-xs font-medium text-neutral-900 mb-1.5">{label}</label>}

            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => (isOpen ? close() : open())}
                className={classnames(
                    'w-full flex items-center gap-2',
                    'rounded-lg border border-neutral-800 bg-neutral-600 px-3 py-2 text-sm transition-colors',
                    'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
                    'hover:border-neutral-700',
                    isOpen && 'border-primary-500'
                )}
            >
                <CalendarBlank
                    weight="duotone"
                    size={18}
                    className={classnames(
                        'shrink-0 transition-colors',
                        hasValue ? 'text-primary-500' : 'text-neutral-900'
                    )}
                />

                <span className={classnames('flex-1 text-left truncate', !hasValue && 'text-neutral-900')}>
                    {displayValue || placeholder}
                </span>

                {hasValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="shrink-0 p-0.5 rounded hover:bg-neutral-700 transition-colors"
                    >
                        <X size={14} weight="bold" className="text-neutral-900 hover:text-error-500" />
                    </button>
                )}
            </button>

            {isOpen &&
                rect &&
                createPortal(
                    <div
                        ref={popoverRef}
                        style={{
                            position: 'fixed',
                            top: rect.bottom + 8,
                            left: Math.max(8, Math.min(rect.left, window.innerWidth - 320)),
                            zIndex: 9999,
                        }}
                        className="bg-neutral-500 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    >
                        <DayPicker
                            mode="range"
                            selected={value}
                            onSelect={handleSelect}
                            month={month}
                            onMonthChange={setMonth}
                            locale={es}
                            showOutsideDays
                            fixedWeeks
                            weekStartsOn={0}
                            /* eslint-disable camelcase */
                            classNames={{
                                root: 'p-3',
                                months: 'flex flex-col',
                                month: 'space-y-3',
                                caption: 'flex justify-between items-center px-1',
                                caption_label: 'text-sm font-semibold capitalize',
                                nav: 'flex items-center gap-1',
                                button_previous:
                                    'p-1.5 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer',
                                button_next: 'p-1.5 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer',
                                month_grid: 'w-full border-collapse',
                                weekdays: 'flex',
                                weekday:
                                    'w-9 h-9 flex items-center justify-center text-xs font-medium text-neutral-900 uppercase',
                                week: 'flex',
                                day: 'relative p-0',
                                day_button: classnames(
                                    'w-9 h-9 flex items-center justify-center text-sm rounded-lg',
                                    'transition-colors cursor-pointer',
                                    'hover:bg-neutral-700'
                                ),
                                outside: 'text-neutral-800 opacity-50',
                                disabled: 'text-neutral-800 opacity-30 cursor-not-allowed',
                                hidden: 'invisible',
                                today: 'font-bold text-primary-500',
                                selected: 'bg-primary-500 text-white hover:bg-primary-600',
                                range_start: 'bg-primary-500 text-white rounded-l-lg rounded-r-none',
                                range_end: 'bg-primary-500 text-white rounded-r-lg rounded-l-none',
                                range_middle: 'bg-primary-500/20 rounded-none',
                            }}
                            /* eslint-enable camelcase */
                            components={{
                                Chevron: ({ orientation }) =>
                                    orientation === 'left' ? (
                                        <CaretLeft size={16} weight="bold" className="text-neutral-900" />
                                    ) : (
                                        <CaretRight size={16} weight="bold" className="text-neutral-900" />
                                    ),
                            }}
                        />
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default DateRangeSelector;
