import { z } from 'zod';

export const userCreateSchema = z.object({
    name: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
    roleId: z.number().int().positive(),
    tenantId: z.number().int().positive().optional(),
});

export const userUpdateSchema = userCreateSchema.extend({
    password: z.string().min(6).optional(),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(6),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
