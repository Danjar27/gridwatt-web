import type { MutationForm } from '@interfaces/form.interface';
import type { Seal } from '@interfaces/seal.interface.ts';
import type { FC } from 'react';

import NumberInput from '@components/Form/blocks/NumberInput';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryActions, useInventoryContext } from '../utils/context.ts';
import { SealIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { createSeal } from '@lib/api/seals.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';
import TextInput from '@components/Form/blocks/TextInput';

const Create: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { isCreateOpen } = useInventoryContext();
    const { openCreate, closeCreate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: (data: Partial<Seal>) => createSeal(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['seals'] });
            closeCreate();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: Partial<Seal>) => {
        createMutation.mutate({ ...data });
    };

    const handleCancel = () => {
        closeCreate();
        onCancel?.();
    };

    return (
        <Modal id="new-seal" isOpen={isCreateOpen} onOpen={openCreate} onClose={handleCancel}>
            <Window title={i18n('pages.seals.form.create')} className="w-full max-w-150 px-4" icon={SealIcon}>
                <FormError message={error} />
                <Form key="new" onSubmit={handleSubmit}>
                    <Field name="id" label={i18n('pages.seals.form.id')} required>
                        <NumberInput name="id" step="1" min={1} rules={{ required: i18n('errors.required'), min: { value: 1, message: '≥ 1' } }} />
                    </Field>
                    <Field name="type" label={i18n('pages.seals.form.type')} required>
                        <TextInput name="type" rules={{ required: i18n('errors.required') }} />
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

