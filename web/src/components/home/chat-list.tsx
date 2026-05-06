import { Input } from "../ui/input";

import { cn } from "@/lib/utils";
import { Search, BadgeCheck } from "lucide-react";
import { conversations } from "@/mock/conversations";

export default function ChatList() {
    return (
        <div className="h-screen border-r">
            <div className="p-4 sm:px-6">
                <div className="text-muted-foreground group border-input flex h-10 items-center rounded-full border px-4">
                    <Search className="group-focus-within:text-primary size-4" />
                    <Input placeholder="Search conversations..." className="border-none bg-transparent! focus-visible:border-0 focus-visible:ring-0" />
                </div>
            </div>

            <div className="scrollbar-thin scrollbar-track-background scrollbar-thumb-accent h-[calc(100%-74px)] overflow-y-auto">
                {conversations.map((conversation, index) => (
                    <article key={`${conversation.name}-${index}`} className="hover:bg-accent/40 flex cursor-pointer items-center gap-3 p-4 transition sm:px-6">
                        <div className={cn(conversation.color, "flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-xs font-semibold text-white shadow-sm")}>
                            {conversation.avatar}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <h2 className="font-jakarta truncate text-xs font-medium">{conversation.name}</h2>
                                    {conversation.verified && <BadgeCheck className="size-4 shrink-0 text-sky-500" />}
                                </div>
                                <span className="text-muted-foreground text-ss shrink-0 font-medium">{conversation.time}</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <p className="text-muted-foreground text-ss mt-1 truncate font-medium">{conversation.preview}</p>
                                <div className="bg-primary/70 flex size-4 items-center justify-center rounded-full">
                                    <p className="text-ss">4</p>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
