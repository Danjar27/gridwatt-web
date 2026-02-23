import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';
import Page from '@layouts/Page';
import Summary from '@components/Summary/Summary';
import Form from '@components/Form/Form';
import Field from '@components/Form/blocks/Field';
import TextInput from '@components/Form/blocks/TextInput';
import PasswordInput from '@components/Form/blocks/PasswordInput';
import PhoneInput from '@components/Form/blocks/PhoneInput';
import FormError from '@components/Form/blocks/Error';

const ProfilePage = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const updateMutation = useMutation({
        mutationFn: (data: { name?: string; lastName?: string; phone?: string; password?: string }) =>
            apiClient.updateProfile(data),
        onSuccess: () => {
            setSuccess(i18n('pages.profile.success'));
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (err) => {
            setError(err instanceof Error ? err.message : i18n('errors.common'));
        },
    });

    const handleSubmit = (data: any) => {
        setError('');
        setSuccess('');

        if (data.password && data.password !== data.confirmPassword) {
            setError(i18n('pages.profile.errors.passwordMismatch'));

            return;
        }

        const payload: { name?: string; lastName?: string; phone?: string; password?: string } = {
            name: data.name,
            lastName: data.lastName,
            phone: data.phone,
        };

        if (data.password) {
            payload.password = data.password;
        }

        updateMutation.mutate(payload);
    };

    return (
        <Page id="profile" title={i18n('pages.profile.title')} subtitle={i18n('pages.profile.subtitle')}>
            <Summary title={i18n('pages.profile.title')} subtitle={i18n('pages.profile.subtitle')} icon={User}>
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">
                            {user?.name} {user?.lastName}
                        </h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            {user?.role?.name}
                        </span>
                    </div>
                </div>

                <Form
                    onSubmit={handleSubmit}
                    defaultValues={{
                        name: user?.name || '',
                        lastName: user?.lastName || '',
                        phone: user?.phone || '',
                        password: '',
                        confirmPassword: '',
                    }}
                >
                    <FormError message={error || null} />
                    {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field name="name" label={i18n('pages.profile.form.firstName')}>
                            <TextInput name="name" />
                        </Field>
                        <Field name="lastName" label={i18n('pages.profile.form.lastName')}>
                            <TextInput name="lastName" />
                        </Field>
                    </div>

                    <Field name="phone" label={i18n('pages.profile.form.phone')}>
                        <PhoneInput name="phone" />
                    </Field>

                    <hr className="my-6" />

                    <h3 className="font-medium">{i18n('pages.profile.form.changePassword')}</h3>
                    <p className="text-sm text-muted-foreground">{i18n('pages.profile.form.passwordHint')}</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field name="password" label={i18n('pages.profile.form.newPassword')}>
                            <PasswordInput name="password" />
                        </Field>
                        <Field name="confirmPassword" label={i18n('pages.profile.form.confirmPassword')}>
                            <PasswordInput name="confirmPassword" />
                        </Field>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {updateMutation.isPending ? i18n('pages.profile.saving') : i18n('pages.profile.save')}
                        </button>
                    </div>
                </Form>
            </Summary>
        </Page>
    );
};

export default ProfilePage;
