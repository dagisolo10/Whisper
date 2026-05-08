"use client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatCard from "@/components/home/chat-card";
import { Info, Paperclip, Phone, SendHorizontal, Smile, Video, X, MessageSquareDashed, Hand, Loader2, Images, Plus } from "lucide-react";
import useMessage from "@/store/message-store";
import useRoom from "@/store/room-store";
import { useRouter } from "next/navigation";
import useUser from "@/store/auth-store";
import Image from "next/image";
import { formateDate } from "@/utils/helper-functions";
import { ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessagePayload } from "@/types/payloads";
import { resolveMediaUrl } from "@/lib/media";
import { ImageCarousel } from "../image-carousel";

const imageSchema = z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), "Please select an image file")
    .refine((file) => file.size <= 10 * 1024 * 1024, "Image size must be 10MB or less");

const imageListSchema = z.array(imageSchema).min(1, "Please select at least one image").max(10, "You can upload up to 10 images at a time");

type PendingImage = {
    file: File;
    previewUrl: string;
    id: string;
};

export default function OpenChatPanel() {
    const { user } = useUser();
    const { activeRoom } = useRoom();
    const { messages, sendMessage } = useMessage();

    const router = useRouter();
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState("");
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pendingImagesRef = useRef<PendingImage[]>([]);

    useEffect(() => {
        if (!activeRoom) router.replace("/");
    }, [router, activeRoom]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    useEffect(() => {
        pendingImagesRef.current = pendingImages;
    }, [pendingImages]);

    useEffect(() => {
        return () => {
            pendingImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        };
    }, []);

    if (!activeRoom) {
        return (
            <div className="flex h-screen flex-1 flex-col items-center justify-center gap-2">
                <Loader2 className="text-primary size-8 animate-spin" />
                <p className="text-muted-foreground animate-pulse text-sm">Loading conversation...</p>
            </div>
        );
    }

    const partner = activeRoom.members.filter((member) => member.userId !== user?.id)[0].user;

    if (!partner) return null;

    const avatar = partner.name
        .split(" ")
        .map((letter) => letter[0])
        .join("");

    // const partnerGallery = partner.avatarUrls.map((avatarUrl, index) => ({
    //     id: `${partner.id}-${index}`,
    //     src: resolveMediaUrl(avatarUrl) ?? avatarUrl,
    //     alt: `${partner.name} avatar ${index + 1}`,
    // }));

    const isOnline = !true;

    const canSend = (!isSending && message.trim().length > 0) || (!isSending && pendingImages.length > 0);

    function appendImages(files: File[]) {
        const combinedFiles = [...pendingImages.map((image) => image.file), ...files];
        const result = imageListSchema.safeParse(combinedFiles);

        if (!result.success) {
            toast.error("Validation Error", {
                description: () => (
                    <div>
                        {result.error.errors.map((err, key) => (
                            <p key={key}>{err.message}</p>
                        ))}
                    </div>
                ),
            });
            return false;
        }

        const nextImages = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        }));

        setPendingImages((current) => [...current, ...nextImages]);
        return true;
    }

    function removePendingImage(id: string) {
        setPendingImages((current) => {
            const imageToRemove = current.find((image) => image.id === id);
            if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl);

            const nextImages = current.filter((image) => image.id !== id);
            return nextImages;
        });
    }

    function clearPendingImages() {
        pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        setPendingImages([]);
    }

    async function handleSendMessage(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!activeRoom || isSending || (!message.trim() && pendingImages.length === 0)) return;

        setIsSending(true);

        try {
            const trimmedMessage = message.trim();

            if (pendingImages.length > 0) {
                const formData = new FormData();
                pendingImages.forEach((image) => formData.append("files", image.file));
                formData.append("messageType", "Image");
                formData.append("roomId", activeRoom.id);
                if (trimmedMessage) {
                    formData.append("textContent", trimmedMessage);
                }
                await sendMessage(formData, "token");
                clearPendingImages();
            } else {
                const payload: MessagePayload = {
                    textContent: trimmedMessage,
                    messageType: "Text",
                    roomId: activeRoom.id,
                };
                await sendMessage(payload, "token");
            }
        } catch (error) {
            console.error("Error sending message", error);
            toast.error("Couldn't send message", { description: "Please try again." });
        } finally {
            setIsSending(false);
            setMessage("");
        }
    }

    async function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(e.target.files ?? []);
        if (!selectedFiles.length || !activeRoom || isSending) return;
        appendImages(selectedFiles);
        e.target.value = "";
    }

    return (
        <section className="hidden h-screen min-w-0 flex-1 flex-col xl:flex">
            <header className="border-border bg-background/95 flex items-center justify-between border-b px-6 py-4 backdrop-blur">
                <div className="flex items-center gap-4">
                    <div>
                        {partner.mainAvatarUrl ? (
                            // <ImageCarousel galleryImages={partnerGallery}>
                            //     {({ openPreview }) => (
                            //         <button type="button" onClick={() => openPreview(partnerGallery.findIndex((img) => img.src.includes(partner.mainAvatarUrl!)))} className="cursor-zoom-in">
                            <Image src={resolveMediaUrl(partner.mainAvatarUrl!) ?? partner.mainAvatarUrl!} width={30} height={30} alt={partner.name} unoptimized />
                        ) : (
                            //         </button>
                            //     )}
                            // </ImageCarousel>
                            <div className={cn("border-primary flex size-8 shrink-0 items-center justify-center rounded-full border bg-linear-to-br text-xs font-semibold text-white shadow-sm")}>{avatar}</div>
                        )}
                        {isOnline && <div className="absolute right-0 bottom-0 size-1.5 rounded-full bg-emerald-500" />}
                    </div>

                    <div>
                        <h2 className="font-jakarta text-sm font-semibold">{partner.name}</h2>
                        <p className={cn(isOnline ? "text-emerald-500" : "text-muted-foreground", "text-xs font-semibold")}>{isOnline ? "Online" : `Last seen ${formateDate(partner.lastOnlineAt, "lastOnline")}`}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="Close chat" onClick={() => router.push("/")}>
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
                                <div key={message.id}>
                                    {isNewDay && <p className="m-auto mb-4 w-fit rounded-full bg-white/10 px-4 py-1 text-xs">{formateDate(message.createdAt, "daySeparator")}</p>}
                                    <ChatCard message={message} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <NoMessages roomName={partner.name} />
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
                            <>
                                <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                                    <Plus className="size-4" />
                                    Add more
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/10 hover:text-white"
                                    onClick={() => {
                                        const currentId = pendingImages[activeIndex]?.id;
                                        if (!currentId) return;
                                        removePendingImage(currentId);
                                        if (pendingImages.length === 1) closePreview();
                                    }}
                                >
                                    Remove
                                </Button>
                            </>
                        )}
                    >
                        {({ openPreview }) => (
                            <button type="button" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10" onClick={() => openPreview()}>
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
                <input ref={imageInputRef} id="image" name="image" type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

                <Button type="button" variant="outline" size="icon" disabled={isSending} onClick={() => imageInputRef.current?.click()}>
                    <span className="sr-only">Upload image</span>
                    <Paperclip className="size-4" />
                </Button>

                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="border-none" disabled={isSending} />

                <Button type="button" variant="outline" size="icon" disabled={isSending}>
                    <Smile className="size-4" />
                </Button>

                <Button variant={"outline"} size="icon" disabled={!canSend}>
                    {isSending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
                </Button>
            </form>
        </section>
    );
}

function NoMessages({ roomName }: { roomName: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center">
            <div>
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <div className="bg-accent/20 mb-4 flex size-20 items-center justify-center rounded-full ring-1 ring-white/10">
                        <MessageSquareDashed className="text-muted-foreground size-10 animate-pulse" />
                    </div>

                    <h3 className="font-jakarta text-xl font-semibold text-white">Quiet in here...</h3>
                    <p className="text-muted-foreground mt-2 max-w-62.5 text-sm">
                        No whispers yet.{" "}
                        <span className="text-white">
                            Say hello to <br />
                            {roomName}{" "}
                        </span>
                        <br />
                        to start the conversation!
                    </p>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    <div className="bg-primary/20 flex size-12 rotate-3 items-center justify-center rounded-2xl">
                        <Hand className="text-primary size-6" />
                    </div>
                    <Button variant={"outline"} className="rounded-full px-4 text-sm font-semibold transition hover:scale-105 active:scale-95">
                        👋 Wave Hello
                    </Button>
                </div>
            </div>
        </div>
    );
}
