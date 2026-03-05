import { z } from 'zod';

export const jobMaterialSchema = z.object({
    materialId: z.string().min(1),
    quantity: z.number().positive(),
});

export type JobMaterialInput = z.infer<typeof jobMaterialSchema>;
