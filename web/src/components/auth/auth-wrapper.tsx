"use client";

import useUser from "@/store/auth-store";
import { ReactNode, useEffect } from "react";
import Loader from "../loader";
import useSocket from "@/store/socket-store";
import { useAuth } from "@clerk/nextjs";

export default function AuthWrapper({ children }: { children: ReactNode }) {
    const noAuth = process.env.NEXT_PUBLIC_NO_AUTH === "true";
    const { isLoaded, getToken, isSignedIn } = useAuth();

    const user = useUser((s) => s.user);
    const loading = useUser((s) => s.loading);
    const getUser = useUser((s) => s.getUser);
    const clearUser = useUser((s) => s.clearUser);
    const connectSocket = useSocket((s) => s.connectSocket);
    const disconnectSocket = useSocket((s) => s.disconnectSocket);

    useEffect(() => {
        if (!noAuth && (!isLoaded || !isSignedIn)) return;

        (async () => {
            const token = noAuth ? localStorage.getItem("test_user_id") : await getToken();
            await getUser(token ?? "");
        })();
    }, [getToken, getUser, isLoaded, isSignedIn, noAuth]);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            disconnectSocket();
            clearUser();
            return;
        }
    }, [clearUser, disconnectSocket, loading, user]);

    useEffect(() => {
        if (!user || loading) return;

        let active = true;
        (async () => {
            const token = noAuth ? localStorage.getItem("test_user_id") : await getToken();
            connectSocket(token ?? "");
            if (active) connectSocket(token ?? "");
        })();

        return () => {
            active = false;
        };
    }, [connectSocket, getToken, loading, noAuth, user]);

    if (noAuth ? loading : !isLoaded || (isSignedIn && loading))
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader loading={loading} />
            </div>
        );

    // if (noAuth ? !user : isSignedIn && !user) return <div className="flex h-screen items-center justify-center">Error loading profile...</div>;

    return children;
}
