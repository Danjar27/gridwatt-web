import type { MutationForm } from '@interfaces/form.interface';
import type { Activity } from '@lib/api-client';
import type { FC } from 'react';

import PrefixedIdInput from '@components/Form/blocks/PrefixedIdInput';
import TextInput from '@components/Form/blocks/TextInput';
import TextArea from '@components/Form/blocks/TextArea';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryActions, useInventoryContext } from '../utils/context.ts';
import { ClipboardIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

const Create: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { isCreateOpen } = useInventoryContext();
    const { openCreate, closeCreate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: (data: Partial<Activity>) => apiClient.createActivity(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || 'Failed to create activity'),
    });

    const handleSubmit = (data: Partial<Activity>) => {
        createMutation.mutate(data);
    };

    const handleCancel = () => {
        closeCreate();
        onCancel?.();
    };

    return (
        <Modal id="new-activity" isOpen={isCreateOpen} onOpen={openCreate} onClose={handleCancel}>
            <Window title={i18n('pages.activities.modal.title')} className="w-full max-w-150 px-4" icon={ClipboardIcon}>
                <FormError message={error} />
                <Form key="new" onSubmit={handleSubmit}>
                    <Field name="id" label={i18n('pages.activities.form.id')} required>
                        <PrefixedIdInput name="id" prefix="ACT" rules={{ required: 'ID is required' }} />
                    </Field>
                    <Field name="name" label={i18n('pages.activities.form.name')} required>
                        <TextInput name="name" rules={{ required: 'Name is required' }} />
                    </Field>
                    <Field name="description" label={i18n('pages.activities.form.description')}>
                        <TextArea name="description" rows={3} />
                    </Field>
                    <Actions submitLabel="Create" onCancel={handleCancel} isLoading={createMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default Create;
