import useRoom from "./room-store";
import useMessage from "./message-store";

import { create } from "zustand";
import useUser from "@/store/user-store";
import { io, Socket } from "socket.io-client";
import showNotification from "@/lib/notification";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket-events";

type WebSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketStore {
    socket: WebSocket | null;
    onlineUsers: string[];
    typingUsers: Record<string, string[]>;
    connectSocket: (token: string) => void;
    disconnectSocket: () => void;
}

const useSocket = create<SocketStore>((set, get) => ({
    socket: null,
    onlineUsers: [],
    typingUsers: {},

    connectSocket: (token) => {
        if (!token) return;

        let socket: WebSocket;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

        const existing = get().socket;
        if (existing) {
            socket = existing;
        } else {
            socket = io(baseUrl, { auth: { token }, autoConnect: true, transports: ["websocket"] });
        }

        socket.auth = { token };

        socket.off("connect");
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id, "url:", baseUrl);
        });

        socket.off("connect_error");
        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
        });

        socket.off("disconnect");
        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        socket.off("onlineUsers");
        socket.on("onlineUsers", (userIds) => {
            console.log("Received online users:", userIds);
            set({ onlineUsers: userIds });
        });

        socket.off("newRoom");
        socket.on("newRoom", (room) => {
            const rooms = useRoom.getState().rooms;
            const existingRoom = rooms.find((r) => r.id === room.id);
            if (!existingRoom) {
                useRoom.getState().addRoom(room);
            }
        });

        socket.off("newMessage");
        socket.on("newMessage", async (message, roomId) => {
            const user = useUser.getState().user;
            const currentActiveRoomId = useRoom.getState().activeRoomId;
            const currentMessages = useMessage.getState().messages;

            const exists = currentMessages.some((msg) => msg.id === message.id);
            if (exists) return;

            if (message.roomId === currentActiveRoomId) {
                useMessage.getState().addMessage(message);
                if (message.senderId !== user?.id) {
                    socket.emit("markAsRead", roomId);
                }
            }

            if (message.roomId !== currentActiveRoomId && message.senderId !== user?.id) {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    showNotification(message);
                }
            }

            useRoom.getState().updateRoomPreview(message);
        });

        socket.off("messageRead");
        socket.on("messageRead", (roomId) => {
            const user = useUser.getState().user;
            const readMessages = useMessage
                .getState()
                .messages.map((msg) => (msg.roomId === roomId && msg.senderId === user?.id ? { ...msg, read: true } : msg));
            useMessage.getState().setMessages(readMessages);
        });

        socket.off("messageEdited");
        socket.on("messageEdited", (updatedMessage) => {
            const updated = useMessage.getState().messages.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg));
            useMessage.getState().setMessages(updated);
        });

        socket.off("messageDeleted");
        socket.on("messageDeleted", (messageId: string) => {
            const updated = useMessage.getState().messages.filter((msg) => msg.id !== messageId);
            useMessage.getState().setMessages(updated);
        });

        socket.off("userStartedTyping");
        socket.on("userStartedTyping", (userId: string, roomId: string) => {
            set((state) => ({
                typingUsers: {
                    ...state.typingUsers,
                    [roomId]: Array.from(new Set([...(state.typingUsers[roomId] || []), userId])),
                },
            }));
        });

        socket.off("userStoppedTyping");
        socket.on("userStoppedTyping", (userId, roomId) => {
            set((state) => ({
                typingUsers: {
                    ...state.typingUsers,
                    [roomId]: (state.typingUsers[roomId] || []).filter((id) => id !== userId),
                },
            }));
        });

        socket.off("roomJoinError");
        socket.on("roomJoinError", (roomId, message) => {
            console.error(`Failed to join room ${roomId}: ${message}`);
        });

        socket.off("roomLeaveError");
        socket.on("roomLeaveError", (roomId, message) => {
            console.error(`Failed to leave room ${roomId}: ${message}`);
        });

        if (!socket.connected) {
            socket.connect();
        }

        set({ socket });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [], typingUsers: {} });
        }
    },
}));

export default useSocket;
