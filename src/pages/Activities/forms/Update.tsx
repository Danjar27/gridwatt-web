import type { MutationForm } from '@interfaces/form.interface';
import type { UpdateQuery } from '@interfaces/query.interface';
import type { Activity } from '@lib/api-client';
import type { FC } from 'react';

import TextInput from '@components/Form/blocks/TextInput';
import TextArea from '@components/Form/blocks/TextArea';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { ClipboardIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';
import { useInventoryContext } from '@context/Inventory/context.ts';

const Update: FC<MutationForm> = ({ onSubmit, onCancel, isOpen, open, close }) => {
    const { selected } = useInventoryContext();
    const i18n = useTranslations();
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: UpdateQuery<Activity>) => apiClient.updateActivity(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
            onSubmit();
        },
        onError: (err: Error) => setError(err.message || 'Failed to update activity'),
    });

    const handleFormSubmit = (data: UpdateQuery<Activity>) => {
        updateMutation.mutate(data);
    };

    return (
        <Modal id="update-activity" isOpen={isOpen} open={open} close={close}>
            <Window title={i18n('pages.activities.modal.title')} className="w-full max-w-150 px-4" icon={ClipboardIcon}>
                <FormError message={error} />
                <Form
                    key="new"
                    onSubmit={handleFormSubmit}
                    defaultValues={{
                        ...selected,
                    }}
                >
                    <Field name="name" label={i18n('pages.activities.form.name')} required>
                        <TextInput name="name" rules={{ required: 'Name is required' }} />
                    </Field>
                    <Field name="description" label={i18n('pages.activities.form.description')}>
                        <TextArea name="description" rows={3} />
                    </Field>
                    <Actions submitLabel="Update" onCancel={onCancel} isLoading={updateMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default Update;
