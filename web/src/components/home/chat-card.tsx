"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Clock } from "lucide-react";
import useUser from "@/store/user-store";
import { formatDate } from "@/utils/helper-functions";
import { resolveMediaUrl } from "@/lib/media";
import { ImageCarousel } from "../image-carousel";
import useMessage, { StoreMessage } from "@/store/message-store";

import { memo } from "react";

const ChatCard = ({ message, onRetry }: { message: StoreMessage; onRetry: (m: StoreMessage) => void }) => {
    const { user } = useUser();
    const isMine = message.senderId === user?.id;
    const hasImage = message.messageType === "Image" && message.imageUrls.length > 0;
    const cardStyle = isMine ? "bg-primary/50 text-primary-foreground" : "bg-card";
    const corners = hasImage && isMine ? "rounded-bl-lg" : hasImage && !isMine ? "rounded-br-lg" : isMine ? "rounded-t-lg rounded-bl-lg" : "rounded-t-lg rounded-br-lg";

    const text = message.textContent;
    const images = hasImage ? message.imageUrls : [];
    const galleryImages = images.map((imageUrl, index) => ({ id: `${message.id}-${index}`, src: resolveMediaUrl(imageUrl) ?? imageUrl, alt: `Sent image ${index + 1}` }));

    const isPending = useMessage((s) => s.pendingMessageIds.has(message.id));

    return (
        <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
            <div className="max-w-[clamp(30rem,60%,70%)] space-y-2">
                <div>
                    {images.length > 0 && (
                        <ImageCarousel galleryImages={galleryImages}>
                            {({ openPreview }) => (
                                <div className={cn(images.length === 1 ? "grid-cols-1" : "grid-cols-2", "grid gap-2 overflow-hidden rounded-t-lg")}>
                                    {galleryImages.map((image, index) => (
                                        <button
                                            title="Open image preview"
                                            key={image.id}
                                            type="button"
                                            onClick={() => openPreview(index)}
                                            className={cn(images.length === 1 ? "max-w-md" : "max-w-xs", "cursor-zoom-in overflow-hidden rounded-2xl")}
                                        >
                                            <Image
                                                className={cn(images.length === 1 ? "h-auto max-h-80 w-full" : "h-48 w-full", "object-cover")}
                                                src={image.src}
                                                width={1024}
                                                height={1024}
                                                alt={image.alt}
                                                unoptimized
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ImageCarousel>
                    )}

                    {text && (
                        <div className={cn("p-3 text-xs shadow-sm", cardStyle, corners)}>
                            <p>{text}</p>
                        </div>
                    )}
                </div>
                <div className={cn("flex items-center", isMine ? "justify-end" : "justify-start")}>
                    <p className={cn("text-muted-foreground px-2 text-xs", isMine ? "text-right" : "text-left")}>{formatDate(message.createdAt, "messageSent")}</p>

                    {isPending ? (
                        <Clock className="text-muted-foreground size-3" />
                    ) : message.isFailed ? (
                        <button
                            type="button"
                            aria-label="Retry message"
                            onClick={() => onRetry(message)}
                            className="text-destructive flex items-center gap-1 transition-all hover:underline active:scale-95"
                        >
                            <span className="text-[10px] font-medium">Retry</span>
                            <AlertCircle className="size-3" />
                        </button>
                    ) : message.read ? (
                        <DoubleCheck isMine={isMine} />
                    ) : (
                        <Check className={cn("text-destructive size-3", isMine ? "block" : "hidden")} />
                    )}
                </div>
            </div>
        </div>
    );
};

function DoubleCheck({ isMine }: { isMine: boolean }) {
    return (
        <div className="relative size-3 bg-white/0">
            <Check className={cn("absolute left-px size-3 text-emerald-500", isMine ? "block" : "hidden")} />
            <Check className={cn("absolute right-px size-3 text-emerald-500", isMine ? "block" : "hidden")} />
        </div>
    );
}

export default memo(ChatCard);
