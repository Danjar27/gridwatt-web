import { z } from 'zod';

export const stockCreateSchema = z.object({
    id: z.string().min(1),
    minimumStock: z.number().min(0).optional(),
});

export const stockIngressSchema = z.object({
    quantity: z.number().positive(),
    notes: z.string().optional(),
});

export type StockCreateInput = z.infer<typeof stockCreateSchema>;
export type StockIngressInput = z.infer<typeof stockIngressSchema>;
