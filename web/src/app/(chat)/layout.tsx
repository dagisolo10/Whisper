import { ReactNode } from "react";
import Filters from "@/components/home/filters";
import Sidebar from "@/components/home/side-bar";
import ChatList from "@/components/home/chat-list";

export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <main className="relative flex h-screen overflow-hidden">
            <Sidebar />
            <div className="grid flex-1 grid-cols-[90px_340px_minmax(0,1fr)]">
                <Filters />
                <ChatList />
                <div>{children}</div>
            </div>
        </main>
    );
}
