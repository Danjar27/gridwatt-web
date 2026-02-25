import type { MutationForm } from '@interfaces/form.interface';
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
import { createActivity } from '@lib/api/activities.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';
import type {Activity} from "@interfaces/activity.interface.ts";

const Create: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { isCreateOpen } = useInventoryContext();
    const { openCreate, closeCreate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: (data: Partial<Activity>) => createActivity(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['activities'] });
            setError(null);
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: Partial<Activity>) => {
        createMutation.mutate(data);
    };

    const handleCancel = () => {
        closeCreate();
        setError(null);
        onCancel?.();
    };

    return (
        <Modal id="new-activity" isOpen={isCreateOpen} onOpen={openCreate} onClose={handleCancel}>
            <Window title={i18n('pages.activities.form.create')} className="w-full max-w-150 px-4" icon={ClipboardIcon}>
                <FormError message={error} />
                <Form key="new" onSubmit={handleSubmit}>
                    <Field name="id" label={i18n('pages.activities.form.id')} required>
                        <PrefixedIdInput name="id" prefix="ACT" rules={{ required: i18n('errors.required') }} />
                    </Field>
                    <Field name="name" label={i18n('pages.activities.form.name')} required>
                        <TextInput name="name" rules={{ required: i18n('errors.required') }} />
                    </Field>
                    <Field name="description" label={i18n('pages.activities.form.description')}>
                        <TextArea name="description" rows={3} />
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
