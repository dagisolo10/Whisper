import { ReactNode } from "react";
import Filters from "@/components/home/filters";
import Sidebar from "@/components/home/side-bar";
import ChatList from "@/components/home/chat-list";

export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <main className="relative flex h-screen overflow-auto md:overflow-hidden">
            <Sidebar />
            <div className="grid flex-1 grid-cols-1 md:grid-cols-[90px_340px_minmax(0,1fr)]">
                <div className="hidden md:block">
                    <Filters />
                </div>
                <div className="hidden md:block">
                    <ChatList />
                </div>
                <div className="h-full min-w-0 overflow-y-auto">{children}</div>
            </div>
        </main>
    );
}
