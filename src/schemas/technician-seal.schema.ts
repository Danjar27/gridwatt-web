import { z } from 'zod';

export const technicianSealSchema = z.object({
    technicianId: z.number().int().positive(),
    sealId: z.number().int().positive(),
    fromNumber: z.number().int().min(1),
    toNumber: z.number().int().min(1),
});

export type TechnicianSealInput = z.infer<typeof technicianSealSchema>;
