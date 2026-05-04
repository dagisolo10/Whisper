import { z } from "zod";

export function sanitizeUsername(value: string): string {
    return value
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9._]/g, "")
        .replace(/[._]{2,}/g, (m) => m.charAt(0))
        .replace(/^[._]+|[._]+$/g, "")
        .slice(0, 24);
}

export const createUserPayloadSchema = z.object({
    name: z.string().trim().min(3, "Display name must be at least 3 characters long"),
    username: z.string().transform(sanitizeUsername).pipe(z.string().min(3, "Username must be at least 3 characters long after sanitization")),
    bio: z
        .string()
        .trim()
        .max(160, "Bio must be 160 characters or fewer")
        .optional()
        .transform((bio: string | undefined) => (bio && bio.length > 0 ? bio : undefined)),
    avatarUrl: z
        .string()
        .trim()
        .transform((avatarUrl: string | undefined) => (avatarUrl && avatarUrl.length > 0 ? avatarUrl : null))
        .optional(),
});

export const updateUserPayloadSchema = z.object({
    name: z.string().trim().min(3, "Display name must be at least 3 characters long").optional(),
    username: z.string().transform(sanitizeUsername).pipe(z.string().min(3, "Username must be at least 3 characters long after sanitization")).optional(),
    bio: z
        .string()
        .trim()
        .max(160, "Bio must be 160 characters or fewer")
        .optional()
        .transform((bio: string | undefined) => (bio && bio.length > 0 ? bio : null)),
    avatarUrl: z
        .string()
        .trim()
        .transform((avatarUrl: string | undefined) => (avatarUrl && avatarUrl.length > 0 ? avatarUrl : null))
        .optional(),
});

export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;
