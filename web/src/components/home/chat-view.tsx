import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { chatThread } from "@/mock/chat-thread";
import ChatCard from "@/components/home/chat-card";
import { BadgeCheck, Info, Paperclip, Phone, SendHorizontal, Smile, Video, X } from "lucide-react";

export default function ChatView({ onClose }: { onClose: () => void }) {
    const { participant, messages } = chatThread;

    return (
        <section className="hidden h-screen min-w-0 flex-1 flex-col xl:flex">
            <header className="border-border bg-background/95 flex items-center justify-between border-b px-6 py-4 backdrop-blur">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className={cn(
                                participant.color,
                                "flex size-8 items-center justify-center rounded-full bg-linear-to-br text-xs font-semibold text-white shadow-sm",
                            )}
                        >
                            {participant.avatar}
                        </div>
                        <div className="absolute right-0 bottom-0 size-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <h2 className="font-jakarta text-sm font-semibold">{participant.name}</h2>
                            <BadgeCheck className="size-4 text-sky-500" />
                        </div>
                        <p className="text-xs font-semibold text-emerald-500">{participant.status}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose} aria-label="Close chat">
                        <X className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="Phone call">
                        <Phone className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="Video call">
                        <Video className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="Info dropdown">
                        <Info className="size-4" />
                    </Button>
                </div>
            </header>

            <div className="scrollbar-thin scrollbar-track-background scrollbar-thumb-accent flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
                    <div className="text-muted-foreground text-ss text-center tracking-[0.24em] uppercase">Today</div>

                    {messages.map((message) => (
                        <ChatCard key={message.id} message={message} />
                    ))}
                </div>
            </div>

            <div className="border-border bg-background flex items-center gap-3 border border-t px-4 py-5 shadow-sm">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Paperclip className="size-4" />
                </Button>

                <Input placeholder="Message" className="border-none" />

                <Button variant="ghost" size="icon" className="rounded-full">
                    <Smile className="size-4" />
                </Button>

                <Button size="icon" className="rounded-full">
                    <SendHorizontal className="size-4" />
                </Button>
            </div>
        </section>
    );
}
