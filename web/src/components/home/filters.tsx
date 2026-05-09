"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import useUtil from "@/store/util-store";
import useUser from "@/store/auth-store";
import Image from "next/image";
import { getInitials } from "@/utils/helper-functions";

export default function Filters() {
    const setSidebar = useUtil((s) => s.setSidebar);
    const user = useUser((s) => s.user);

    return (
        <div className="flex h-screen flex-col items-center gap-2 border-r px-2">
            <div className="flex flex-col items-center gap-4 py-4">
                <p>{getInitials(user?.name ?? "User")}</p>
                <div className="bg-primary/10 size-12 rounded-full border p-2">
                    <div className="relative size-full overflow-hidden rounded-full">
                        {user?.mainAvatarUrl && <Image src={user.mainAvatarUrl} fill alt={user.name} unoptimized />}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center">
                <Button onClick={() => setSidebar(true)} variant={"ghost"} size={"icon"}>
                    <Menu className="size-5" />
                </Button>
            </div>

            {chatFilters.map((filter) => (
                <button
                    key={filter.label}
                    className={cn(
                        "rounded-2xl px-2 py-3 text-center transition",
                        filter.active
                            ? "bg-card text-foreground border-border ring-border shadow-sm ring-1"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                >
                    <div className={cn("text-xs font-semibold", filter.active ? "text-foreground" : "text-muted-foreground")}>{filter.count}</div>
                    <div className="mt-1 text-xs leading-tight font-medium">{filter.label}</div>
                </button>
            ))}
        </div>
    );
}

const chatFilters = [
    { label: "All chats", count: 68, active: true },
    { label: "Unread", count: 9 },
    // { label: "Personal", count: 65 },
    // { label: "Groups", count: 2 },
    // { label: "Channels", count: 1 },
];
