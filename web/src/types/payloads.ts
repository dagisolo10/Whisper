import { MessageType } from "./model";

interface BaseMessagePayload {
    textContent: string;
    messageType: MessageType;
}

type MessagePayloadWithRoomId = BaseMessagePayload & {
    roomId: string;
    recipientId?: never;
};
type MessagePayloadWithRecipientId = BaseMessagePayload & {
    recipientId: string;
    roomId?: never;
};

export type MessagePayload = MessagePayloadWithRoomId | MessagePayloadWithRecipientId;
export type SendMessagePayload = MessagePayload | FormData;

export interface RoomPayload {
    partnerId: string;
}

export interface UserPayload {
    name: string;
    username: string;
    bio?: string;
    mainAvatarUrl?: string | null;
    avatarUrls?: string[];
}

export interface UpdateUserPayload {
    name?: string;
    username?: string;
    bio?: string;
    mainAvatarUrl?: string | null;
    avatarUrls?: string[];
}
