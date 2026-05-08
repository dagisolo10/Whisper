"use client";
import { useParams } from "next/navigation";
import useRoom from "@/store/room-store";
import { useEffect } from "react";
import OpenChatPanel from "@/components/home/open-chat";
import useUser from "@/store/auth-store";

export default function ChatPage() {
    const params = useParams();
    const roomId = params.id as string;

    const { lastToken } = useUser();
    const { getConversation } = useRoom();

    useEffect(() => {
        if (roomId) getConversation(roomId, "lastToken");
    }, [roomId, getConversation, lastToken]);

    return <OpenChatPanel />;
}
