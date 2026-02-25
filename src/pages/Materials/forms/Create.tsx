import type { MutationForm } from '@interfaces/form.interface';
import type { FC } from 'react';

import PrefixedIdInput from '@components/Form/blocks/PrefixedIdInput';
import TextInput from '@components/Form/blocks/TextInput';
import TextArea from '@components/Form/blocks/TextArea';
import Select from '@components/Form/blocks/Select';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryActions, useInventoryContext } from '../utils/context.ts';
import { PackageIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';
import type {Material} from "@interfaces/material.interface.ts";

const Create: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { isCreateOpen } = useInventoryContext();
    const { openCreate, closeCreate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: (data: Partial<Material>) => apiClient.createMaterial(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['materials'] });
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: Partial<Material>) => {
        createMutation.mutate(data);
    };

    const handleCancel = () => {
        closeCreate();
        onCancel?.();
    };

    return (
        <Modal id="new-material" isOpen={isCreateOpen} onOpen={openCreate} onClose={handleCancel}>
            <Window
                title={i18n('pages.materials.form.create')}
                className="w-full max-w-150 px-4"
                icon={PackageIcon}
            >
                <FormError message={error} />
                <Form key="new" onSubmit={handleSubmit} defaultValues={{ allowsDecimals: false, isActive: true }}>
                    <Field name="id" label={i18n('pages.materials.form.id')} required>
                        <PrefixedIdInput name="id" prefix="MAT" rules={{ required: i18n('errors.required') }} />
                    </Field>
                    <Field name="name" label={i18n('pages.materials.form.name')} required>
                        <TextInput name="name" rules={{ required: i18n('errors.required') }} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field name="type" label={i18n('pages.materials.form.type')} required>
                            <TextInput name="type" rules={{ required: i18n('errors.required') }} />
                        </Field>
                        <Field name="unit" label={i18n('pages.materials.form.unit')} required>
                            <TextInput name="unit" rules={{ required: i18n('errors.required') }} />
                        </Field>
                    </div>
                    <Field name="description" label={i18n('pages.materials.form.description')}>
                        <TextArea name="description" rows={3} />
                    </Field>
                    <Field name="allowsDecimals" label={i18n('pages.materials.form.allowsDecimals')}>
                        <Select
                            name="allowsDecimals"
                            options={[
                                { label: i18n('literal.yes'), value: 'true' },
                                { label: i18n('literal.no'), value: 'false' },
                            ]}
                        />
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
