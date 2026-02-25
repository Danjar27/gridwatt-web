import type { FC } from 'react';
import DatePicker from '@components/DatePicker/DatePicker';

interface DateRangePickerProps {
    fromValue: string;
    toValue: string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    fromLabel?: string;
    toLabel?: string;
    fromPlaceholder?: string;
    toPlaceholder?: string;
    className?: string;
}

const DateRangePicker: FC<DateRangePickerProps> = ({
    fromValue,
    toValue,
    onFromChange,
    onToChange,
    fromLabel,
    toLabel,
    fromPlaceholder,
    toPlaceholder,
    className,
}) => (
    <div className={`grid gap-4 s425:grid-cols-2 ${className ?? ''}`}>
        <DatePicker
            id="date-range-from"
            label={fromLabel}
            value={fromValue}
            onChange={onFromChange}
            placeholder={fromPlaceholder}
            max={toValue || undefined}
        />
        <DatePicker
            id="date-range-to"
            label={toLabel}
            value={toValue}
            onChange={onToChange}
            placeholder={toPlaceholder}
            min={fromValue || undefined}
        />
    </div>
);

export default DateRangePicker;
