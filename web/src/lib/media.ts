const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === "production"
        ? (() => {
              throw new Error("NEXT_PUBLIC_API_URL must be set in production");
          })()
        : "http://localhost:3000");

export function resolveMediaUrl(pathOrUrl?: string | null) {
    if (!pathOrUrl) return null;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

    return `${apiBaseUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
