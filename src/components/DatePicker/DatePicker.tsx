import type { FC } from 'react';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import { LABEL_CLASS } from '@components/Form/utils/constants';
import { classnames } from '@utils/classnames.ts';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

const DatePicker: FC<DatePickerProps> = ({ value, onChange, label, placeholder, min, max, disabled, className, id }) => (
    <div className={classnames('flex flex-col', className)}>
        {label && (
            <label htmlFor={id} className={LABEL_CLASS}>
                {label}
            </label>
        )}
        <input
            type="date"
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            disabled={disabled}
            className={INPUT_CLASS}
        />
    </div>
);

export default DatePicker;
