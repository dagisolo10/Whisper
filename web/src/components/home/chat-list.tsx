"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { ImageIcon, Search } from "lucide-react";
import useRoom from "@/store/room-store";
import useUser from "@/store/auth-store";
import { useEffect } from "react";
import Image from "next/image";
import { formateDate } from "@/utils/helper-functions";
import useMessage from "@/store/message-store";
import { resolveMediaUrl } from "@/lib/media";

export default function ChatList() {
    const pathname = usePathname();
    const { messages } = useMessage();
    const { rooms, getRooms } = useRoom();
    const { lastToken, user } = useUser();

    useEffect(() => {
        getRooms("lastToken");
    }, [getRooms, lastToken, messages.length]);

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
                    const isActive = pathname === `/${room.id}`;
                    const partner = room.members?.filter((member) => member.userId !== user?.id)[0].user;
                    const avatar = partner?.name
                        .split(" ")
                        .map((letter) => letter[0])
                        .join("");

                    const profile = partner.mainAvatarUrl;
                    const unreadCount = room.unreadCount;
                    const lastMessage = room.lastMessage;

                    // const avatarGallery = partner.avatarUrls.map((avatarUrl, index) => ({
                    //     id: `${partner.id}-${index}`,
                    //     src: resolveMediaUrl(avatarUrl) ?? avatarUrl,
                    //     alt: `${partner.name} avatar ${index + 1}`,
                    // }));

                    return (
                        <Link href={`/${room.id}`} key={room.id}>
                            <article className={cn(isActive && "bg-primary/25", "hover:bg-accent/40 flex cursor-pointer items-center gap-3 p-4 transition sm:px-6")}>
                                {profile ? (
                                    // <ImageCarousel galleryImages={avatarGallery}>
                                    //     {({ openPreview }) => (
                                    //         <button
                                    //             type="button"
                                    //             className="shrink-0 cursor-zoom-in"
                                    //             onClick={(event) => {
                                    //                 event.preventDefault();
                                    //                 event.stopPropagation();
                                    //                 openPreview();
                                    //             }}
                                    //         >
                                    <Image src={resolveMediaUrl(profile) ?? profile} width={30} height={30} alt={partner.name} unoptimized />
                                ) : (
                                    //         </button>
                                    //     )}
                                    // </ImageCarousel>
                                    <div className={cn("border-primary flex size-8 shrink-0 items-center justify-center rounded-full border bg-linear-to-br text-xs font-semibold text-white shadow-sm")}>
                                        <p>{avatar}</p>
                                    </div>
                                )}

                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="font-jakarta truncate text-xs font-medium">{partner?.name}</h2>
                                        <span className="text-muted-foreground text-ss shrink-0 font-medium">{room.lastMessageAt ? formateDate(room.lastMessageAt, "lastMessage") : ""}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {lastMessage?.messageType === "Image" ? (
                                            <div className="flex items-center gap-1">
                                                <ImageIcon className="text-primary size-3" />
                                                <p className="text-muted-foreground text-ss font-medium">{lastMessage.imageUrls.length > 1 ? `${lastMessage.imageUrls.length} images` : "Image"}</p>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-ss mt-1 truncate font-medium">{lastMessage?.textContent ?? "No Message"}</p>
                                        )}

                                        <div className="bg-primary/70 flex size-4 items-center justify-center rounded-full p-2">
                                            <p className="text-ss">{unreadCount}</p>
                                        </div>
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
