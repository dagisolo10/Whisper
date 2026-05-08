"use client";

import useUser from "@/store/auth-store";
import { ReactNode, useEffect } from "react";
import Loader from "../loader";
import { useAuth } from "@clerk/nextjs";

export default function AuthWrapper({ children }: { children: ReactNode }) {
    const { user, loading, getUser } = useUser();
    const { isLoaded, getToken, isSignedIn } = useAuth();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        async function fetchUser() {
            const token = await getToken();
            await getUser(token ?? "");
        }

        fetchUser();
    }, [getToken, getUser, isLoaded, isSignedIn]);

    if (!isLoaded || (isSignedIn && loading))
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
                <Loader loading={loading} />
            </div>
        );

    if (isSignedIn && !user) return <div className="flex h-screen items-center justify-center">Error loading profile...</div>;

    return children;
}
