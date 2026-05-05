type ClerkErrorLike = {
    errors?: Array<{
        longMessage?: string;
        message?: string;
    }>;
};

export function getClerkErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
    const clerkErrors = (error as ClerkErrorLike | undefined)?.errors;

    if (Array.isArray(clerkErrors) && clerkErrors.length > 0) {
        const message = clerkErrors
            .map((entry) => entry.longMessage || entry.message)
            .filter(Boolean)
            .join(" ");

        if (message) {
            return message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}
