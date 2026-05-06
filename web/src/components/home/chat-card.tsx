"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/mock/chat-thread";
import { CheckCheck, Check } from "lucide-react";

export default function ChatCard({ message }: { message: ChatMessage }) {
    const isMine = message.sender === "me";
    const Icon = message.read ? CheckCheck : Check;
    const hasImage = !!message.image || !!message.images;
    const cardStyle = isMine ? "bg-primary/50 text-primary-foreground" : "bg-card";
    const corners = hasImage && isMine ? "rounded-bl-lg" : hasImage && !isMine ? "rounded-br-lg" : isMine ? "rounded-t-lg rounded-bl-lg" : "rounded-t-lg rounded-br-lg";

    return (
        <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
            <div className="max-w-[clamp(30rem,60%,70%)] space-y-2">
                <div>
                    {message.image && (
                        <div className={cn("flex size-64 w-full items-center justify-center overflow-hidden rounded-t-lg")}>
                            <Image className="size-full object-cover" src="/images/coder.jpg" width={1024} height={1024} alt={message.image.label} />
                        </div>
                    )}

                    {message.images && (
                        <div className="grid grid-cols-2 gap-2">
                            {message.images.map((image) => (
                                <div key={image.label} className={cn("flex items-center justify-center overflow-hidden rounded-t-lg")}>
                                    <Image className="size-full object-cover" src="/images/coder.jpg" width={1024} height={1024} alt={image.label} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={cn("p-3 text-xs shadow-sm", cardStyle, corners)}>
                        <p>{message.text}</p>
                    </div>
                </div>

                <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <p className={cn("text-muted-foreground px-2 text-xs", isMine ? "text-right" : "text-left")}>{message.time}</p>
                    <Icon className={cn(message.read ? "text-emerald-500" : "text-destructive", isMine ? "block" : "hidden", "size-4")} />
                </div>
            </div>
        </div>
    );
}
