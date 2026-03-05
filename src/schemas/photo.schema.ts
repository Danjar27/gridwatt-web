import { z } from 'zod';

export const photoSchema = z.object({
    type: z.string().min(1),
    dateTime: z.string().min(1),
    notes: z.string().optional(),
});

export type PhotoInput = z.infer<typeof photoSchema>;
