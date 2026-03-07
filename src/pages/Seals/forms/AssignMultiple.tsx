import type { FC } from 'react';

import SliderRange from '@components/Form/blocks/SliderRange';
import NumberInput from '@components/Form/blocks/NumberInput';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Select from '@components/Form/blocks/Select';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { UsersThreeIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { assignSeal } from '@lib/api/seals.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

interface AssignMultipleProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AssignMultipleFormData {
    technicianId: string;
    sealId: string;
    fromNumber: number;
    toNumber: number;
}

const SLIDER_MAX = 9999;

const AssignMultiple: FC<AssignMultipleProps> = ({ isOpen, onClose }) => {
    const i18n = useTranslations();
    const [error, setError] = useState<string | null>(null);

    const { data: technicians = [] } = useQuery({
        queryKey: ['technicians'],
        queryFn: getTechnicians,
        select: (res) => res.data,
        enabled: isOpen,
    });

    const assignMutation = useMutation({
        mutationFn: (data: AssignMultipleFormData) =>
            assignSeal(Number(data.sealId), {
                technicianId: Number(data.technicianId),
                fromNumber: Number(data.fromNumber),
                toNumber: Number(data.toNumber),
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['seals'] });
            handleClose();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: AssignMultipleFormData) => {
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
        <Modal id="assign-seal-multiple" isOpen={isOpen} onOpen={() => {}} onClose={handleClose}>
            <Window
                title={i18n('pages.seals.form.assignMultiple')}
                className="w-full max-w-lg px-4"
                icon={UsersThreeIcon}
            >
                <FormError message={error} />
                <Form
                    key="assign-seal-multiple"
                    onSubmit={handleSubmit}
                    defaultValues={{ fromNumber: 1, toNumber: SLIDER_MAX }}
                >
                    <Field name="technicianId" label={i18n('pages.seals.form.technician')} required>
                        <Select
                            name="technicianId"
                            options={technicianOptions}
                            rules={{ required: i18n('errors.required') }}
                        />
                    </Field>

                    <Field name="sealId" label={i18n('pages.seals.form.id')} required>
                        <NumberInput
                            name="sealId"
                            step="1"
                            min={1}
                            rules={{ required: i18n('errors.required'), min: { value: 1, message: '≥ 1' } }}
                        />
                    </Field>

                    <div className="mt-2">
                        <p className="mb-3 block text-sm font-medium">{i18n('pages.seals.form.rangeLabel')}</p>
                        <SliderRange fromName="fromNumber" toName="toNumber" min={1} max={SLIDER_MAX} step={1} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4">
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
                    </div>

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

export default AssignMultiple;
