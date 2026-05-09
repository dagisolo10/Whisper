"use client";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import useRoom from "@/store/room-store";
import { useEffect } from "react";
import OpenChatPanel from "@/components/home/open-chat";
import useUser from "@/store/auth-store";
import Skeleton from "@/components/skeleton";
import NoChatSelected from "../chat/page";

export default function ChatPage() {
    const params = useParams();
    const roomId = params.id as string;

    const lastToken = useUser((s) => s.lastToken);
    const fetchingChat = useRoom((s) => s.fetchingChat);
    const activeRoomId = useRoom((s) => s.activeRoomId);
    const getConversation = useRoom((s) => s.getConversation);

    const hasError = !fetchingChat && !activeRoomId;
    const isLoading = fetchingChat || (activeRoomId !== roomId && !hasError);

    useEffect(() => {
        if (roomId) getConversation(roomId, lastToken ?? "");
    }, [roomId, getConversation, lastToken]);

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
