import { z } from 'zod';

export const technicianStockSchema = z.object({
    technicianId: z.number().int().positive(),
    quantity: z.number().positive(),
});

export type TechnicianStockInput = z.infer<typeof technicianStockSchema>;
