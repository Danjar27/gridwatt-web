import { z } from 'zod';

export const areaCoordinateSchema = z.object({
    lat: z.number(),
    lng: z.number(),
});

export const mapAreaSchema = z.object({
    color: z.string().optional(),
    coordinates: z.array(areaCoordinateSchema).min(3),
    technicianId: z.number().int().positive().nullable().optional(),
});

export type AreaCoordinateInput = z.infer<typeof areaCoordinateSchema>;
export type MapAreaInput = z.infer<typeof mapAreaSchema>;
