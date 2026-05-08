"use client";

import useUser from "@/store/auth-store";
import { ReactNode, useEffect } from "react";
import Loader from "../loader";

export default function AuthWrapper({ children }: { children: ReactNode }) {
    const { user, loading, getUser } = useUser();
    // const { isLoaded, isSignedIn, getToken } = useAuth();

    useEffect(() => {
        async function fetchUser() {
            const token = ""; //await getToken();
            getUser(token);
        }

        fetchUser();
    }, [getUser]);

    if (loading)
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                <Loader loading={loading} />
            </div>
        );

    if (!user) return <div className="flex h-screen items-center justify-center">Error loading profile...</div>;

    return children;
}
