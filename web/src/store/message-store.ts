import api from "@/lib/axios";
import { create } from "zustand";
import { Message } from "@/types/model";
import { sleep } from "@/utils/helper-functions";
import { SendMessagePayload } from "@/types/payloads";
import { MessageResponse, MessageSendResponse } from "@/types/response";

export type StoreMessage = Message & { isFailed?: boolean };
interface MessageStore {
    messages: StoreMessage[];

    pendingMessageIds: Set<string>;
    addPendingId: (id: string) => void;
    removePendingId: (id: string) => void;

    clearMessages: () => void;
    updateMessage: (check: Partial<StoreMessage>, data: Partial<StoreMessage>) => void;
    removeMessage: (id: string) => void;
    addMessage: (message: StoreMessage) => void;
    setMessages: (serverMessages: StoreMessage[]) => void;
    editMessage: (payload: StoreMessage, token: string) => Promise<void>;
    deleteMessage: (messageId: string, token: string) => Promise<void>;
    sendMessage: (payload: SendMessagePayload, token: string) => Promise<{ success: boolean; error: string | undefined | unknown }>;
}

const useMessage = create<MessageStore>((set) => ({
    messages: [],
    pendingMessageIds: new Set(),

    clearMessages: () => set({ messages: [] }),

    removeMessage: (id) => set((state) => ({ messages: state.messages.filter((msg) => msg.id !== id) })),

    addPendingId: (id) => set((state) => ({ pendingMessageIds: new Set(state.pendingMessageIds).add(id) })),

    removePendingId: (id) =>
        set((state) => {
            const next = new Set(state.pendingMessageIds);
            next.delete(id);
            return { pendingMessageIds: next };
        }),

    setMessages: (serverMessages) => {
        set((state) => {
            const failedMessages = state.messages.filter((m) => m.isFailed && !serverMessages.some((sm) => sm.textContent === m.textContent));
            return { messages: [...failedMessages, ...serverMessages] };
        });
    },

    updateMessage: (check, data) => {
        set((state) => ({
            messages: state.messages.map((msg) => {
                const isMatch = Object.entries(check).every(([key, value]) => msg[key as keyof StoreMessage] === value);
                return isMatch ? { ...msg, ...data } : msg;
            }),
        }));
    },

    addMessage: (message) => {
        set((state) => {
            const exists = state.messages.some((m) => m.id === message.id);
            if (exists) return state;

            const filteredMessages = state.messages.filter((m) => {
                const isOptimisticTwin = m.id.length > 30 && m.textContent === message.textContent && m.roomId === message.roomId;

                return !isOptimisticTwin;
            });

            return { messages: [message, ...filteredMessages] };
        });
    },

    sendMessage: async (payload, token) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const shouldSucceed = typeof window !== "undefined" ? !(window as any).FORCE_FAIL : true;
            await sleep(1500, { success: shouldSucceed });

            const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.post<MessageSendResponse>("/message/send", payload, auth);
            const data = res.data;

            if (!data.success) throw new Error(data.error);

            return { success: true, error: data.error };
        } catch (error) {
            console.error("Error sending message", error);
            const errorMessage = error instanceof Error ? error.message : "Message send failed";
            return { success: false, error: errorMessage };
        } finally {
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
