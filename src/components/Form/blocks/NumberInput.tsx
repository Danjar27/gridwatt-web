import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import type { InputProps } from '../Form.interface';
import { INPUT_CLASS } from '../utils/constants';

interface NumberInputProps extends InputProps {
    step?: string;
    min?: number;
    max?: number;
}

const NumberInput: FC<NumberInputProps> = ({ name, rules, placeholder, disabled, className, autoFocus, step, min, max }) => {
    const { register } = useFormContext();

    return (
        <input
            id={name}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            step={step}
            min={min}
            max={max}
            className={className ?? INPUT_CLASS}
            {...register(name, { ...rules, valueAsNumber: true })}
        />
    );
};

export default NumberInput;
