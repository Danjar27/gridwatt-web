import { useForm, FormProvider, type FieldValues } from 'react-hook-form';
import type { FormProps } from './Form.interface';

function Form<T extends FieldValues>({ onSubmit, defaultValues, children, className }: FormProps<T>) {
    const methods = useForm<T>({ defaultValues });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className={className ?? 'space-y-4'} noValidate>
                {typeof children === 'function' ? children(methods) : children}
            </form>
        </FormProvider>
    );
}

export default Form;
