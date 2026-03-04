import type { SelectProps } from '../Form.interface';
import type { FC } from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import Dropdown from '@components/Dropdown/Dropdown';

const Select: FC<SelectProps> = ({ name, rules, options, disabled }) => {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
                <Dropdown value={field.value ?? ''} onChange={field.onChange} options={options} disabled={disabled} />
            )}
        />
    );
};

export default Select;
