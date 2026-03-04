import type { FC } from 'react';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';
import { ChartPieSliceIcon } from '@phosphor-icons/react';

import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Select from '@components/Form/blocks/Select';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { getTechnicians } from '@lib/api/users.ts';
import { createArea, updateArea } from '@lib/api/areas.ts';
import { queryClient } from '@lib/query-client';
import type { MapArea, AreaCoordinate, CreateAreaPayload } from '@interfaces/area.interface.ts';

interface AreaFormProps {
    isOpen: boolean;
    onClose: () => void;
    /** Filled when creating — the drawn polygon coordinates */
    pendingCoords?: Array<AreaCoordinate> | null;
    /** Filled when editing — the existing area */
    editingArea?: MapArea | null;
}

interface AreaFormData {
    technicianId: string;
}

const AreaForm: FC<AreaFormProps> = ({ isOpen, onClose, pendingCoords, editingArea }) => {
    const i18n = useTranslations();
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!editingArea;

    const { data: technicians = [] } = useQuery({
        queryKey: ['technicians'],
        queryFn: getTechnicians,
        select: (res) => res.data,
        enabled: isOpen,
    });

    const createMutation = useMutation({
        mutationFn: (data: AreaFormData) => {
            if (!pendingCoords || pendingCoords.length < 3) {
                throw new Error('Coordenadas inválidas');
            }
            const payload: CreateAreaPayload = {
                coordinates: pendingCoords,
                technicianId: data.technicianId ? Number(data.technicianId) : null,
            };

            return createArea(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['areas'] });
            await queryClient.invalidateQueries({ queryKey: ['orders', 'all-map'] });
            handleClose();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const updateMutation = useMutation({
        mutationFn: (data: AreaFormData) => {
            if (!editingArea) {
                throw new Error(i18n('errors.common'));
            }

            return updateArea(editingArea.id, {
                technicianId: data.technicianId ? Number(data.technicianId) : null,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['areas'] });
            await queryClient.invalidateQueries({ queryKey: ['orders', 'all-map'] });
            handleClose();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: AreaFormData) => {
        setError(null);
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const technicianOptions = [
        { value: '', label: i18n('pages.orders.areas.noTechnician') },
        ...technicians.map((t) => ({
            value: String(t.id),
            label: `${t.name} ${t.lastName}`,
        })),
    ];

    const isPending = createMutation.isPending || updateMutation.isPending;
    const title = isEditing ? i18n('pages.orders.areas.editTitle') : i18n('pages.orders.areas.title');

    const defaultValues = isEditing
        ? { technicianId: editingArea.technicianId ? String(editingArea.technicianId) : '' }
        : undefined;

    return (
        <Modal id="area-form" isOpen={isOpen} onOpen={() => {}} onClose={handleClose}>
            <Window title={title} className="w-full max-w-md px-4" icon={ChartPieSliceIcon}>
                <FormError message={error} />

                <Form
                    key={`area-form-${editingArea?.id ?? 'new'}`}
                    onSubmit={handleSubmit}
                    defaultValues={defaultValues}
                >
                    <Field name="technicianId" label={i18n('pages.orders.areas.technician')}>
                        <Select name="technicianId" options={technicianOptions} />
                    </Field>

                    <Actions submitLabel={i18n('literal.save')} onCancel={handleClose} isLoading={isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default AreaForm;
