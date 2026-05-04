type ActionResponse<T> = { data?: T; success: true } | { error: string; success: false };

export default async function wrapper<T>(action: () => Promise<T>, actionName: string): Promise<ActionResponse<T>> {
    try {
        return { data: await action(), success: true };
    } catch (err) {
        console.error(`[${actionName}]`, err);
        return { error: err instanceof Error ? err.message : `Error in ${actionName}`, success: false };
    }
}
