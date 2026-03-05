import { z } from 'zod';

export const sealSchema = z.object({
    id: z.number().int().positive(),
    type: z.string().min(1),
});

export const sealRangeSchema = z.object({
    type: z.string().min(1),
    from: z.number().int().min(1),
    to: z.number().int().min(1),
});

export type SealInput = z.infer<typeof sealSchema>;
export type SealRangeInput = z.infer<typeof sealRangeSchema>;
