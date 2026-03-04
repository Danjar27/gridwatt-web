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
import { assignSeal } from '@lib/api/seals.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { UserPlusIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

interface AssignProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AssignFormData {
    technicianId: string;
    fromNumber: number;
    toNumber: number;
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

    const assignMutation = useMutation({
        mutationFn: (data: AssignFormData) => {
            if (!selected) throw new Error(i18n('errors.common'));
            return assignSeal(selected.id, {
                technicianId: Number(data.technicianId),
                fromNumber: Number(data.fromNumber),
                toNumber: Number(data.toNumber),
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['seals'] });
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
        <Modal id="assign-seal" isOpen={isOpen} onOpen={() => {}} onClose={handleClose}>
            <Window title={i18n('pages.seals.form.assign')} className="w-full max-w-md px-4" icon={UserPlusIcon}>
                <FormError message={error} />

                {selected && (
                    <p className="mb-4 text-sm text-neutral-400">
                        {selected.name}{' '}
                        <span className="font-mono text-xs text-neutral-500">({selected.id})</span>
                    </p>
                )}

                <Form key={`assign-seal-${selected?.id}`} onSubmit={handleSubmit}>
                    <Field name="technicianId" label={i18n('pages.seals.form.technician')} required>
                        <Select
                            name="technicianId"
                            options={technicianOptions}
                            rules={{ required: i18n('errors.required') }}
                        />
                    </Field>
                    <Field name="fromNumber" label={i18n('pages.seals.form.fromSealNumber')} required>
                        <NumberInput
                            name="fromNumber"
                            step="1"
                            min={1}
                            rules={{ required: i18n('errors.required'), min: { value: 1, message: '≥ 1' } }}
                        />
                    </Field>
                    <Field name="toNumber" label={i18n('pages.seals.form.toSealNumber')} required>
                        <NumberInput
                            name="toNumber"
                            step="1"
                            min={1}
                            rules={{ required: i18n('errors.required'), min: { value: 1, message: '≥ 1' } }}
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
