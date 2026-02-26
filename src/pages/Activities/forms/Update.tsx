import type { Activity } from '@interfaces/activity.interface.ts';
import type { MutationForm } from '@interfaces/form.interface';
import type { UpdateQuery } from '@interfaces/query.interface';
import type { FC } from 'react';

import TextInput from '@components/Form/blocks/TextInput';
import TextArea from '@components/Form/blocks/TextArea';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryActions, useInventoryContext } from '../utils/context.ts';
import { ClipboardIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { updateActivity } from '@lib/api/activities.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

const Update: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { selected } = useInventoryContext();
    const { isUpdateOpen } = useInventoryContext();
    const { openUpdate, closeUpdate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: UpdateQuery<Activity>) => updateActivity(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
            closeUpdate();
            setError(null);
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = ({ id, ...rest }: Activity) => {
        updateMutation.mutate({ id, data: rest });
    };

    const handleCancel = () => {
        closeUpdate();
        setError(null);
        onCancel?.();
    };

    if (!selected) {
        return null;
    }

    return (
        <Modal id="update-activity" isOpen={isUpdateOpen} onOpen={openUpdate} onClose={handleCancel}>
            <Window title={i18n('pages.activities.form.update')} className="w-full max-w-150 px-4" icon={ClipboardIcon}>
                <FormError message={error} />
                <Form key={selected.id} onSubmit={handleSubmit} defaultValues={selected}>
                    <Field name="name" label={i18n('pages.activities.form.name')} required>
                        <TextInput name="name" rules={{ required: i18n('errors.required') }} />
                    </Field>
                    <Field name="description" label={i18n('pages.activities.form.description')}>
                        <TextArea name="description" rows={3} />
                    </Field>
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
