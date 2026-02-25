import type { MutationForm } from '@interfaces/form.interface';
import type { FC } from 'react';

import PasswordInput from '@components/Form/blocks/PasswordInput';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';
import Window from '@components/Modal/blocks/Window';
import Field from '@components/Form/blocks/Field';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';

import { useUsersActions, useUsersContext } from '../utils/context';
import { KeyIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { updateUser } from '@lib/api/users.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

const ResetPassword: FC<MutationForm> = ({ onSubmit, onCancel }) => {
    const i18n = useTranslations();

    const { selected, isPasswordResetOpen } = useUsersContext();
    const { openPasswordReset, closePasswordReset } = useUsersActions();
    const [error, setError] = useState<string | null>(null);

    const resetMutation = useMutation({
        mutationFn: ({ id, password }: { id: number; password: string }) =>
            updateUser(id, { password }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users'] });
            closePasswordReset();
            onSubmit?.();
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleSubmit = ({ password }: { password: string }) => {
        if (selected) {
            resetMutation.mutate({ id: selected.id, password });
        }
    };

    const handleCancel = () => {
        closePasswordReset();
        onCancel?.();
    };

    if (!selected) {
        return null;
    }

    return (
        <Modal id="reset-password-user" isOpen={isPasswordResetOpen} onOpen={openPasswordReset} onClose={handleCancel}>
            <Window title={i18n('pages.users.form.passwordReset.title')} className="w-full max-w-120 px-4" icon={KeyIcon}>
                <FormError message={error} />
                <p className="mb-2 text-sm text-muted-foreground">
                    {selected.name} {selected.lastName}
                </p>
                <Form key={selected.id} onSubmit={handleSubmit}>
                    <Field name="password" label={i18n('pages.users.form.password')} required>
                        <PasswordInput
                            name="password"
                            autoFocus
                            rules={{ required: i18n('errors.required'), minLength: { value: 6, message: i18n('errors.minLength', { min: 6 }) } }}
                        />
                    </Field>
                    <Actions submitLabel={i18n('pages.users.form.passwordReset.title')} onCancel={handleCancel} isLoading={resetMutation.isPending} />
                </Form>
            </Window>
        </Modal>
    );
};

export default ResetPassword;
