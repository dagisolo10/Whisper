"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Filters({ setSidebar }: { setSidebar: (val: boolean) => void }) {
    return (
        <div className="flex flex-col items-center gap-2 border-r px-2">
            <div className="flex h-18.5 items-center justify-center">
                <Button onClick={() => setSidebar(true)} variant={"ghost"} size={"icon"}>
                    <Menu className="size-5" />
                </Button>
            </div>

            {chatFilters.map((filter) => (
                <button
                    key={filter.label}
                    className={cn(
                        "rounded-2xl px-2 py-3 text-center transition",
                        filter.active ? "bg-card text-foreground border-border ring-border shadow-sm ring-1" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                >
                    <div className="text-muted-foreground text-xs font-semibold">{filter.count}</div>
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
