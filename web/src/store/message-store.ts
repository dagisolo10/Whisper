import api from "@/lib/axios";
import { create } from "zustand";
import { Message } from "@/types/model";
import { MessagePayload } from "@/types/payloads";
import { MessageResponse, MessageSendResponse } from "@/types/response";

interface MessageStore {
    messages: Message[];

    clearMessages: () => void;
    addMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
    editMessage: (payload: Message, token: string) => Promise<void>;
    deleteMessage: (messageId: string, token: string) => Promise<void>;
    sendMessage: (payload: MessagePayload, token: string) => Promise<void>;
}

const useMessage = create<MessageStore>((set) => ({
    messages: [],

    clearMessages: () => set({ messages: [] }),

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
        set((state) => {
            const exists = state.messages.some((m) => m.id === message.id);
            if (exists) return state;
            return { messages: [...state.messages, message] };
        }),

    sendMessage: async (payload, token) => {
        try {
            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const res = await api.post<MessageSendResponse>("/message/send", payload, auth);
            const data = res.data;
            if (!data.success) throw new Error(data.error);

            const newMessage = data.data.message;

            set((state) => {
                const exists = state.messages.some((msg) => msg.id === newMessage.id);
                if (exists) return state;
                return { messages: [...state.messages, newMessage] };
            });
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

            const updatedMessage = data.data;

            set((state) => ({ messages: [...state.messages.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))] }));
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

            const deletedMessage = data.data;

            set((state) => ({ messages: [...state.messages.filter((msg) => msg.id !== deletedMessage.id)] }));
        } catch (err) {
            console.error("Error deleing message", err);
        }
    },
}));

export default useMessage;
