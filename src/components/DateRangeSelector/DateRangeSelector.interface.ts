import type { DateRange } from 'react-day-picker';

export interface DateRangeSelectorProps {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
