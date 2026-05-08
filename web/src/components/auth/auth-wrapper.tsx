"use client";

import useUser from "@/store/auth-store";
import { ReactNode, useEffect } from "react";
import Loader from "../loader";
import { useAuth } from "@clerk/nextjs";

export default function AuthWrapper({ children }: { children: ReactNode }) {
    const { user, loading, getUser } = useUser();
    const { isLoaded, getToken } = useAuth();

    useEffect(() => {
        if (!isLoaded) return;
        async function fetchUser() {
            const token = await getToken();
            getUser(token ?? "");
        }

        fetchUser();
    }, [getToken, getUser, isLoaded]);

    if (loading)
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
                <Loader loading={loading} />
            </div>
        );

    if (!user) return <div className="flex h-screen items-center justify-center">Error loading profile...</div>;

    return children;
}
