import type { MutationForm } from '@interfaces/form.interface';
import type { FC } from 'react';

import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useInventoryActions, useInventoryContext } from '../utils/context.ts';
import { PackageIcon, SealWarningIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { deleteMaterial } from '@lib/api/materials.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';
import type {Material} from "@interfaces/material.interface.ts";

const Delete: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { selected, isDeleteOpen } = useInventoryContext();
    const { openDelete, closeDelete } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const deleteMutation = useMutation({
        mutationFn: (id: Material['id']) => deleteMaterial(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['materials'] });
            closeDelete();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || 'Failed to delete material'),
    });

    const handleConfirm = () => {
        if (selected) {
            deleteMutation.mutate(selected.id);
        }
    };

    const handleCancel = () => {
        closeDelete();
        onCancel?.();
    };

    if (!selected) {
        return null;
    }

    return (
        <Modal id="delete-material" isOpen={isDeleteOpen} onOpen={openDelete} onClose={handleCancel}>
            <Window title={i18n('pages.materials.form.delete')} className="w-full max-w-120 px-4" icon={PackageIcon}>
                <FormError message={error} />
                <Form key={selected.id} onSubmit={handleConfirm}>
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <SealWarningIcon size={40} className="text-secondary-500" weight="duotone" />
                        <p className="text-sm">{i18n('common.confirmation', { name: selected.name })}</p>
                    </div>
                    <Actions submitLabel={i18n('literal.delete')} onCancel={handleCancel} isLoading={deleteMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default Delete;
