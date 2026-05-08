import { z } from "zod";

export function sanitizeUsername(value: string): string {
    return value
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9._]/g, "")
        .replace(/[._]{2,}/g, (m) => m.charAt(0))
        .replace(/^[._]+|[._]+$/g, "")
        .slice(0, 24)
        .replace(/^[._]+|[._]+$/g, "");
}

const MAX_AVATAR_URLS = 10;
const MAX_AVATAR_URL_LENGTH = 2048;
const imageUrlSchema = z.string().trim().min(1, "Image URL cannot be empty").max(MAX_AVATAR_URL_LENGTH, "Image URL is too long");

function normalizeImageUrls(values?: string[] | null) {
    if (!values) return [];

    return values.map((value) => value.trim()).filter((value) => value.length > 0);
}

export const createUserPayloadSchema = z.object({
    name: z.string().trim().min(3, "Display name must be at least 3 characters long"),
    username: z.string().transform(sanitizeUsername).pipe(z.string().min(3, "Username must be at least 3 characters long after sanitization")),
    bio: z
        .string()
        .trim()
        .max(160, "Bio must be 160 characters or fewer")
        .transform((bio: string | undefined) => (bio && bio.length > 0 ? bio : undefined))
        .optional(),
    mainAvatarUrl: z
        .string()
        .trim()
        .nullable()
        .transform((avatarUrl) => (avatarUrl && avatarUrl.length > 0 ? avatarUrl : null))
        .optional(),
    avatarUrls: z.array(imageUrlSchema).max(MAX_AVATAR_URLS, `At most ${MAX_AVATAR_URLS} avatars allowed`).transform(normalizeImageUrls).optional(),
});

export const updateUserPayloadSchema = z.object({
    name: z.string().trim().min(3, "Display name must be at least 3 characters long").optional(),
    username: z.string().transform(sanitizeUsername).pipe(z.string().min(3, "Username must be at least 3 characters long after sanitization")).optional(),
    bio: z
        .string()
        .trim()
        .max(160, "Bio must be 160 characters or fewer")
        .transform((bio: string | undefined) => (bio && bio.length > 0 ? bio : null))
        .optional(),
    mainAvatarUrl: z
        .string()
        .trim()
        .nullable()
        .transform((avatarUrl) => (avatarUrl && avatarUrl.length > 0 ? avatarUrl : null))
        .optional(),
    avatarUrls: z.array(imageUrlSchema).max(MAX_AVATAR_URLS, `At most ${MAX_AVATAR_URLS} avatars allowed`).transform(normalizeImageUrls).optional(),
});

export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;
