import { ReactNode } from "react";
import Filters from "@/components/home/filters";
import Sidebar from "@/components/home/side-bar";
import ChatList from "@/components/home/chat-list";

export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <main className="relative flex h-screen overflow-auto md:overflow-hidden">
            <Sidebar />
            <div className="chat-md:grid-cols-[90px_min(35%,300px)_minmax(0,1fr)] grid flex-1 grid-cols-1">
                <div className="chat-md:block hidden">
                    <Filters />
                </div>
                <div className="chat-md:block hidden">
                    <ChatList />
                </div>
                <div className="min-w-0">{children}</div>
            </div>
        </main>
    );
}
