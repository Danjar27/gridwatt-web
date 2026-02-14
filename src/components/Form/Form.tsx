import type { FormProps } from './Form.interface';
import type { FieldValues } from 'react-hook-form';

import { useForm, FormProvider } from 'react-hook-form';
import { classnames } from '@utils/classnames.ts';

function Form<T extends FieldValues>({ onSubmit, defaultValues, children, className }: FormProps<T>) {
    const methods = useForm<T>({ defaultValues });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className={classnames('space-y-4', className)}>
                {typeof children === 'function' ? children(methods) : children}
            </form>
        </FormProvider>
    );
}

export default Form;
