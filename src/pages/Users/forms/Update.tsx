import type { MutationForm } from '@interfaces/form.interface';
import type { FC } from 'react';

import TextInput from '@components/Form/blocks/TextInput';
import EmailInput from '@components/Form/blocks/EmailInput';
import PhoneInput from '@components/Form/blocks/PhoneInput';
import Select from '@components/Form/blocks/Select';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useUsersActions, useUsersContext } from '../utils/context';
import { UsersIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@context/auth/context.ts';
import { queryClient } from '@lib/query-client';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';
import { useState, useMemo } from 'react';

const Update: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { selected, isUpdateOpen } = useUsersContext();
    const { openUpdate, closeUpdate } = useUsersActions();
    const { user: currentUser } = useAuthContext();
    const [error, setError] = useState<string | null>(null);

    const isAdmin = currentUser?.role?.name === 'admin';

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => apiClient.getRoles(),
    });

    const roleOptions = useMemo(
        () => roles.filter((r) => isAdmin || r.name !== 'admin').map((r) => ({ label: r.name, value: r.id })),
        [roles, isAdmin]
    );

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.updateUser(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            closeUpdate();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = (data: any) => {
        if (!selected) {return;}
        updateMutation.mutate({
            id: selected.id,
            data: { ...data, roleId: Number(data.roleId), isActive: data.isActive === 'true' },
        });
    };

    const handleCancel = () => {
        closeUpdate();
        onCancel?.();
    };

    if (!selected) {
        return null;
    }

    return (
        <Modal id="update-user" isOpen={isUpdateOpen} onOpen={openUpdate} onClose={handleCancel}>
            <Window title={i18n('pages.users.form.update')} className="w-full max-w-150 px-4" icon={UsersIcon}>
                <FormError message={error} />
                <Form
                    key={selected.id}
                    onSubmit={handleSubmit}
                    defaultValues={{
                        name: selected.name,
                        lastName: selected.lastName,
                        email: selected.email,
                        phone: selected.phone || '',
                        roleId: selected.role?.id,
                        isActive: String(selected.isActive),
                    }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Field name="name" label={i18n('pages.users.form.name')} required>
                            <TextInput name="name" rules={{ required: i18n('errors.required') }} />
                        </Field>
                        <Field name="lastName" label={i18n('pages.users.form.lastName')} required>
                            <TextInput name="lastName" rules={{ required: i18n('errors.required') }} />
                        </Field>
                    </div>
                    <Field name="email" label={i18n('pages.users.form.email')} required>
                        <EmailInput name="email" rules={{ required: i18n('errors.required') }} />
                    </Field>
                    <Field name="phone" label={i18n('pages.users.form.phone')}>
                        <PhoneInput name="phone" />
                    </Field>
                    <Field name="roleId" label={i18n('pages.users.form.role')} required>
                        <Select name="roleId" rules={{ required: i18n('errors.required') }} options={roleOptions} />
                    </Field>
                    <Field name="isActive" label={i18n('pages.users.form.isActive')}>
                        <Select name="isActive" options={[{ label: i18n('literal.active'), value: 'true' }, { label: i18n('literal.inactive'), value: 'false' }]} />
                    </Field>
                    <Actions submitLabel={i18n('literal.update')} onCancel={handleCancel} isLoading={updateMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default Update;
