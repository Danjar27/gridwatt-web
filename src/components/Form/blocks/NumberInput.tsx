import type { NumberInputProps } from '../Form.interface';
import type { FC } from 'react';

import { useFormContext } from 'react-hook-form';
import { INPUT_CLASS } from '../utils/constants';

const NumberInput: FC<NumberInputProps> = ({ name, placeholder, disabled, className, autoFocus, step, min, max }) => {
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
            {...register(name, {
                valueAsNumber: true,
            })}
        />
    );
};

export default NumberInput;
