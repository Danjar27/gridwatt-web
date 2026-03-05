import { z } from 'zod';

export const jobSchema = z.object({
    technicianId: z.number().int().positive(),
    startDateTime: z.string().min(1),
    endDateTime: z.string().optional(),
    jobType: z.string().min(1),
    jobStatus: z.string().optional(),
    sealPk: z.number().int().positive().optional(),
    sealNumber: z.number().int().positive().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    gpsLocation: z.string().optional(),
    meterReading: z.string().optional(),
    notes: z.string().optional(),
});

export type JobInput = z.infer<typeof jobSchema>;
