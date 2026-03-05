import { z } from 'zod';

export const sealSchema = z.object({
    id: z.number().int().positive(),
    type: z.string().min(1),
});

export type SealInput = z.infer<typeof sealSchema>;
