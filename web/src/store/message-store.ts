import api from "@/lib/axios";
import { create } from "zustand";
import { Message } from "@/types/model";
import { SendMessagePayload } from "@/types/payloads";
import { simulateDelay } from "@/utils/helper-functions";
import { persist, createJSONStorage } from "zustand/middleware";
import { MessageResponse, MessageSendResponse } from "@/types/response";

export type StoreMessage = Message & { isFailed?: boolean };

export function isOptimisticClientId(id: string): boolean {
    return id.startsWith("optimistic_");
}

function normalizeTextContent(text: string | null | undefined): string {
    return (text ?? "").trim();
}

function isOptimisticTwin(existing: StoreMessage, incoming: StoreMessage): boolean {
    if (!isOptimisticClientId(existing.id)) return false;
    if (existing.messageType !== incoming.messageType) return false;
    if (existing.senderId !== incoming.senderId || existing.roomId !== incoming.roomId) return false;

    if (existing.clientId && incoming.clientId) {
        return existing.clientId === incoming.clientId;
    }

    if (incoming.messageType === "Text") {
        return normalizeTextContent(existing.textContent) === normalizeTextContent(incoming.textContent);
    }

    if (incoming.messageType === "Image") {
        const sameText = normalizeTextContent(existing.textContent) === normalizeTextContent(incoming.textContent);
        const sameImages = existing.imageUrls.length === incoming.imageUrls.length && existing.imageUrls.every((u, i) => u === incoming.imageUrls[i]);
        return sameText && sameImages;
    }

    return normalizeTextContent(existing.textContent) === normalizeTextContent(incoming.textContent);
}

function contentMatchesPersistedFailed(failedMsg: StoreMessage, server: StoreMessage): boolean {
    if (!failedMsg.isFailed) return false;
    if (failedMsg.roomId !== server.roomId || failedMsg.senderId !== server.senderId) return false;
    if (failedMsg.messageType !== server.messageType) return false;
    if (failedMsg.messageType === "Text") {
        return normalizeTextContent(failedMsg.textContent) === normalizeTextContent(server.textContent);
    }
    if (failedMsg.messageType === "Image") {
        const sameText = normalizeTextContent(failedMsg.textContent) === normalizeTextContent(server.textContent);
        const sameImages = failedMsg.imageUrls.length === server.imageUrls.length && failedMsg.imageUrls.every((u, i) => u === server.imageUrls[i]);
        return sameText && sameImages;
    }
    return normalizeTextContent(failedMsg.textContent) === normalizeTextContent(server.textContent);
}

function extractSendError(error: unknown): string {
    if (typeof error === "object" && error !== null && "response" in error) {
        const data = (error as { response?: { data?: { error?: string; message?: string } } }).response?.data;
        if (typeof data?.error === "string" && data.error) return data.error;
        if (typeof data?.message === "string" && data.message) return data.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return "Message send failed";
}

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
    sendMessage: (payload: SendMessagePayload, token: string, clientId?: string) => Promise<{ success: boolean; error: string | undefined | unknown; message?: StoreMessage }>;
}

const useMessage = create<MessageStore>()(
    persist(
        (set) => ({
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
                    const failedToKeep = state.messages.filter((msg) => {
                        if (msg.isFailed) return true;
                        const duplicateOnServer = serverMessages.some((sm) => contentMatchesPersistedFailed(msg, sm));
                        return !duplicateOnServer;
                    });
                    return { messages: [...failedToKeep, ...serverMessages] };
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
                    if (state.messages.some((m) => m.id === message.id)) {
                        return state;
                    }

                    const withoutTwin = state.messages.filter((m) => !isOptimisticTwin(m, message));

                    return { messages: [message, ...withoutTwin] };
                });
            },

            sendMessage: async (payload, token, clientId) => {
                try {
                    const shouldSucceed = typeof window !== "undefined" ? !window.FORCE_FAIL : true && process.env.NODE_ENV !== "production";
                    await simulateDelay(1500, { success: shouldSucceed });

                    const payloadWithClientId =
                        payload instanceof FormData
                            ? (() => {
                                  const formData = new FormData();
                                  for (const [key, value] of payload.entries()) {
                                      formData.append(key, value);
                                  }
                                  if (clientId) {
                                      formData.append("clientId", clientId);
                                  }
                                  return formData;
                              })()
                            : { ...payload, ...(clientId && { clientId }) };

                    const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                    const res = await api.post<MessageSendResponse>("/message/send", payloadWithClientId, auth);
                    const data = res.data;

                    if (!data.success) {
                        const errText = typeof data.error === "string" && data.error ? data.error : "Request failed";
                        throw new Error(errText);
                    }

                    const message = data.data?.message as StoreMessage | undefined;
                    return { success: true, error: undefined, message };
                } catch (error) {
                    console.error("Error sending message", error);
                    return { success: false, error: extractSendError(error) };
                }
            },

            editMessage: async (payload, token) => {
                try {
                    const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                    const res = await api.patch<MessageResponse>(`/message/${payload.id}`, payload, auth);
                    const data = res.data;
                    if (!data.success) throw new Error(typeof data.error === "string" ? data.error : "Update failed");
                } catch (err) {
                    console.error("Error editing message", err);
                }
            },

            deleteMessage: async (messageId, token) => {
                try {
                    const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                    const res = await api.delete<MessageResponse>(`/message/${messageId}`, auth);
                    const data = res.data;
                    if (!data.success) throw new Error(typeof data.error === "string" ? data.error : "Delete failed");
                } catch (err) {
                    console.error("Error deleting message", err);
                }
            },
        }),
        {
            name: "whisper-messages",
            storage: createJSONStorage(() => {
                if (typeof window === "undefined") {
                    return {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    };
                }
                return localStorage;
            }),
            partialize: (state) => ({ messages: state.messages.filter((m) => m.isFailed === true) }),
        },
    ),
);

export default useMessage;
