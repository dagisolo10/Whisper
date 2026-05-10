"use client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatCard from "@/components/home/chat-card";
import { Info, Paperclip, Phone, SendHorizontal, Smile, Video, Loader2, Images, X } from "lucide-react";
import Image from "next/image";
import { formatDate, getInitials } from "@/utils/helper-functions";
import { resolveMediaUrl } from "@/lib/media";
import { ImageCarousel } from "../image-carousel";
import OnlineIndicator from "./indicators/online-indicator";
import TypingIndicator from "./indicators/typing-indicator";
import useChat from "@/hooks/use-chat";
import ImageOptions from "./image-options";
import NoMessages from "./empty states/no-message";
import { useRouter } from "next/navigation";

export default function OpenChatPanel() {
    const {
        user,
        message,
        isTyping,
        messages,
        exitRoom,
        scrollRef,
        isSending,
        activeRoom,
        onlineUsers,
        retryMessage,
        handleTyping,
        imageInputRef,
        pendingImages,
        handleImageSelect,
        handleSendMessage,
        removePendingImage,
        clearPendingImages,
    } = useChat();

    const router = useRouter();

    if (!activeRoom) return null;

    const partner = activeRoom.members.find((member) => member.userId !== user?.id)?.user;

    if (!partner) return null;

    const avatar = getInitials(partner.name);

    const isOnline = onlineUsers.includes(partner.id);
    const canSend = (!isSending && message.trim().length > 0) || (!isSending && pendingImages.length > 0);

    return (
        <section className="flex h-screen flex-col">
            <header className="border-border bg-background/95 flex items-center justify-between border-b px-6 py-4 backdrop-blur">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {partner.mainAvatarUrl ? (
                            <Image
                                className="size-8 rounded-full object-cover"
                                width={32}
                                height={32}
                                src={resolveMediaUrl(partner.mainAvatarUrl) ?? partner.mainAvatarUrl}
                                alt={partner.name}
                                unoptimized
                            />
                        ) : (
                            <div className="border-primary flex size-8 shrink-0 items-center justify-center rounded-full border bg-linear-to-br text-xs font-semibold text-white shadow-sm">
                                {avatar}
                            </div>
                        )}
                        <OnlineIndicator isOnline={isOnline} />
                    </div>

                    <div>
                        <h2 className="font-jakarta text-sm font-semibold">{partner.name}</h2>
                        {isTyping ? (
                            <TypingIndicator isTyping={isTyping} />
                        ) : (
                            <p className={cn(isOnline ? "text-emerald-500" : "text-muted-foreground", "text-xs font-semibold")}>
                                {isOnline ? "online" : `Last seen ${formatDate(partner.lastOnlineAt, "lastOnline")}`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        aria-label="Close chat"
                        className="rounded-full"
                        onClick={() => {
                            exitRoom();
                            router.push("/chats");
                        }}
                    >
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

            {messages.length ? (
                <div className="scrollbar-thin scrollbar-track-background scrollbar-thumb-accent flex flex-1 flex-col-reverse overflow-y-auto">
                    <div className="mx-auto flex w-full max-w-4xl flex-col-reverse gap-4 p-6">
                        <div ref={scrollRef} />
                        {messages.map((message, index) => {
                            const isNewDay = index === messages.length - 1 || new Date(message.createdAt).toDateString() !== new Date(messages[index + 1].createdAt).toDateString();
                            return (
                                <div key={message.id} className="contain-[layout]">
                                    {isNewDay && <p className="m-auto mb-4 w-fit rounded-full bg-white/10 px-4 py-1 text-xs">{formatDate(message.createdAt, "daySeparator")}</p>}
                                    <ChatCard message={message} onRetry={retryMessage} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <NoMessages partner={partner} />
            )}

            {pendingImages.length > 0 && (
                <div className="border-border bg-background/90 flex items-center justify-between border-t px-4 py-3">
                    <ImageCarousel
                        galleryImages={pendingImages.map((image, index) => ({
                            id: image.id,
                            src: image.previewUrl,
                            alt: image.file.name || `Selected image ${index + 1}`,
                        }))}
                        renderActions={({ activeIndex, closePreview }) => (
                            <ImageOptions imageInputRef={imageInputRef} pendingImages={pendingImages} activeIndex={activeIndex} removePendingImage={removePendingImage} closePreview={closePreview} />
                        )}
                    >
                        {({ openPreview }) => (
                            <button
                                type="button"
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                                onClick={() => openPreview()}
                            >
                                <div className="bg-primary/15 flex size-9 items-center justify-center rounded-lg">
                                    <Images className="text-primary size-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {pendingImages.length} image{pendingImages.length > 1 ? "s" : ""} ready
                                    </p>
                                    <p className="text-muted-foreground text-xs">Preview, add more, or remove before sending</p>
                                </div>
                            </button>
                        )}
                    </ImageCarousel>

                    <Button type="button" variant="ghost" size="sm" disabled={isSending} onClick={clearPendingImages}>
                        Clear
                    </Button>
                </div>
            )}

            <form className="border-border bg-background flex items-center gap-3 border border-t px-4 py-5 shadow-sm" onSubmit={handleSendMessage}>
                <input ref={imageInputRef} title="Upload image" id="image" name="image" type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

                <Button type="button" variant="outline" size="icon" disabled={isSending} onClick={() => imageInputRef.current?.click()}>
                    <span className="sr-only">Upload image</span>
                    <Paperclip className="size-4" />
                </Button>

                <Input value={message} onChange={handleTyping} placeholder="Message" className="border-none" disabled={isSending} />

                <Button type="button" variant="outline" size="icon" aria-label="Insert emoji" disabled={isSending}>
                    <Smile className="size-4" />
                </Button>

                <Button variant={"outline"} size="icon" disabled={!canSend} aria-label={isSending ? "Sending message" : "Send message"}>
                    {isSending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
                </Button>
            </form>
        </section>
    );
}
