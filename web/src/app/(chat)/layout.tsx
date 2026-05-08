import { ReactNode } from "react";
import Filters from "@/components/home/filters";
import Sidebar from "@/components/home/side-bar";
import ChatList from "@/components/home/chat-list";

export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <main className="relative flex h-screen overflow-auto md:overflow-hidden">
            <Sidebar />
            <div className="grid flex-1 grid-cols-1 min-[540px]:grid-cols-[90px_min(35%,300px)_minmax(0,1fr)]">
                <div className="hidden min-[540px]:block">
                    <Filters />
                </div>
                <div className="hidden min-[540px]:block">
                    <ChatList />
                </div>
                <div className="min-w-0">{children}</div>
            </div>
        </main>
    );
}
