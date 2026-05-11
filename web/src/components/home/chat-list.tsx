"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { ImageIcon, MessageSquarePlus, Search } from "lucide-react";
import useRoom from "@/store/room-store";
import useUser from "@/store/user-store";
import { useEffect } from "react";
import { formatDate, getInitials } from "@/utils/helper-functions";
import { resolveMediaUrl } from "@/lib/media";
import useSocket from "@/store/socket-store";
import TypingIndicator from "./indicators/typing-indicator";
import Skeleton from "../skeleton";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ChatList() {
    const pathname = usePathname();

    const user = useUser((s) => s.user);
    const rooms = useRoom((s) => s.rooms);
    const getRooms = useRoom((s) => s.getRooms);
    const lastToken = useUser((s) => s.lastToken);
    const onlineUsers = useSocket((s) => s.onlineUsers);
    const typingUsers = useSocket((s) => s.typingUsers);
    const fetchingRooms = useRoom((s) => s.fetchingRooms);

    useEffect(() => {
        if (lastToken) getRooms(lastToken);
    }, [getRooms, lastToken]);

    if (fetchingRooms) {
        return <Skeleton tag="rooms" />;
    }

    if (rooms.length === 0) {
        return (
            <div className="flex h-screen flex-col border-r">
                <div className="p-4 sm:px-6">
                    <div className="text-muted-foreground group border-input flex h-10 items-center rounded-full border px-4">
                        <Search className="group-focus-within:text-primary size-4" />
                        <Input placeholder="Search conversations..." className="border-none bg-transparent! focus-visible:border-0 focus-visible:ring-0" />
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center p-6 pt-24 text-center">
                    <div className="bg-primary/10 mb-4 flex size-16 items-center justify-center rounded-full">
                        <MessageSquarePlus className="text-primary size-8" />
                    </div>
                    <h3 className="text-foreground font-semibold">No conversations yet</h3>
                    <p className="text-muted-foreground mt-1 text-xs">Start a new whisper to begin chatting with your network.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen border-r">
            <div className="p-4 sm:px-6">
                <div className="text-muted-foreground group border-input flex h-10 items-center rounded-full border px-4">
                    <Search className="group-focus-within:text-primary size-4" />
                    <Input placeholder="Search conversations..." className="border-none bg-transparent! focus-visible:border-0 focus-visible:ring-0" />
                </div>
            </div>

            <div className="scrollbar-thin scrollbar-track-background scrollbar-thumb-accent h-[calc(100%-74px)] overflow-y-auto">
                {rooms.map((room) => {
                    const isActive = pathname === `/chats/${room.id}`;
                    const partner = user?.id ? room.members?.find((member) => member.userId !== user?.id)?.user : undefined;

                    if (!partner) return null;

                    const profile = partner.mainAvatarUrl;
                    const unreadCount = room.unreadCount;
                    const lastMessage = room.lastMessage;

                    const isOnline = onlineUsers.includes(partner.id);
                    const isTyping = (typingUsers[room.id] || []).filter((uId) => uId !== user?.id).length > 0;

                    return (
                        <Link href={"/chats/" + room.id} key={room.id} onClick={(e) => isActive && e.preventDefault()}>
                            <article className={cn(isActive && "bg-primary/25 pointer-events-none cursor-default", "hover:bg-accent/40 flex cursor-pointer items-center gap-3 p-4 transition sm:px-6")}>
                                <Avatar>
                                    <AvatarImage src={resolveMediaUrl(profile) ?? undefined} alt={partner.name} />
                                    <AvatarFallback>{getInitials(partner.name)}</AvatarFallback>
                                    <AvatarBadge className={cn(isOnline ? "bg-green-500" : "bg-zinc-600")} />
                                </Avatar>

                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="font-jakarta truncate text-xs font-medium">{partner?.name}</h2>
                                        <span className="text-muted-foreground shrink-0 text-[10px] font-medium">{room.lastMessageAt ? formatDate(room.lastMessageAt, "lastMessage") : ""}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {isTyping ? (
                                            <TypingIndicator isTyping={isTyping} small />
                                        ) : lastMessage?.messageType === "Image" ? (
                                            <div className="flex items-center gap-1">
                                                <ImageIcon className="text-primary size-3" />
                                                <p className="text-muted-foreground text-[10px] font-medium">{lastMessage.imageUrls.length > 1 ? `${lastMessage.imageUrls.length} images` : "Image"}</p>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground mt-1 truncate text-[10px] font-medium">{lastMessage?.textContent ?? "No Message"}</p>
                                        )}

                                        {unreadCount > 0 && (
                                            <div className="bg-primary/70 flex size-5 items-center justify-center rounded-full p-2">
                                                <p className="text-[10px]">{unreadCount}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
