import type { Member, Message, Room, User } from "@prisma/client";

export interface PopulatedMessage extends Message {
    user: User;
}

export interface PopulatedMember extends Member {
    user: User;
}

export interface PopulatedRoom extends Room {
    lastMessage?: PopulatedMessage;
    messages?: PopulatedMessage[];
    members?: PopulatedMember[];
}
