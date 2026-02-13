import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import type { InputProps } from '../Form.interface';
import { INPUT_CLASS } from '../utils/constants';

const DateInput: FC<InputProps> = ({ name, rules, disabled, className, autoFocus }) => {
    const { register } = useFormContext();

    return (
        <input
            id={name}
            type="date"
            disabled={disabled}
            autoFocus={autoFocus}
            className={className ?? INPUT_CLASS}
            {...register(name, rules)}
        />
    );
};

export default DateInput;
