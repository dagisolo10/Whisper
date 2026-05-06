"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { Bell, Compass, Image as ImageIcon, MessageCircle, PlayCircle, Sparkles } from "lucide-react";

const sidebarLinks = [
    { label: "Chats", icon: MessageCircle, active: true },
    { label: "Discover", icon: Compass },
    { label: "Shorts", icon: PlayCircle },
    { label: "Moments", icon: ImageIcon },
    { label: "Whisper AI", icon: Sparkles },
    { label: "Notifications", icon: Bell },
];

interface SidebarProp {
    sidebar: boolean;
    setSidebar: (value: boolean) => void;
}

export default function Sidebar({ sidebar, setSidebar }: SidebarProp) {
    const { user } = useUser();
    return (
        <div
            onClick={() => setSidebar(false)}
            className={cn(
                "fixed inset-0 z-50 hidden transition-colors duration-300 lg:block",
                sidebar ? "pointer-events-auto bg-black/50" : "pointer-events-none bg-transparent",
            )}
        >
            <aside
                onClick={(event) => event.stopPropagation()}
                className={cn(
                    sidebar ? "translate-x-0" : "-translate-x-full",
                    "bg-background absolute top-0 left-0 flex h-full w-1/4 flex-col gap-4 border-r px-4 py-6 transition-transform duration-500",
                )}
            >
                <div className="flex items-center gap-4 px-2">
                    <UserButton />

                    <div>
                        <p className="text-sm font-semibold">{user?.fullName || "Whisper"}</p>
                        <p className="text-[11px] text-zinc-400">{user?.primaryEmailAddress?.emailAddress || "Signed in"}</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {sidebarLinks.map(({ label, icon: Icon, active }) => (
                        <Button
                            key={label}
                            variant={"ghost"}
                            className={cn(active ? "" : "text-muted-foreground", "h-10 w-full justify-start gap-3 rounded-xl px-4 text-sm")}
                        >
                            <Icon className="size-5" />
                            <span>{label}</span>
                        </Button>
                    ))}
                </nav>
            </aside>
        </div>
    );
}
