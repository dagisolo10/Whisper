import { MessageType } from "./model";

interface BaseMessagePayload {
    content: string;
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

export interface RoomPayload {
    partnerId: string;
}

export interface UserPayload {
    name: string;
    username: string;
    bio?: string;
    profile?: string;
}

export interface UpdateUserPayload {
    name?: string;
    username?: string;
    bio?: string;
    profile?: string;
}
