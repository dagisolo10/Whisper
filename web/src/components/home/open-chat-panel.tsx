"use client";

import { useState } from "react";

import ChatView from "@/components/home/chat-view";
import NoOpenChat from "./no-open-chat";

export default function OpenChatPanel() {
    const [chatSelected, setChatSelected] = useState(false);

    if (!chatSelected) return <NoOpenChat onClick={() => setChatSelected(true)} />;

    return <ChatView onClose={() => setChatSelected(false)} />;
}
