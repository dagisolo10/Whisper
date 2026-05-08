import { Message, Room, User } from "./model";

export interface MessageSendResponse {
    data: {
        roomId: string;
        message: Message;
    };
    error?: string;
    success: boolean;
}
export interface MessageResponse {
    data: Message;
    error?: string;
    success: boolean;
}

export interface UserResponse {
    data: User;
    error?: string;
    success: boolean;
}

export interface UserSearchResponse {
    data: User[];
    error?: string;
    success: boolean;
}

export interface CreateRoomResponse {
    data: Omit<Room, "messages" | "lastMessage">;
    error?: string;
    success: boolean;
}
export interface ConversationRoomResponse {
    data: Omit<Room, "lastMessage">;
    error?: string;
    success: boolean;
}

export interface RoomsResponse {
    data: Omit<Room, "messages">[];
    error?: string;
    success: boolean;
}
