import { z } from 'zod';

export const GenerateBlogBodySchema = z.object({
    topic: z.string().min(1, 'Topic is required'),
});

export type GenerateBlogBody = z.infer<typeof GenerateBlogBodySchema>;
