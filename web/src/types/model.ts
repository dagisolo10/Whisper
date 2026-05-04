export interface User {
    id: string;
    name: string;
    username: string;
    bio?: string | null;
    avatarUrl?: string | null;
    lastOnlineAt: Date;
    createdAt: Date;

    members?: Member[];
    messages?: Message[];
}

export interface Member {
    id: string;
    userId: string;
    roomId: string;
    createdAt: Date;

    user?: User;
    room?: Room;
}

export interface Room {
    id: string;
    pairKey: string;
    lastMessageAt?: Date;
    lastMessageId?: string;
    lastMessage?: Message;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
    members: Member[];
}

export interface Message {
    id: string;
    content: string;
    messageType: MessageType;
    read: boolean;
    roomId: string;
    senderId: string;
    lastInRoom?: Room;
    createdAt: Date;

    user?: User;
    room?: Room;
}

export type MessageType = "Text" | "Image" | "Video";
