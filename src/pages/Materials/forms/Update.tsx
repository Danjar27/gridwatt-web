import type { MutationForm } from '@interfaces/form.interface';
import type { UpdateQuery } from '@interfaces/query.interface';
import type { Material } from '@lib/api-client';
import type { FC } from 'react';

import TextInput from '@components/Form/blocks/TextInput';
import TextArea from '@components/Form/blocks/TextArea';
import Select from '@components/Form/blocks/Select';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';
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

const Update: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { selected, isUpdateOpen } = useInventoryContext();
    const { openUpdate, closeUpdate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: UpdateQuery<Material>) => apiClient.updateMaterial(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['materials'] });
            closeUpdate();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = ({ id, ...data }: Material) => {
        updateMutation.mutate({ id, data });
    };

    const handleCancel = () => {
        closeUpdate();
        onCancel?.();
    };

    if (!selected) {
        return null;
    }

    return (
        <Modal id="update-material" isOpen={isUpdateOpen} onOpen={openUpdate} onClose={handleCancel}>
            <Window
                title={i18n('pages.materials.form.update')}
                className="w-full max-w-150 px-4"
                icon={PackageIcon}
            >
                <FormError message={error} />
                <Form key={selected.id} onSubmit={handleSubmit} defaultValues={selected}>
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
                    <div className="grid grid-cols-2 gap-4">
                        <Field name="allowsDecimals" label={i18n('pages.materials.form.allowsDecimals')}>
                            <Select
                                name="allowsDecimals"
                                options={[
                                    { label: i18n('literal.yes'), value: 'true' },
                                    { label: i18n('literal.no'), value: 'false' },
                                ]}
                            />
                        </Field>
                    </div>
                    <Actions
                        submitLabel={i18n('literal.update')}
                        onCancel={handleCancel}
                        isLoading={updateMutation.isPending}
                    />
                </Form>
            </Window>
        </Modal>
    );
};

export default Update;
