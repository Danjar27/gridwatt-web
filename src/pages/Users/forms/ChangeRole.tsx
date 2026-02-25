import type { MutationForm } from '@interfaces/form.interface';
import type { FC } from 'react';

import Select from '@components/Form/blocks/Select';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useUsersActions, useUsersContext } from '../utils/context';
import { ShieldIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@context/auth/context.ts';
import { queryClient } from '@lib/query-client';
import { getRoles, updateUser } from '@lib/api/users.ts';
import { useTranslations } from 'use-intl';
import { useState, useMemo } from 'react';

const ChangeRole: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { selected, isRoleChangeOpen } = useUsersContext();
    const { openRoleChange, closeRoleChange } = useUsersActions();
    const { user: currentUser } = useAuthContext();
    const [error, setError] = useState<string | null>(null);

    const isAdmin = currentUser?.role?.name === 'admin';

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => getRoles(),
    });

    const roleOptions = useMemo(
        () => roles.filter((r) => isAdmin || r.name !== 'admin').map((r) => ({ label: r.name, value: r.id })),
        [roles, isAdmin]
    );

    const roleMutation = useMutation({
        mutationFn: ({ id, roleId }: { id: number; roleId: number }) =>
            updateUser(id, { roleId }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            closeRoleChange();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = ({ roleId }: { roleId: string }) => {
        if (selected) {
            roleMutation.mutate({ id: selected.id, roleId: Number(roleId) });
        }
    };

    const handleCancel = () => {
        closeRoleChange();
        onCancel?.();
    };

    if (!selected) {
        return null;
    }

    return (
        <Modal id="change-role-user" isOpen={isRoleChangeOpen} onOpen={openRoleChange} onClose={handleCancel}>
            <Window title={i18n('pages.users.form.changeRole.title')} className="w-full max-w-120 px-4" icon={ShieldIcon}>
                <FormError message={error} />
                <p className="mb-2 text-sm text-muted-foreground">
                    {selected.name} {selected.lastName}
                </p>
                <Form key={selected.id} onSubmit={handleSubmit} defaultValues={{ roleId: selected.role?.id }}>
                    <Field name="roleId" label={i18n('pages.users.form.role')} required>
                        <Select name="roleId" rules={{ required: i18n('errors.required') }} options={roleOptions} />
                    </Field>
                    <Actions submitLabel={i18n('pages.users.form.changeRole.title')} onCancel={handleCancel} isLoading={roleMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default ChangeRole;
