import useSocket from "./socket-store";
import useMessage from "./message-store";

import api from "@/lib/axios";
import { create } from "zustand";
import { Room } from "@/types/model";
import { RoomPayload } from "@/types/payloads";
import { ConversationRoomResponse, CreateRoomResponse, RoomsResponse } from "@/types/response";

interface RoomStore {
    rooms: Room[];
    activeRoom: Room | null;
    currentRoomId: string | null;

    createRoom: (payload: RoomPayload, token: string) => Promise<void>;

    getRooms: (token: string) => Promise<void>;
    getConversation: (roomId: string, token: string) => Promise<void>;
}

const useRoom = create<RoomStore>((set) => ({
    rooms: [],
    activeRoom: null,
    currentRoomId: null,

    getRooms: async (token) => {
        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.get<RoomsResponse>("/room/list", auth);
            const data = res.data;
            if (!data.success) throw new Error(res.data.error);
            const filteredData: Room[] = data.data.map((room) => ({ ...room, messages: [] }));

            set({ rooms: filteredData });
        } catch (err) {
            console.error("Error fetching rooms", err);
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
        } catch (err) {
            console.error("Error while creating room", err);
        }
    },

    getConversation: async (roomId, token) => {
        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const res = await api.get<ConversationRoomResponse>(`/room/${roomId}`, auth);
            const data = res.data;
            if (!data.success) throw new Error(data.error);

            const socket = useSocket.getState().socket;

            if (socket) {
                const previousRoomId = useRoom.getState().currentRoomId;
                if (previousRoomId && previousRoomId !== roomId) {
                    socket.emit("leaveRoom", previousRoomId);
                }
                socket.emit("joinRoom", roomId);
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { messages, ...roomWithoutMessages } = data.data;

            set({ currentRoomId: roomId, activeRoom: roomWithoutMessages as Room });
            useMessage.getState().setMessages(data.data.messages || []);
        } catch (err) {
            console.error("Error fetching conversation", err);
        }
    },
}));

export default useRoom;
