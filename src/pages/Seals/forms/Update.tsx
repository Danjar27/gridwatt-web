import type { MutationForm } from '@interfaces/form.interface';
import type { UpdateQuery } from '@interfaces/query.interface';
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
import { SealIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { updateSeal } from '@lib/api/seals.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';
import type {Seal} from "@interfaces/seal.interface.ts";

const Update: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { selected, isUpdateOpen } = useInventoryContext();
    const { openUpdate, closeUpdate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: UpdateQuery<Seal>) => updateSeal(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['seals'] });
            closeUpdate();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = ({ id, isActive, ...rest }: Seal & { isActive: string }) => {
        updateMutation.mutate({ id, data: { ...rest, isActive: String(isActive) === 'true' } });
    };

    const handleCancel = () => {
        closeUpdate();
        onCancel?.();
    };

    if (!selected) {
        return null;
    }

    return (
        <Modal id="update-seal" isOpen={isUpdateOpen} onOpen={openUpdate} onClose={handleCancel}>
            <Window title={i18n('pages.seals.form.update')} className="w-full max-w-150 px-4" icon={SealIcon}>
                <FormError message={error} />
                <Form
                    key={selected.id}
                    onSubmit={handleSubmit}
                    defaultValues={{ ...selected, isActive: String(selected.isActive) }}
                >
                    <Field name="name" label={i18n('pages.seals.form.name')} required>
                        <TextInput name="name" rules={{ required: i18n('errors.required') }} />
                    </Field>
                    <Field name="type" label={i18n('pages.seals.form.type')} required>
                        <TextInput name="type" rules={{ required: i18n('errors.required') }} />
                    </Field>
                    <Field name="description" label={i18n('pages.seals.form.description')}>
                        <TextArea name="description" rows={3} />
                    </Field>
                    <Field name="isActive" label={i18n('pages.seals.form.isActive')}>
                        <Select name="isActive" options={[{ label: i18n('literal.active'), value: 'true' }, { label: i18n('literal.inactive'), value: 'false' }]} />
                    </Field>
                    <Actions submitLabel={i18n('literal.update')} onCancel={handleCancel} isLoading={updateMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default Update;
