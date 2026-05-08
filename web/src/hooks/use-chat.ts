"use client";

import { z } from "zod";
import useMessage from "@/store/message-store";
import useRoom from "@/store/room-store";
import useSocket from "@/store/socket-store";
import { MessagePayload } from "@/types/payloads";
import { useRouter } from "next/navigation";
import { useState, useRef, SyntheticEvent, ChangeEvent, useMemo, useEffect } from "react";
import { toast } from "sonner";
import useUser from "@/store/auth-store";
import { PendingImage } from "@/types/media";

const imageSchema = z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), "Please select an image file")
    .refine((file) => file.size <= 10 * 1024 * 1024, "Image size must be 10MB or less");

const imageListSchema = z.array(imageSchema).min(1, "Please select at least one image").max(10, "You can upload up to 10 images at a time");

export default function useChat() {
    const user = useUser((s) => s.user);
    const socket = useSocket((s) => s.socket);
    const lastToken = useUser((s) => s.lastToken);
    const messages = useMessage((s) => s.messages);
    const activeRoom = useRoom((s) => s.activeRoom);
    const onlineUsers = useSocket((s) => s.onlineUsers);
    const typingUsers = useSocket((s) => s.typingUsers);
    const sendMessage = useMessage((s) => s.sendMessage);

    const router = useRouter();
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

    const isTypingRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pendingImagesRef = useRef<PendingImage[]>([]);

    function appendImages(files: File[]) {
        const combinedFiles = [...pendingImages.map((image) => image.file), ...files];
        const result = imageListSchema.safeParse(combinedFiles);

        if (!result.success) {
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
        if (!activeRoom || isSending || !user || !socket || (!message.trim() && pendingImages.length === 0)) return;

        setIsSending(true);

        let sent = false;

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
                await sendMessage(formData, lastToken ?? "");
                clearPendingImages();
                sent = true;
            } else {
                const payload: MessagePayload = {
                    textContent: trimmedMessage,
                    messageType: "Text",
                    roomId: activeRoom.id,
                };
                await sendMessage(payload, lastToken ?? "");
                sent = true;
            }
        } catch (error) {
            console.error("Error sending message", error);
            toast.error("Couldn't send message", { description: "Please try again." });
        } finally {
            setIsSending(false);
            if (sent) setMessage("");
            socket.emit("stopTyping", activeRoom.id, user?.id);
            isTypingRef.current = false;
        }
    }

    async function sendWave(recipientId: string) {
        try {
            const payload: MessagePayload = {
                textContent: "Hi",
                messageType: "Text",
                recipientId,
            };
            await sendMessage(payload, lastToken ?? "");
        } catch (err) {
            console.error("Error sending wave", err);
            toast.error("Couldn't send wave", { description: "Please try again." });
        }
    }

    async function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(e.target.files ?? []);
        if (!selectedFiles.length || !activeRoom || isSending) return;
        appendImages(selectedFiles);
        e.target.value = "";
    }

    function handleTyping(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        if (!user || !socket || !activeRoom) return;

        const message = e.target.value;

        if (message.length > 0) {
            if (!isTypingRef.current) {
                socket.emit("typing", activeRoom.id, user.id);
                isTypingRef.current = true;
            }

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stopTyping", activeRoom.id, user.id);
                isTypingRef.current = false;
                typingTimeoutRef.current = null;
            }, 1200);
        } else {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            socket.emit("stopTyping", activeRoom.id, user.id);
            isTypingRef.current = false;
        }

        setMessage(message);
    }

    const isTyping = useMemo(() => {
        if (!activeRoom) return false;
        const typingPeople = typingUsers[activeRoom.id] || [];
        const filteredPeople = typingPeople.filter((uId) => uId !== user?.id);
        return filteredPeople.length > 0;
    }, [activeRoom, typingUsers, user?.id]);

    useEffect(() => {
        if (!activeRoom === null) router.replace("/");
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
            if (socket && user && activeRoom) socket.emit("stopTyping", activeRoom.id, user.id);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [activeRoom, socket, user]);

    return {
        user,
        message,
        isTyping,
        messages,
        sendWave,
        scrollRef,
        isSending,
        activeRoom,
        onlineUsers,
        handleTyping,
        imageInputRef,
        pendingImages,
        handleImageSelect,
        handleSendMessage,
        removePendingImage,
        clearPendingImages,
    };
}
