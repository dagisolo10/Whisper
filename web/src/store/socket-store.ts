import useRoom from "./room-store";
import useMessage from "./message-store";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import useAuthStore from "@/store/auth-store";
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

        socket.off("newMessage");
        socket.on("newMessage", (message, roomId) => {
            const user = useAuthStore.getState().user;
            const activeRoomId = useRoom.getState().activeRoomId;
            const currentMessages = useMessage.getState().messages;

            if (message.roomId !== roomId) return;
            const exists = currentMessages.some((msg) => msg.id === message.id);
            if (exists) return;

            const inRoom = roomId === activeRoomId && message.senderId !== user?.id;

            useMessage.getState().addMessage(message);

            if (inRoom) {
                socket.emit("markAsRead", roomId);
            }
        });

        socket.off("messageRead");
        socket.on("messageRead", (roomId) => {
            const user = useAuthStore.getState().user;
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
