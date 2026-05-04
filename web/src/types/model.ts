export interface User {
    id: string;
    name: string;
    username: string;
    bio?: string | null;
    avatarUrl?: string | null;
    lastOnlineAt: string;
    createdAt: string;

    members?: Member[];
    messages?: Message[];
}

export interface Member {
    id: string;
    userId: string;
    roomId: string;
    createdAt: string;

    user?: User;
    room?: Room;
}

export interface Room {
    id: string;
    pairKey: string;
    lastMessageAt?: string;
    lastMessageId?: string;
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
    members?: Member[];
}

export interface Message {
    id: string;
    content: string;
    messageType: MessageType;
    read: boolean;
    roomId: string;
    senderId: string;
    lastInRoom?: Room;
    createdAt: string;

    user?: User;
    room?: Room;
}

export type MessageType = "Text" | "Image" | "Video";
