import { z } from 'zod';

export const activitySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    contractPrice: z.number().optional(),
    technicianPrice: z.number().optional(),
});

export type ActivityInput = z.infer<typeof activitySchema>;
