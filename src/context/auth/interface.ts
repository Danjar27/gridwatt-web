import type { User } from '@lib/api-client.ts';

export interface Context {
    /**
     * Stores the data of the currently authenticated user.
     * If the user is not authenticated, this value is `null`.
     */
    user: User | null;
    /**
     * Handy data redundancy to quickly check if the user is authenticated without
     * needing to check if `user` is null.
     */
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface Actions {
    /**
     * Attempts to log in a user with the provided email and password.
     * On success, updates the user state.
     */
    login: (email: string, password: string) => Promise<User | null>;
    /**
     * Logs out the current user and resets the user state.
     */
    logout: () => Promise<void>;
}

export interface Credentials {
    email: string;
    password: string;
}