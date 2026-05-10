"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CheckCheck, Check } from "lucide-react";
import { Message } from "@/types/model";
import useUser from "@/store/user-store";
import { formatDate } from "@/utils/helper-functions";
import { resolveMediaUrl } from "@/lib/media";
import { ImageCarousel } from "../image-carousel";

export default function ChatCard({ message }: { message: Message }) {
    const { user } = useUser();
    const isMine = message.senderId === user?.id;
    const Icon = message.read ? CheckCheck : Check;
    const hasImage = message.messageType === "Image" && message.imageUrls.length > 0;
    const cardStyle = isMine ? "bg-primary/50 text-primary-foreground" : "bg-card";
    const corners =
        hasImage && isMine ? "rounded-bl-lg" : hasImage && !isMine ? "rounded-br-lg" : isMine ? "rounded-t-lg rounded-bl-lg" : "rounded-t-lg rounded-br-lg";

    const images = hasImage ? message.imageUrls : [];
    const text = message.textContent;
    const galleryImages = images.map((imageUrl, index) => ({
        id: `${message.id}-${index}`,
        src: resolveMediaUrl(imageUrl) ?? imageUrl,
        alt: `Sent image ${index + 1}`,
    }));

    return (
        <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
            <div className="max-w-[clamp(30rem,60%,70%)] space-y-2">
                <div>
                    {images.length > 0 && (
                        <ImageCarousel galleryImages={galleryImages}>
                            {({ openPreview }) => (
                                <div className={cn(images.length === 1 ? "grid-cols-1" : "grid-cols-2", "grid gap-2 overflow-hidden rounded-t-lg")}>
                                    {galleryImages.map((image, index) => (
                                        <button
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
                <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <p className={cn("text-muted-foreground px-2 text-xs", isMine ? "text-right" : "text-left")}>
                        {formatDate(message.createdAt, "messageSent")}
                    </p>
                    <Icon className={cn(message.read ? "text-emerald-500" : "text-destructive", isMine ? "block" : "hidden", "size-4")} />
                </div>
            </div>
        </div>
    );
}
