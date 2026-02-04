import type { Actions, Context } from './interface.ts';

import { createContext, useContext } from 'react';

export const AuthContext = createContext<Context>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
});

export const AuthActions = createContext<Actions>({
    login: async () => {},
    logout: async () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export const useAuthActions = () => useContext(AuthActions);
