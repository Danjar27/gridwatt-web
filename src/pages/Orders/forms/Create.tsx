import type { MutationForm } from '@interfaces/form.interface';
import type { FC } from 'react';

import FormError from '@components/Form/blocks/Error';
import Window from '@components/Modal/blocks/Window';
import Modal from '@components/Modal/Modal';

import { useInventoryActions, useInventoryContext } from '../utils/context.ts';
import { OrderForm } from '@/components/orders/OrderForm';
import { ClipboardTextIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';
import type {Order} from "@interfaces/order.interface.ts";

const Create: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { isCreateOpen } = useInventoryContext();
    const { openCreate, closeCreate } = useInventoryActions();
    const [error, setError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: (data: Partial<Order>) => apiClient.createOrder(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['orders'] });
            closeCreate();
            setError(null);
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || 'Failed to create order'),
    });

    const handleSubmit = (data: any) => {
        createMutation.mutate(data);
    };

    const handleCancel = () => {
        closeCreate();
        setError(null);
        onCancel?.();
    };

    return (
        <Modal id="create-order" isOpen={isCreateOpen} onOpen={openCreate} onClose={handleCancel}>
            <Window
                title={i18n('pages.orders.form.create')}
                className="w-full max-w-200 px-4 max-h-[90dvh]"
                icon={ClipboardTextIcon}
                scrollable
            >
                <FormError message={error} />
                <OrderForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={createMutation.isPending} />
            </Window>
        </Modal>
    );
};

export default Create;
