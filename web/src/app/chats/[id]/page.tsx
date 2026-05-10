"use client";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import useRoom from "@/store/room-store";
import { useEffect } from "react";
import OpenChatPanel from "@/components/home/open-chat";
import useUser from "@/store/user-store";
import Skeleton from "@/components/skeleton";
import NoChatSelected from "../page";
import { toast } from "sonner";

export default function ChatPage() {
    const params = useParams();
    const roomId = params.id as string;
    const router = useRouter();

    const lastToken = useUser((s) => s.lastToken);
    const fetchingChat = useRoom((s) => s.fetchingChat);
    const activeRoomId = useRoom((s) => s.activeRoomId);
    const getConversation = useRoom((s) => s.getConversation);

    const hasError = !fetchingChat && !activeRoomId;
    const isLoading = fetchingChat || (activeRoomId !== roomId && !hasError);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (roomId && lastToken) {
                const result = await getConversation(roomId, lastToken);
                if (!cancelled && !result.success) {
                    toast.error("Chat not found");
                    router.replace("/");
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [roomId, getConversation, lastToken, router]);

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <AnimatePresence mode="popLayout">
                {hasError ? (
                    <motion.div
                        key="error-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full w-full"
                    >
                        <NoChatSelected />
                    </motion.div>
                ) : isLoading ? (
                    <motion.div
                        key="skeleton-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-10"
                    >
                        <Skeleton tag="chat" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="chat-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="h-full w-full"
                    >
                        <OpenChatPanel />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
