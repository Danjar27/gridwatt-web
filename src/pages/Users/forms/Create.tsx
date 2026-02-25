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

import { useUsersActions, useUsersContext } from '../utils/context';
import { UsersIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@context/auth/context.ts';
import { queryClient } from '@lib/query-client';
import { getTenants } from '@lib/api/tenants.ts';
import { createUser, getRoles } from '@lib/api/users.ts';
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
        queryFn: () => getRoles(),
    });

    const { data: tenantsData } = useQuery({
        queryKey: ['tenants'],
        queryFn: () => getTenants({ limit: 100, offset: 0 }),
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
        mutationFn: (data: any) => createUser(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            await queryClient.invalidateQueries({ queryKey: ['tenants'] });
            closeCreate();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
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
            <Window title={i18n('pages.users.form.create')} className="w-full max-w-150 px-4" icon={UsersIcon}>
                <FormError message={error} />
                <Form key="new" onSubmit={handleSubmit}>
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
                    <Field name="password" label={i18n('pages.users.form.password')} required>
                        <PasswordInput
                            name="password"
                            rules={{ required: i18n('errors.required'), minLength: { value: 6, message: i18n('errors.minLength', { min: 6 }) } }}
                        />
                    </Field>
                    <Field name="phone" label={i18n('pages.users.form.phone')}>
                        <PhoneInput name="phone" />
                    </Field>
                    <Field name="roleId" label={i18n('pages.users.form.role')} required>
                        <Select
                            name="roleId"
                            rules={{ required: i18n('errors.required') }}
                            options={[{ label: i18n('pages.users.form.selectRole'), value: '' }, ...roleOptions]}
                        />
                    </Field>
                    {isAdmin && (
                        <Field name="tenantId" label={i18n('pages.users.form.tenant')} required>
                            <Select
                                name="tenantId"
                                rules={{ required: i18n('errors.required') }}
                                options={[{ label: i18n('pages.users.form.selectTenant'), value: '' }, ...tenantOptions]}
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
