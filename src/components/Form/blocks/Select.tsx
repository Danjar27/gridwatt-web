import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import type { SelectProps } from '../Form.interface';
import { INPUT_CLASS } from '../utils/constants';

const Select: FC<SelectProps> = ({ name, rules, options, disabled, className }) => {
    const { register } = useFormContext();

    return (
        <select id={name} disabled={disabled} className={className ?? INPUT_CLASS} {...register(name, rules)}>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

export default Select;
