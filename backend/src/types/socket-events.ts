import type { Message, Room } from "@prisma/client";

export interface ServerToClientEvents {
    newRoom: (room: Room) => void;
    messageRead: (roomId: string) => void;
    onlineUsers: (userIds: string[]) => void;
    messageEdited: (message: Message) => void;
    newMessage: (message: Message, roomId: string) => void;
    roomJoinError: (roomId: string, message: string) => void;
    roomLeaveError: (roomId: string, message: string) => void;
    messageDeleted: (messageId: string, roomId: string) => void;
    userStartedTyping: (userId: string, roomId: string) => void;
    userStoppedTyping: (userId: string, roomId: string) => void;
    roomError: (roomId: string, message: string, details: string | undefined) => void;
}

export interface ClientToServerEvents {
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    markAsRead: (roomId: string) => void;
    typing: (roomId: string, userId: string) => void;
    stopTyping: (roomId: string, userId: string) => void;
    editMessage: (message: Message, roomId: string) => void;
    sendMessage: (message: Message, roomId: string) => void;
    createdRoom: (partnerId: string, roomId: string) => void;
    deleteMessage: (message: Message, roomId: string) => void;
}
