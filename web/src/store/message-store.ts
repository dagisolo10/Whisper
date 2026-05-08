import api from "@/lib/axios";
import { create } from "zustand";
import { Message } from "@/types/model";
import { SendMessagePayload } from "@/types/payloads";
import { MessageResponse, MessageSendResponse } from "@/types/response";

interface MessageStore {
    messages: Message[];

    clearMessages: () => void;
    addMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
    editMessage: (payload: Message, token: string) => Promise<void>;
    deleteMessage: (messageId: string, token: string) => Promise<void>;
    sendMessage: (payload: SendMessagePayload, token: string) => Promise<void>;
}

const useMessage = create<MessageStore>((set) => ({
    messages: [],

    clearMessages: () => set({ messages: [] }),

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
        set((state) => {
            const exists = state.messages.some((m) => m.id === message.id);
            if (exists) return state;
            return { messages: [message, ...state.messages] };
        }),

    sendMessage: async (payload, token) => {
        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.post<MessageSendResponse>("/message/send", payload, auth);
            const data = res.data;
            if (!data.success) throw new Error(data.error);
        } catch (err) {
            console.error("Error sending message", err);
        }
    },

    editMessage: async (payload, token) => {
        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.patch<MessageResponse>(`/message/${payload.id}`, payload, auth);
            const data = res.data;
            if (!data.success) throw new Error(data.error);
        } catch (err) {
            console.error("Error editing message", err);
        }
    },

    deleteMessage: async (messageId, token) => {
        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.delete<MessageResponse>(`/message/${messageId}`, auth);
            const data = res.data;
            if (!data.success) throw new Error(data.error);
        } catch (err) {
            console.error("Error deleting message", err);
        }
    },
}));

export default useMessage;
