"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import useUtil from "@/store/util-store";
import useUser from "@/store/user-store";
import Image from "next/image";
import { getInitials } from "@/utils/helper-functions";
import { isLocal } from "@/constants/env";
import { UserButton } from "@clerk/nextjs";

const chatFilters = [
    { label: "All chats", count: 68, active: true },
    { label: "Unread", count: 9 },
];

export default function Filters() {
    const setSidebar = useUtil((s) => s.setSidebar);
    const user = useUser((s) => s.user);

    return (
        <div className="flex h-screen flex-col items-center gap-2 border-r px-2">
            <div className="my-6 flex items-center justify-center">
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

            <div className="mt-auto flex flex-col items-center gap-2 py-4">
                {isLocal ? (
                    <>
                        <p className="font-semibold">{getInitials(user?.name ?? "- -")}</p>
                        <div className="size-8 rounded-full">
                            <div className="relative size-full overflow-hidden rounded-full">
                                {user?.mainAvatarUrl && <Image src={user.mainAvatarUrl} fill alt={user.name} unoptimized />}
                            </div>
                        </div>
                    </>
                ) : (
                    <UserButton />
                )}
            </div>
        </div>
    );
}
