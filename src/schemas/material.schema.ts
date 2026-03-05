import { z } from 'zod';

export const stockSchema = z.object({
    id: z.string().min(1),
    availableQuantity: z.number(),
    minimumStock: z.number(),
});

export const materialSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    unit: z.string().min(1),
    totalStock: z.number().optional(),
});

export type StockInput = z.infer<typeof stockSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
