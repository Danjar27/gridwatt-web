import type { UpdateQuery } from '@interfaces/query.interface.ts';
import type { MutationForm } from '@interfaces/form.interface';
import type { Tenant } from '@lib/api-client';
import type { FC } from 'react';

import TextInput from '@components/Form/blocks/TextInput';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryActions, useInventoryContext } from '../utils/context';
import { useMutation } from '@tanstack/react-query';
import { UsersIcon } from '@phosphor-icons/react';
import { queryClient } from '@lib/query-client';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

const Create: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { isUpdateOpen } = useInventoryContext();
    const { selected } = useInventoryContext();
    const { openUpdate, closeUpdate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: UpdateQuery<Tenant>) => apiClient.updateTenant(Number(id), data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['tenants'] });
            closeUpdate();
            setError(null);
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || 'Failed to update tenant'),
    });

    const handleSubmit = ({ id, ...data }: Tenant) => {
        updateMutation.mutate({ id, data });
    };

    const handleCancel = () => {
        closeUpdate();
        setError(null);
        onCancel?.();
    };

    return (
        <Modal id="new-user" isOpen={isUpdateOpen} onOpen={openUpdate} onClose={handleCancel}>
            <Window title={i18n('pages.tenants.form.create')} className="w-full max-w-150 px-4" icon={UsersIcon}>
                <FormError message={error} />
                <Form key={'new'} onSubmit={handleSubmit} defaultValues={{ ...selected }}>
                    <Field name="name" label="Nombre" required>
                        <TextInput name="name" rules={{ required: 'El nombre es requerido' }} />
                    </Field>
                    <Field name="slug" label="Slug" required>
                        <TextInput
                            name="slug"
                            rules={{
                                required: 'El slug es requerido',
                                pattern: {
                                    value: /^[a-z0-9-]+$/,
                                    message: 'Solo letras minúsculas, números y guiones',
                                },
                            }}
                        />
                    </Field>
                    <Actions submitLabel="Update" onCancel={handleCancel} isLoading={updateMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default Create;
