"use client";

import useUser from "@/store/user-store";
import { ReactNode, useEffect, useState } from "react";
import useSocket from "@/store/socket-store";
import { useAuth } from "@clerk/nextjs";
import { isLocal } from "@/constants/env";
import UltimateLoader from "@/components/loaders/loading-screen";

export default function AuthWrapper({ children }: { children: ReactNode }) {
    const [isMounting, setIsMounting] = useState(true);

    const { isLoaded, getToken, isSignedIn } = useAuth();

    const user = useUser((s) => s.user);
    const loading = useUser((s) => s.loading);
    const getUser = useUser((s) => s.getUser);
    const clearUser = useUser((s) => s.clearUser);
    const connectSocket = useSocket((s) => s.connectSocket);
    const disconnectSocket = useSocket((s) => s.disconnectSocket);

    const isLoading = isMounting || (isLocal ? loading : !isLoaded || (isSignedIn && loading));

    useEffect(() => {
        if (isMounting || (!isLocal && (!isLoaded || !isSignedIn))) return;

        (async () => {
            const token = isLocal ? localStorage.getItem("test_user_id") : await getToken();
            console.log(token);
            if (token) await getUser(token);
        })();
    }, [getToken, getUser, isLoaded, isMounting, isSignedIn]);

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
            const token = isLocal ? localStorage.getItem("test_user_id") : await getToken();
            if (active && token) connectSocket(token);
        })();

        return () => {
            active = false;
        };
    }, [connectSocket, getToken, loading, user]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsMounting(false);
        }, 800);

        return () => clearTimeout(timeout);
    }, []);

    if (isLoading) return <UltimateLoader />;

    return children;
}
