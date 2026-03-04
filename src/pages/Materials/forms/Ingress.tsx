import type { Stock } from '@interfaces/material.interface.ts';
import type { FC } from 'react';

import NumberInput from '@components/Form/blocks/NumberInput';
import TextInput from '@components/Form/blocks/TextInput';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Select from '@components/Form/blocks/Select';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryContext } from '../utils/context.ts';
import { createMaterialStock, getMaterialStock, ingressMaterialStock } from '@lib/api/materials.ts';
import { ArrowLineDownIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

interface IngressProps {
    isOpen: boolean;
    onClose: () => void;
}

interface IngressFormData {
    stockBatchId: string;
    newBatchId: string;
    minimumStock: number;
    quantity: number;
    notes: string;
}

const Ingress: FC<IngressProps> = ({ isOpen, onClose }) => {
    const i18n = useTranslations();
    const { selected } = useInventoryContext();
    const [error, setError] = useState<string | null>(null);

    const { data: stockBatches = [], isLoading: loadingStock } = useQuery<Array<Stock>>({
        queryKey: ['materials', selected?.id, 'stock'],
        queryFn: () => getMaterialStock(selected!.id),
        enabled: isOpen && !!selected?.id,
    });

    const hasExistingBatches = stockBatches.length > 0;

    const ingressMutation = useMutation({
        mutationFn: async (data: IngressFormData) => {
            if (!selected) {
                throw new Error(i18n('errors.common'));
            }

            if (hasExistingBatches) {
                // Ingress into an existing batch
                return ingressMaterialStock(selected.id, data.stockBatchId, {
                    quantity: Number(data.quantity),
                    notes: data.notes || undefined,
                });
            } else {
                // Create a new batch first, then ingress
                const newStock = await createMaterialStock(selected.id, {
                    id: data.newBatchId,
                    minimumStock: data.minimumStock ? Number(data.minimumStock) : undefined,
                });

                return ingressMaterialStock(selected.id, newStock.id, {
                    quantity: Number(data.quantity),
                    notes: data.notes || undefined,
                });
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['materials'] });
            await queryClient.invalidateQueries({ queryKey: ['materials', selected?.id, 'stock'] });
            handleClose();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: IngressFormData) => {
        setError(null);
        ingressMutation.mutate(data);
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const batchOptions = stockBatches.map((b) => ({
        value: b.id,
        label: `${b.id} (${b.availableQuantity} ${selected?.unit ?? ''})`,
    }));

    return (
        <Modal id="ingress-material" isOpen={isOpen} onOpen={() => {}} onClose={handleClose}>
            <Window
                title={i18n('pages.materials.form.ingress')}
                className="w-full max-w-md px-4"
                icon={ArrowLineDownIcon}
            >
                <FormError message={error} />

                {selected && (
                    <p className="mb-4 text-sm text-neutral-400">
                        <span className="font-medium text-white">{selected.name}</span>
                        {' — '}
                        {selected.unit}
                    </p>
                )}

                <Form key={`ingress-${selected?.id}`} onSubmit={handleSubmit}>
                    {hasExistingBatches ? (
                        <>
                            <Field name="stockBatchId" label={i18n('pages.materials.form.stockBatch')} required>
                                <Select
                                    name="stockBatchId"
                                    options={batchOptions}
                                    rules={{ required: i18n('errors.required') }}
                                />
                            </Field>
                        </>
                    ) : (
                        <>
                            <p className="mb-3 rounded border border-yellow-700 bg-yellow-950/30 px-3 py-2 text-sm text-yellow-400">
                                {i18n('pages.materials.form.newBatchLabel')}
                            </p>
                            <Field name="newBatchId" label={i18n('pages.materials.form.stockBatchId')} required>
                                <TextInput
                                    name="newBatchId"
                                    rules={{ required: i18n('errors.required') }}
                                />
                            </Field>
                            <Field name="minimumStock" label={i18n('pages.materials.form.minimumStock')}>
                                <NumberInput name="minimumStock" step="any" min={0} />
                            </Field>
                        </>
                    )}

                    <Field name="quantity" label={i18n('pages.materials.form.ingressQty')} required>
                        <NumberInput
                            name="quantity"
                            step="any"
                            min={0.01}
                            rules={{
                                required: i18n('errors.required'),
                                min: { value: 0.01, message: '> 0' },
                            }}
                        />
                    </Field>

                    <Field name="notes" label={i18n('pages.materials.form.notes')}>
                        <TextInput name="notes" />
                    </Field>

                    <Actions
                        submitLabel={i18n('pages.materials.ingress')}
                        onCancel={handleClose}
                        isLoading={ingressMutation.isPending || loadingStock}
                    />
                </Form>
            </Window>
        </Modal>
    );
};

export default Ingress;
