const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function resolveMediaUrl(pathOrUrl?: string | null) {
    if (!pathOrUrl) return null;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

    return `${apiBaseUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
