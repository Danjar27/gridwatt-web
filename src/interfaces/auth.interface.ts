import type { User } from '@interfaces/user.interface.ts';

export interface AuthData {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}
