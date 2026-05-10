"use client";

import { z } from "zod";
import useMessage, { StoreMessage } from "@/store/message-store";
import useRoom from "@/store/room-store";
import useSocket from "@/store/socket-store";
import { MessagePayload } from "@/types/payloads";
import { useState, useRef, SyntheticEvent, ChangeEvent, useMemo, useEffect, startTransition } from "react";
import { toast } from "sonner";
import useUser from "@/store/user-store";
import { PendingImage } from "@/types/media";

const imageSchema = z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), "Please select an image file")
    .refine((file) => file.size <= 10 * 1024 * 1024, "Image size must be 10MB or less");

const imageListSchema = z.array(imageSchema).min(1, "Please select at least one image").max(10, "You can upload up to 10 images at a time");

export default function useChat() {
    const user = useUser((s) => s.user);
    const socket = useSocket((s) => s.socket);
    const exitRoom = useRoom((s) => s.exitRoom);
    const lastToken = useUser((s) => s.lastToken);
    const messages = useMessage((s) => s.messages);
    const activeRoom = useRoom((s) => s.activeRoom);
    const onlineUsers = useSocket((s) => s.onlineUsers);
    const typingUsers = useSocket((s) => s.typingUsers);
    const sendMessage = useMessage((s) => s.sendMessage);

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
            return { ok: false as const, error: result.error.issues[0]?.message ?? "Invalid image selection" };
        }

        const nextImages = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        }));

        setPendingImages((current) => [...current, ...nextImages]);
        return { ok: true as const };
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
        const tempId = "optimistic_" + crypto.randomUUID();

        const trimmedMessage = message.trim();

        if (!activeRoom || !lastToken || isSending || !user || !socket || (!trimmedMessage && pendingImages.length === 0)) return;

        setIsSending(true);

        const sendImage = async () => {
            const formData = new FormData();

            pendingImages.forEach((image) => formData.append("files", image.file));
            formData.append("messageType", "Image");
            formData.append("roomId", activeRoom.id);

            if (trimmedMessage) {
                formData.append("textContent", trimmedMessage);
            }

            const res = await sendMessage(formData, lastToken);

            if (!res.success) throw new Error(typeof res.error === "string" ? res.error : String(res.error ?? "Send failed"));

            clearPendingImages();
        };

        const sendTextMessage = async () => {
            setMessage("");

            const payload: MessagePayload = {
                messageType: "Text",
                roomId: activeRoom.id,
                textContent: trimmedMessage,
            };

            const optimisticMsg: StoreMessage = {
                user,
                id: tempId,
                read: false,
                imageUrls: [],
                senderId: user.id,
                messageType: "Text",
                roomId: activeRoom.id,
                textContent: trimmedMessage,
                createdAt: new Date().toISOString(),
            };

            useMessage.getState().addMessage(optimisticMsg);

            startTransition(async () => {
                try {
                    useMessage.getState().addPendingId(tempId);

                    const res = await sendMessage(payload, lastToken);

                    if (!res.success) throw new Error(typeof res.error === "string" ? res.error : String(res.error ?? "Send failed"));

                    if (res.message) useMessage.getState().addMessage(res.message);
                } catch (error) {
                    console.error("Failed to send", error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    toast.error(errorMessage);
                    useMessage.getState().updateMessage({ id: tempId }, { isFailed: true });
                } finally {
                    useMessage.getState().removePendingId(tempId);
                    setIsSending(false);
                }
            });
        };

        try {
            if (pendingImages.length > 0) {
                await sendImage();
            } else {
                await sendTextMessage();
            }
        } catch (error) {
            console.error("Error sending message", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(errorMessage);
        } finally {
            socket.emit("stopTyping", activeRoom.id, user?.id);
            isTypingRef.current = false;
        }
    }

    async function retryMessage(message: StoreMessage) {
        if (!activeRoom || !lastToken || isSending || !user || !socket || !message) return;

        const textRetry = async () => {
            if (!message.textContent) return;

            const payload: MessagePayload = {
                roomId: message.roomId,
                messageType: message.messageType,
                textContent: message.textContent,
            };

            const tempId = message.id;

            startTransition(async () => {
                try {
                    useMessage.getState().addPendingId(tempId);
                    useMessage.getState().updateMessage({ id: tempId }, { isFailed: false });

                    const res = await sendMessage(payload, lastToken, tempId);

                    if (!res.success) throw new Error(typeof res.error === "string" ? res.error : String(res.error ?? "Retry failed"));

                    if (res.message) useMessage.getState().addMessage(res.message);
                } catch (error) {
                    console.error("Retry failed", error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    toast.error(errorMessage);
                    useMessage.getState().updateMessage({ id: tempId }, { isFailed: true });
                } finally {
                    useMessage.getState().removePendingId(tempId);
                }
            });
        };

        const imageRetry = async () => {
            if (message.imageUrls.length === 0) return;
        };

        try {
            switch (message.messageType) {
                case "Text":
                    await textRetry();
                    break;

                case "Image":
                    await imageRetry();
                    break;
            }
        } catch (error) {
            console.error("Error in retry attempt", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(errorMessage);
        }
    }

    async function sendWave(partnerId: string) {
        if (!lastToken) return;

        try {
            const payload: MessagePayload = {
                textContent: "Hi 👋",
                messageType: "Text",
                partnerId,
            };
            const res = await sendMessage(payload, lastToken);
            if (!res.success) throw new Error(typeof res.error === "string" ? res.error : String(res.error ?? "Could not send wave"));
        } catch (err) {
            console.error("Error sending wave", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            toast.error(errorMessage);
        }
    }

    async function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(e.target.files ?? []);
        if (!selectedFiles.length || !activeRoom || isSending) return;
        const result = appendImages(selectedFiles);
        if (!result.ok) toast.error(result.error);
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
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    useEffect(() => {
        pendingImagesRef.current = pendingImages;
    }, [pendingImages]);

    useEffect(() => {
        return () => {
            pendingImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (!socket || !user || !activeRoom) return;
        const roomId = activeRoom.id;
        const userId = user.id;
        return () => {
            if (isTypingRef.current) {
                socket.emit("stopTyping", roomId, userId);
                isTypingRef.current = false;
            }
        };
    }, [activeRoom, socket, user]);

    return {
        user,
        message,
        isTyping,
        exitRoom,
        messages,
        sendWave,
        scrollRef,
        isSending,
        activeRoom,
        onlineUsers,
        handleTyping,
        retryMessage,
        imageInputRef,
        pendingImages,
        handleImageSelect,
        handleSendMessage,
        removePendingImage,
        clearPendingImages,
    };
}
