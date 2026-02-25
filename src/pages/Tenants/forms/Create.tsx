import type { MutationForm } from '@interfaces/form.interface';
import type { FC } from 'react';

import TextInput from '@components/Form/blocks/TextInput';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryActions, useInventoryContext } from '../utils/context';
import { AddressBookIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { createTenant } from '@lib/api/tenants.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';
import type {Tenant} from "@interfaces/tenant.interface.ts";

const Create: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();
    const { isCreateOpen } = useInventoryContext();
    const { openCreate, closeCreate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: (data: Tenant) => createTenant(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['tenants'] });
            closeCreate();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: Tenant) => {
        createMutation.mutate(data);
    };

    const handleCancel = () => {
        closeCreate();
        onCancel?.();
    };

    return (
        <Modal id="new-user" isOpen={isCreateOpen} onOpen={openCreate} onClose={handleCancel}>
            <Window title={i18n('pages.tenants.form.create')} className="w-full max-w-150 px-4" icon={AddressBookIcon}>
                <FormError message={error} />
                <Form key="new" onSubmit={handleSubmit}>
                    <Field name="code" label={i18n('pages.tenants.fields.code')} required>
                        <TextInput
                            name="code"
                            rules={{
                                required: i18n('pages.tenants.errors.code'),
                                pattern: {
                                    value: /^[a-z0-9-]+$/,
                                    message: i18n('errors.format'),
                                },
                            }}
                        />
                    </Field>
                    <Field name="name" label={i18n('pages.tenants.fields.name')} required>
                        <TextInput name="name" rules={{ required: i18n('pages.tenants.errors.name') }} />
                    </Field>
                    <Actions
                        submitLabel={i18n('literal.create')}
                        onCancel={handleCancel}
                        isLoading={createMutation.isPending}
                    />
                </Form>
            </Window>
        </Modal>
    );
};

export default Create;
