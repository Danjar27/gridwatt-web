import type { Actions, Context, Credentials } from '@context/auth/interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { useQuery, useMutation, useQueryClient, useIsRestoring } from '@tanstack/react-query';
import { AuthContext, AuthActions } from './context.ts';
import { apiClient } from '@lib/api-client.ts';
import { prefetchTechnicianData } from '@lib/technician-prefetch.ts';
import { useMemo, useEffect, useRef } from 'react';

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    const queryClient = useQueryClient();
    const isRestoring = useIsRestoring();

    const { data: user = null, isLoading } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const hasTokens = apiClient.loadTokens();
            if (!hasTokens) {
                return null;
            }
            try {
                const me = await apiClient.getMe();
                if (me?.role?.name === 'technician') {
                    prefetchTechnicianData().catch(() => {});
                }

                return me;
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
            await apiClient.login(email, password);

            // Fetch full user data (with tenant info) right after login
            return apiClient.getMe();
        },
        onSuccess: (userData) => {
            queryClient.setQueryData(['auth', 'me'], userData);
            if (userData?.role?.name === 'technician') {
                prefetchTechnicianData().catch(() => {});
            }
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
        return await loginMutation.mutateAsync({ email, password });
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    // Periodic prefetch for technicians (every 10 minutes while online)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        if (user?.role?.name === 'technician' && navigator.onLine) {
            // Run immediately on mount/change, then every 10 minutes
            prefetchTechnicianData().catch(() => {});
            intervalRef.current = setInterval(() => {
                if (navigator.onLine) {
                    prefetchTechnicianData().catch(() => {});
                }
            }, 10 * 60 * 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [user?.role?.name]);

    const context: Context = useMemo(
        () => ({
            user: user,
            isLoading: isLoading || isRestoring || loginMutation.isPending || logoutMutation.isPending,
            isAuthenticated: user !== null,
        }),
        [user, isLoading, isRestoring, loginMutation.isPending, logoutMutation.isPending]
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
