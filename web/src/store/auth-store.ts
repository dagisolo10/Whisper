import api from "@/lib/axios";
import { create } from "zustand";
import { isAxiosError } from "axios";
import { User } from "@/types/model";
import { UpdateUserPayload } from "@/types/payloads";
import { UserResponse, UserSearchResponse } from "@/types/response";

interface AuthStore {
    user: User | null;

    loading: boolean;
    error: string | null;

    lastToken: string | null;

    searchResult: User[];
    abortController: AbortController | null;

    setUser: (user: User) => void;
    getUser: (token: string) => Promise<void>;

    searchUser: (query: string) => Promise<void>;
    updateUser: (payload: UpdateUserPayload) => Promise<void>;

    clearUser: () => void;
    retryUser: () => Promise<void>;
}

const useUser = create<AuthStore>((set, get) => ({
    user: null,
    loading: false,
    error: null,
    lastToken: null,
    abortController: null,
    searchResult: [],

    setUser: (user: User) => {
        const controller = get().abortController;
        if (controller) controller.abort();
        set({ user, loading: false, error: null, abortController: null });
    },

    getUser: async (token: string) => {
        await fetchUser(token, set, get);
    },

    searchUser: async (query) => {
        const token = get().lastToken;
        const normalizedQuery = query.trim();

        if (!normalizedQuery) {
            set({ searchResult: [] });
            return;
        }

        if (!token) {
            set({ error: "Missing auth token.", loading: false });
            return;
        }

        try {
            const res = await api.get<UserSearchResponse>("/user/search", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    name: normalizedQuery,
                    username: normalizedQuery,
                },
            });

            const data = res.data;

            if (!data.success) throw new Error(res.data.error);

            set({ searchResult: data.data });
        } catch (err) {
            console.error("Error white searching user", err);
            set({ searchResult: [] });
        }
    },

    updateUser: async (payload) => {
        const token = get().lastToken;

        if (!token) {
            set({ error: "Missing auth token.", loading: false });
            return;
        }

        try {
            const auth = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.patch<UserResponse>("/user", payload, auth);
            const data = res.data;

            if (!data.success) throw new Error(res.data.error);

            set({ user: data.data });
        } catch (err) {
            console.error("Error white updating user", err);
        }
    },

    retryUser: async () => {
        const token = get().lastToken;

        if (!token) {
            set({ error: "Missing auth token.", loading: false });
            return;
        }

        await fetchUser(token, set, get);
    },

    clearUser: () => {
        const controller = get().abortController;
        if (controller) controller.abort();
        set({
            user: null,
            loading: false,
            error: null,
            abortController: null,
            lastToken: null,
            searchResult: [],
        });
    },
}));

async function fetchUser(token: string, set: (partial: Partial<AuthStore>) => void, get: () => AuthStore) {
    const currentController = get().abortController;
    if (currentController) currentController.abort();

    const newController = new AbortController();

    if (!token) {
        set({
            user: null,
            loading: false,
            lastToken: null,
            abortController: null,
            error: "Missing auth token.",
        });
        return;
    }

    set({ loading: true, error: null, abortController: newController, lastToken: token });

    try {
        const auth = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get("/user", { ...auth, timeout: 8000, signal: newController.signal });
        const data = res.data;

        if (!data.success) {
            set({
                user: null,
                loading: false,
                abortController: null,
                error: data.error || "Failed to fetch user.",
            });
            return;
        }

        set({ user: data.data, loading: false, error: null, abortController: null });
    } catch (err: unknown) {
        const name = (err as { name?: string } | null)?.name;
        if (name === "CanceledError" || name === "AbortError") return;

        const backendError = isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined;
        const message =
            isAxiosError(err) && err.code === "ECONNABORTED"
                ? "Request timed out. Please check your connection."
                : (backendError ?? (err instanceof Error ? err.message : "Error fetching user."));
        console.error("Error fetching user in store", message);

        set({ user: null, loading: false, error: message, abortController: null });
    }
}
export default useUser;
