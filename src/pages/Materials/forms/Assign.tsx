import type { Stock } from '@interfaces/material.interface.ts';
import type { FC } from 'react';

import NumberInput from '@components/Form/blocks/NumberInput';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Select from '@components/Form/blocks/Select';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryContext } from '../utils/context.ts';
import { assignMaterialStock, getMaterialStock } from '@lib/api/materials.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { UserPlusIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { useTranslations } from 'use-intl';
import { useMemo, useState } from 'react';

interface AssignProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AssignFormData {
    technicianId: string;
    quantity: number;
}

const Assign: FC<AssignProps> = ({ isOpen, onClose }) => {
    const i18n = useTranslations();
    const { selected } = useInventoryContext();
    const [error, setError] = useState<string | null>(null);

    const { data: technicians = [] } = useQuery({
        queryKey: ['technicians'],
        queryFn: getTechnicians,
        select: (res) => res.data,
        enabled: isOpen,
    });

    const { data: stockBatches = [] } = useQuery<Array<Stock>>({
        queryKey: ['materials', selected?.id, 'stock'],
        queryFn: () => getMaterialStock(selected!.id),
        enabled: isOpen && !!selected?.id,
    });

    const bestBatch = useMemo<Stock | null>(() => {
        if (!stockBatches.length) {
            return null;
        }

        return stockBatches.reduce((prev, curr) => (curr.availableQuantity > prev.availableQuantity ? curr : prev));
    }, [stockBatches]);

    const totalAvailable = useMemo(() => stockBatches.reduce((sum, b) => sum + b.availableQuantity, 0), [stockBatches]);

    const assignMutation = useMutation({
        mutationFn: (data: AssignFormData) => {
            if (!bestBatch || !selected) {
                throw new Error(i18n('pages.materials.form.noStock'));
            }

            return assignMaterialStock(selected.id, bestBatch.id, {
                technicianId: Number(data.technicianId),
                quantity: Number(data.quantity),
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['materials'] });
            handleClose();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: AssignFormData) => {
        setError(null);
        assignMutation.mutate(data);
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const technicianOptions = technicians.map((t) => ({
        value: String(t.id),
        label: `${t.name} ${t.lastName}`,
    }));

    return (
        <Modal id="assign-material" isOpen={isOpen} onOpen={() => {}} onClose={handleClose}>
            <Window title={i18n('pages.materials.form.assign')} className="w-full max-w-md px-4" icon={UserPlusIcon}>
                <FormError message={error} />

                {selected && (
                    <p className="mb-4 text-sm text-neutral-400">
                        {selected.name} —{' '}
                        <span className="font-medium text-primary-400">
                            {totalAvailable} {selected.unit} {i18n('pages.materials.form.available')}
                        </span>
                    </p>
                )}

                {!bestBatch && stockBatches.length === 0 && isOpen && (
                    <p className="mb-4 text-sm text-yellow-400">{i18n('pages.materials.form.noStock')}</p>
                )}

                <Form key={`assign-${selected?.id}`} onSubmit={handleSubmit}>
                    <Field name="technicianId" label={i18n('pages.materials.form.technician')} required>
                        <Select
                            name="technicianId"
                            options={technicianOptions}
                            rules={{ required: i18n('errors.required') }}
                        />
                    </Field>
                    <Field name="quantity" label={i18n('pages.materials.form.quantity')} required>
                        <NumberInput
                            name="quantity"
                            step="any"
                            min={0.01}
                            rules={{
                                required: i18n('errors.required'),
                                min: { value: 0.01, message: '> 0' },
                                max: bestBatch
                                    ? {
                                          value: bestBatch.availableQuantity,
                                          message: `≤ ${bestBatch.availableQuantity}`,
                                      }
                                    : undefined,
                            }}
                        />
                    </Field>
                    <Actions
                        submitLabel={i18n('literal.assign')}
                        onCancel={handleClose}
                        isLoading={assignMutation.isPending}
                    />
                </Form>
            </Window>
        </Modal>
    );
};

export default Assign;
