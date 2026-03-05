import { z } from 'zod';

export const tenantSchema = z.object({
    code: z.string().min(1).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
});

export type TenantInput = z.infer<typeof tenantSchema>;
