import type { SubmitEvent } from 'react';

import { useNavigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

import Logo from '@components/atoms/Logo';
import { useAuthActions, useAuthContext } from '@context/auth/context.ts';

const LoginPage = () => {
    const i18n = useTranslations();

    const { isLoading: authLoading } = useAuthContext();
    const { login } = useAuthActions();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        try {
            const user = await login(email, password);
            const role = user?.role?.name;
            const destination = role === 'admin' ? '/tenants' : role === 'technician' ? '/jobs' : '/dashboard';
            navigate(destination, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : i18n('errors.common'));
        }
    };

    const isLoading = authLoading;

    return (
        <div className="flex flex-col h-dvh items-center justify-center bg-primary-500 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <div className="mb-12 gap-2 flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center">
                        <Logo className="text-main-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{i18n('brand')}</h1>
                    <p className="text-sm text-gray-500">{i18n('auth.label')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            {i18n('auth.email.label')}
                        </label>
                        <div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder={i18n('auth.email.placeholder')}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            {i18n('auth.password.label')}
                        </label>
                        <div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder={i18n('auth.password.placeholder')}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="cursor-pointer w-full rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-500/90 disabled:opacity-50"
                        >
                            {isLoading ? i18n('auth.submit.loading') : i18n('auth.submit.label')}
                        </button>
                    </div>
                </form>
            </div>
            <span className="text-center mt-4 text-xs text-white/40">
                {i18n('rights', { year: new Date().getFullYear() })}
            </span>
        </div>
    );
};

export default LoginPage;
