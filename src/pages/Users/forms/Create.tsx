import type { MutationForm } from '@interfaces/form.interface';
import type { FC } from 'react';

import TextInput from '@components/Form/blocks/TextInput';
import EmailInput from '@components/Form/blocks/EmailInput';
import PasswordInput from '@components/Form/blocks/PasswordInput';
import PhoneInput from '@components/Form/blocks/PhoneInput';
import Select from '@components/Form/blocks/Select';
import FormError from '@components/Form/blocks/Error';
import Actions from '@components/Form/blocks/Actions';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useUsersActions, useUsersContext } from '../utils/context.tsx';
import { UsersIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@context/auth/context.ts';
import { queryClient } from '@lib/query-client';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';
import { useState, useMemo } from 'react';

const Create: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { isCreateOpen } = useUsersContext();
    const { openCreate, closeCreate } = useUsersActions();
    const { user: currentUser } = useAuthContext();
    const [error, setError] = useState<string | null>(null);

    const isAdmin = currentUser?.role?.name === 'admin';

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => apiClient.getRoles(),
    });

    const { data: tenantsData } = useQuery({
        queryKey: ['tenants'],
        queryFn: () => apiClient.getTenants({ limit: 100, offset: 0 }),
        enabled: isAdmin,
    });

    const roleOptions = useMemo(
        () => roles.filter((r) => isAdmin || r.name !== 'admin').map((r) => ({ label: r.name, value: r.id })),
        [roles, isAdmin]
    );

    const tenantOptions = useMemo(
        () => (tenantsData?.data ?? []).map((t) => ({ label: t.name, value: t.id })),
        [tenantsData]
    );

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.createUser(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            closeCreate();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || 'Failed to create user'),
    });

    const handleSubmit = (data: any) => {
        const payload: any = { ...data, roleId: Number(data.roleId) };
        if (isAdmin && data.tenantId) {
            payload.tenantId = Number(data.tenantId);
        }
        createMutation.mutate(payload);
    };

    const handleCancel = () => {
        closeCreate();
        onCancel?.();
    };

    return (
        <Modal id="new-user" isOpen={isCreateOpen} onOpen={openCreate} onClose={handleCancel}>
            <Window title={i18n('pages.users.form.create.title')} className="w-full max-w-150 px-4" icon={UsersIcon}>
                <FormError message={error} />
                <Form key="new" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <Field name="name" label={i18n('pages.users.form.name')} required>
                            <TextInput name="name" rules={{ required: 'Name is required' }} />
                        </Field>
                        <Field name="lastName" label={i18n('pages.users.form.lastName')} required>
                            <TextInput name="lastName" rules={{ required: 'Last name is required' }} />
                        </Field>
                    </div>
                    <Field name="email" label={i18n('pages.users.form.email')} required>
                        <EmailInput name="email" rules={{ required: 'Email is required' }} />
                    </Field>
                    <Field name="password" label={i18n('pages.users.form.password')} required>
                        <PasswordInput
                            name="password"
                            rules={{ required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } }}
                        />
                    </Field>
                    <Field name="phone" label={i18n('pages.users.form.phone')}>
                        <PhoneInput name="phone" />
                    </Field>
                    <Field name="roleId" label={i18n('pages.users.form.role')} required>
                        <Select
                            name="roleId"
                            rules={{ required: 'Role is required' }}
                            options={[{ label: 'Seleccionar rol', value: '' }, ...roleOptions]}
                        />
                    </Field>
                    {isAdmin && (
                        <Field name="tenantId" label={i18n('pages.users.form.tenant')} required>
                            <Select
                                name="tenantId"
                                rules={{ required: 'Tenant is required' }}
                                options={[{ label: 'Seleccionar empresa', value: '' }, ...tenantOptions]}
                            />
                        </Field>
                    )}
                    <Actions submitLabel={i18n('literal.create')} onCancel={handleCancel} isLoading={createMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default Create;
