import useSocket from "./socket-store";
import useMessage, { StoreMessage } from "./message-store";

import api from "@/lib/axios";
import { create } from "zustand";
import { Room } from "@/types/model";
import { RoomPayload } from "@/types/payloads";
import { ConversationRoomResponse, CreateRoomResponse, RoomsResponse } from "@/types/response";

interface RoomStore {
    rooms: Room[];
    activeRoom: Room | null;
    activeRoomId: string | null;

    fetchingRooms: boolean;
    fetchingChat: boolean;

    exitRoom: () => void;
    addRoom: (room: Room) => void;

    getRooms: (token: string) => Promise<void>;
    updateRoomPreview: (message: StoreMessage) => void;
    getConversation: (roomId: string, token: string) => Promise<{ success: boolean }>;
    createRoom: (payload: RoomPayload, token: string) => Promise<Room | undefined>;
}

const useRoom = create<RoomStore>((set, get) => ({
    rooms: [],
    activeRoom: null,
    activeRoomId: null,
    fetchingChat: false,
    fetchingRooms: false,

    exitRoom: () => {
        const { activeRoomId } = get();
        const socket = useSocket.getState().socket;
        if (activeRoomId && socket) {
            socket.emit("leaveRoom", activeRoomId);
        }
        set({ activeRoom: null, activeRoomId: null });
        useMessage.getState().clearMessages()
    },

    addRoom: (room) => {
        set((state) => {
            const otherRooms = state.rooms.filter((r) => r.id !== room.id);
            return { rooms: [room, ...otherRooms] };
        });
    },

    getRooms: async (token) => {
        set({ fetchingRooms: true });
        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.get<RoomsResponse>("/room/list", auth);
            const data = res.data;
            if (!data.success) throw new Error(res.data.error);
            const filteredData: Room[] = data.data.map((room) => ({ ...room, messages: [] }));

            set({ rooms: filteredData });
        } catch (err) {
            console.error("Error fetching rooms", err);
        } finally {
            set({ fetchingRooms: false });
        }
    },

    createRoom: async (payload, token) => {
        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.post<CreateRoomResponse>("/room/create", payload, auth);
            const data = res.data;
            if (!data.success) throw new Error(res.data.error);
            const populatedData: Room = { ...data.data, messages: [] };

            set((state) => ({ rooms: [populatedData, ...state.rooms] }));
            return populatedData;
        } catch (err) {
            console.error("Error while creating room", err);
        }
    },

    getConversation: async (roomId, token) => {
        set({ fetchingChat: true, activeRoomId: null, activeRoom: null });

        await new Promise((resolve) => setTimeout(resolve, 300));

        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.get<ConversationRoomResponse>(`/room/${roomId}`, auth);
            const data = res.data;
            if (!data.success) throw new Error(data.error);

            const socket = useSocket.getState().socket;

            if (socket) {
                const previousRoomId = useRoom.getState().activeRoomId;
                if (previousRoomId && previousRoomId !== roomId) {
                    socket.emit("leaveRoom", previousRoomId);
                }
                socket.emit("joinRoom", roomId);
            }

            const { messages, ...roomWithoutMessages } = data.data;
            const serverMessages: StoreMessage[] = (messages ?? []).map((msg) => ({ ...msg, isFailed: false }));

            set((state) => ({
                activeRoomId: roomId,
                activeRoom: roomWithoutMessages as Room,
                rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, unreadCount: 0 } : room)),
            }));

            useMessage.getState().setMessages(serverMessages);

            return { success: true };
        } catch (err) {
            console.error("Error fetching conversation", err);
            set({ activeRoom: null, activeRoomId: null });
            return { success: false };
        } finally {
            set({ fetchingChat: false });
        }
    },

    updateRoomPreview: (message) => {
        set((state) => {
            const updatedRooms = state.rooms.map((room) => {
                if (room.id === message.roomId) {
                    return {
                        ...room,
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        unreadCount: room.id === state.activeRoomId ? 0 : room.unreadCount + 1,
                    };
                }
                return room;
            });

            const sortedRooms = [...updatedRooms].sort((a, b) => {
                const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
                const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
                return timeB - timeA;
            });

            return { rooms: sortedRooms };
        });
    },
}));

export default useRoom;
