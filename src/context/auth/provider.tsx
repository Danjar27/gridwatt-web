import type { Actions, Context, Credentials } from '@context/auth/interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext, AuthActions } from './context.ts';
import { apiClient } from '@lib/api-client.ts';
import { useMemo } from 'react';

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    const queryClient = useQueryClient();

    const { data: user = null, isLoading } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const hasTokens = apiClient.loadTokens();
            if (!hasTokens) {
                return null;
            }
            try {
                return await apiClient.getMe();
            } catch (error) {
                // Only clear tokens if we are sure the session is invalid (401)
                if (error instanceof Error && error.message.includes('401')) {
                    console.error('Initial session restoration failed: Unauthorized');
                    apiClient.clearTokens();

                    return null;
                }

                // For network errors or other temporary issues, we don't clear tokens
                // but we throw so TanStack Query can retry if configured
                console.error('Initial session restoration failed (temporary error):', error);
                throw error;
            }
        },
        retry: (failureCount, error) => {
            if (error instanceof Error && error.message.includes('401')) {
                return false;
            }

            return failureCount < 3;
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });

    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: Credentials) => {
            const { user: userData } = await apiClient.login(email, password);

            return userData;
        },
        onSuccess: (userData) => {
            queryClient.setQueryData(['auth', 'me'], userData);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await apiClient.logout();
        },
        onSuccess: () => {
            queryClient.setQueryData(['auth', 'me'], null);
            queryClient.clear();
        },
    });

    const login = async (email: string, password: string) => {
        await loginMutation.mutateAsync({ email, password });
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    const context: Context = useMemo(
        () => ({
            user: user,
            isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
            isAuthenticated: user !== null,
        }),
        [user, isLoading, loginMutation.isPending, logoutMutation.isPending]
    );

    const actions: Actions = useMemo(
        () => ({
            login,
            logout,
        }),
        [login, logout]
    );

    return (
        <AuthContext value={context}>
            <AuthActions value={actions}>{children}</AuthActions>
        </AuthContext>
    );
};

export default AuthProvider;
