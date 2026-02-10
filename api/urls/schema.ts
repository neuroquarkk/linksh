import { z } from 'zod';

export const shortenBodySchema = z.object({
    longUrl: z.url().trim(),
    expiresAt: z.coerce
        .date()
        .min(new Date(), 'Expiration must me in future')
        .optional(),
});

export const redirectParam = z.object({
    short: z.string().trim(),
});

export type ShortenBody = z.infer<typeof shortenBodySchema>;
export type RedirectParam = z.infer<typeof redirectParam>;
