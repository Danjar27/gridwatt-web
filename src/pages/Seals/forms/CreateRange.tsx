import type { FC } from 'react';

import NumberInput from '@components/Form/blocks/NumberInput';
import TextInput from '@components/Form/blocks/TextInput';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { ListPlusIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { createSealRange } from '@lib/api/seals.ts';
import { queryClient } from '@lib/query-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

interface CreateRangeProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RangeFormData {
    type: string;
    from: number;
    to: number;
}

interface RangeResult {
    requested: number;
    created: number;
    skipped: number;
}

const CreateRange: FC<CreateRangeProps> = ({ isOpen, onClose }) => {
    const i18n = useTranslations();
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<RangeResult | null>(null);

    const rangeMutation = useMutation({
        mutationFn: (data: RangeFormData) => createSealRange({ ...data, from: Number(data.from), to: Number(data.to) }),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['seals'] });
            setResult(data);
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: RangeFormData) => {
        setError(null);
        rangeMutation.mutate(data);
    };

    const handleClose = () => {
        setError(null);
        setResult(null);
        onClose();
    };

    return (
        <Modal id="create-seal-range" isOpen={isOpen} onOpen={() => {}} onClose={handleClose}>
            <Window title={i18n('pages.seals.form.range')} className="w-full max-w-md px-4" icon={ListPlusIcon}>
                {!result ? (
                    <>
                        <FormError message={error} />
                        <Form key="seal-range" onSubmit={handleSubmit}>
                            <Field name="type" label={i18n('pages.seals.form.type')} required>
                                <TextInput name="type" rules={{ required: i18n('errors.required') }} />
                            </Field>
                            <Field name="from" label={i18n('pages.seals.form.fromNumber')} required>
                                <NumberInput
                                    name="from"
                                    step="1"
                                    min={1}
                                    rules={{ required: i18n('errors.required'), min: { value: 1, message: '≥ 1' } }}
                                />
                            </Field>
                            <Field name="to" label={i18n('pages.seals.form.toNumber')} required>
                                <NumberInput
                                    name="to"
                                    step="1"
                                    min={1}
                                    rules={{ required: i18n('errors.required'), min: { value: 1, message: '≥ 1' } }}
                                />
                            </Field>
                            <Actions
                                submitLabel={i18n('pages.seals.range')}
                                onCancel={handleClose}
                                isLoading={rangeMutation.isPending}
                            />
                        </Form>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3 text-center text-sm">
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-neutral-300">{result.requested}</p>
                                <p className="text-neutral-400">Solicitados</p>
                            </div>
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-primary-400">{result.created}</p>
                                <p className="text-neutral-400">{i18n('import.created')}</p>
                            </div>
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-yellow-400">{result.skipped}</p>
                                <p className="text-neutral-400">Omitidos</p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
                            >
                                {i18n('literal.close')}
                            </button>
                        </div>
                    </div>
                )}
            </Window>
        </Modal>
    );
};

export default CreateRange;
