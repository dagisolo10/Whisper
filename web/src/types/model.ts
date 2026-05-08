export interface User {
    id: string;
    name: string;
    username: string;
    createdAt: string;
    lastOnlineAt: string;
    bio?: string | null;
    mainAvatarUrl?: string | null;
    avatarUrls: string[];
}

export interface Member {
    id: string;
    userId: string;
    roomId: string;
    createdAt: string;

    user: User;
}

export interface Room {
    id: string;
    pairKey: string;
    createdAt: string;
    updatedAt: string;
    lastMessageAt?: string;
    lastMessageId?: string;
    unreadCount: number;

    lastMessage?: Message;
    messages: Message[];
    members: Member[];
}

export interface Message {
    id: string;
    read: boolean;
    roomId: string;
    textContent?: string | null;
    imageUrls: string[];
    senderId: string;
    createdAt: string;
    messageType: MessageType;

    lastInRoom?: PureRoom;
    user: User;
}

type PureRoom = Omit<Room, "lastMessage" | "messages" | "members" | "unreadCount">;

export type MessageType = "Text" | "Image" | "Video";
