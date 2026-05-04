import { HttpError } from "@/lib/http-error";

interface Failure {
    error: string;
    success: false;
    status: number;
}

interface Success<T> {
    data: T;
    success: true;
}

type ActionResponse<T> = Success<T> | Failure;

export default async function wrapper<T>(action: () => Promise<T>, actionName: string): Promise<ActionResponse<T>> {
    try {
        return { data: await action(), success: true };
    } catch (err) {
        console.error(`[${actionName}]`, err);

        if (err instanceof HttpError) {
            return {
                error: err.message,
                status: err.status,
                success: false,
            };
        }

        return {
            error: process.env.NODE_ENV === "development" ? (err instanceof Error ? err.message : `Error in ${actionName}`) : "Something went wrong",
            status: 500,
            success: false,
        };
    }
}
