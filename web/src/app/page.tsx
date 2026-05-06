"use client";

import { useState } from "react";

import Sidebar from "@/components/home/side-bar";
import OpenChatPanel from "@/components/home/open-chat-panel";
import Filters from "@/components/home/filters";
import ChatList from "@/components/home/chat-list";

export default function Home() {
    const [sidebar, setSidebar] = useState(false);

    return (
        <main className="relative h-screen overflow-hidden">
            <Sidebar sidebar={sidebar} setSidebar={(val) => setSidebar(val)} />

            <div className="grid flex-1 grid-cols-[90px_340px_minmax(0,1fr)]">
                <Filters setSidebar={(val) => setSidebar(val)} />
                <ChatList />
                <OpenChatPanel />
            </div>
        </main>
    );
}
