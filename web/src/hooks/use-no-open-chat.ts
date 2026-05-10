"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/store/user-store";
import useRoom from "@/store/room-store";
import { toast } from "sonner";
import { User } from "@/types/model";

export default function useNoOpenChat() {
    const rooms = useRoom((s) => s.rooms);
    const lastToken = useUser((s) => s.lastToken);
    const searching = useUser((s) => s.searching);
    const createRoom = useRoom((s) => s.createRoom);
    const searchUser = useUser((s) => s.searchUser);

    const router = useRouter();

    const [query, setQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [result, setResult] = useState<User[]>([]);

    const requestIdRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleQueryChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setQuery(value);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (value.trim().length > 0) {
            const currentRequestId = ++requestIdRef.current;

            timeoutRef.current = setTimeout(async () => {
                if (!lastToken) return;

                const result = await searchUser(value, lastToken);
                if (currentRequestId === requestIdRef.current) {
                    setResult(result);
                }
            }, 500);
        } else {
            setResult([]);
        }
    }

    async function handleUserClick(partnerId: string) {
        if (isCreating || !lastToken) return;
        setIsCreating(true);

        try {
            const room = rooms.find((room) => room.members.some((mem) => mem.userId === partnerId));

            if (!room) {
                toast.promise(createRoom({ partnerId }, lastToken), {
                    loading: "Starting conversation...",
                    success: (data) => {
                        if (!data) throw new Error("Failed to create room");
                        router.push(`/${data.id}`);
                        return "Conversation started";
                    },
                    error: (err: string) => err || "Failed to start conversation",
                });
            } else {
                router.push(`/${room.id}`);
            }
        } catch (error) {
            console.error("Navigation error:", error);
        } finally {
            setIsCreating(false);
        }
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            requestIdRef.current++;
        };
    }, []);

    const hasQuery = query.trim().length > 0;
    const showEmpty = !searching && hasQuery && result.length === 0;
    const showResults = !searching && result.length > 0;

    return {
        query,
        result,
        searching,
        showEmpty,
        showResults,
        handleUserClick,
        handleQueryChange,
    };
}
