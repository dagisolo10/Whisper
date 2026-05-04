import prisma from "@/lib/prisma";
import wrapper from "@/util/action-wrapper";
import { HttpError } from "@/lib/http-error";
import type { Request, Response } from "express";
import { Server as SocketServer } from "socket.io";
import { MessageType, Prisma, type Room } from "@prisma/client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket-events.js";

export async function sendMessage(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const content = req.body.message as string;
        const messageType = req.body.messageType as MessageType;

        const senderId = req.userId;
        const roomId = req.body.roomId as string | undefined;
        const rawPartnerId = req.body.partnerId;
        const partnerId = typeof rawPartnerId === "string" ? rawPartnerId.trim() : "";

        if (!senderId) throw new HttpError(401, "Unauthorized. Login First");
        if (!content?.trim()) throw new HttpError(400, "Message is required");
        if (!messageType) throw new HttpError(400, "Message type is required");
        if (!Object.values(MessageType).includes(messageType)) throw new HttpError(400, "Invalid message type");
        if (!partnerId && !roomId) throw new HttpError(400, "Either partnerId or roomId are required");

        const result = await prisma.$transaction(async (tx) => {
            let existingRoom: Room | null = null;

            const memberIds = [senderId, partnerId];
            const pairKey = memberIds.sort().join("_");

            if (roomId && !partnerId) {
                existingRoom = await tx.room.findFirst({
                    where: {
                        id: roomId,
                        members: {
                            some: {
                                userId: senderId,
                            },
                        },
                    },
                    include: {
                        members: true,
                    },
                });
            } else if (!roomId && partnerId) {
                existingRoom = await tx.room.findUnique({
                    where: {
                        pairKey,
                    },
                    include: {
                        members: true,
                    },
                });

                if (!existingRoom) {
                    try {
                        existingRoom = await tx.room.create({
                            data: {
                                pairKey,
                                members: {
                                    create: [{ userId: senderId }, { userId: partnerId }],
                                },
                            },
                            include: {
                                members: true,
                            },
                        });
                    } catch (error) {
                        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                            existingRoom = await tx.room.findUnique({
                                where: {
                                    pairKey,
                                },
                                include: {
                                    members: true,
                                },
                            });
                        } else {
                            throw error;
                        }
                    }
                }
            }

            if (!existingRoom) throw new HttpError(404, "Room not found");

            const newMessage = await tx.message.create({
                data: {
                    senderId,
                    messageType,
                    content: content.trim(),
                    roomId: existingRoom.id,
                },
                include: {
                    user: true,
                },
            });

            await tx.room.update({
                where: {
                    id: existingRoom.id,
                },
                data: {
                    lastMessageId: newMessage.id,
                    lastMessageAt: newMessage.createdAt,
                },
            });

            const io: SocketServer<ClientToServerEvents, ServerToClientEvents> = req.app.get("io");

            if (io) {
                io.to(existingRoom.id).emit("newMessage", newMessage, existingRoom.id);
            }

            return { roomId: existingRoom.id, message: newMessage };
        });

        return result;
    }, "sendMessage");

    return result.success ? res.status(201).json(result) : res.status(result.status).json(result);
}

export async function editMessage(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const { id } = req.params;
        const { content } = req.body;
        const senderId = req.userId;

        if (!senderId) throw new Error("Unauthorized. Login First");
        if (!id || typeof id !== "string") throw new Error("Message ID is required");
        if (!content?.trim()) throw new Error("Message is required");

        const existingMessage = await prisma.message.findUnique({
            where: {
                id,
            },
            include: {
                room: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!existingMessage) throw new HttpError(404, "Message not found");
        if (existingMessage.senderId !== senderId) throw new HttpError(400, "You can only edit your own messages");

        const isMember = existingMessage.room.members.some((m) => m.userId === senderId);
        if (!isMember) throw new HttpError(400, "Not a member of this room");

        const updatedMessage = await prisma.message.update({
            where: {
                id,
            },
            data: {
                content: content.trim(),
            },
            include: {
                user: true,
            },
        });

        const io: SocketServer<ClientToServerEvents, ServerToClientEvents> = req.app.get("io");

        if (io) {
            io.to(existingMessage.roomId).emit("messageEdited", updatedMessage);
        }

        return updatedMessage;
    }, "editMessage");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}

export async function deleteMessage(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const { id } = req.params;
        const senderId = req.userId;

        if (!senderId) throw new HttpError(401, "Unauthorized. Login First");
        if (!id || typeof id !== "string") throw new HttpError(400, "Message ID is required");

        const existingMessage = await prisma.message.findUnique({
            where: {
                id,
            },
            include: {
                room: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!existingMessage) throw new HttpError(404, "Message not found");
        if (existingMessage.senderId !== senderId) throw new HttpError(400, "You can only delete your own messages");

        const isMember = existingMessage.room.members.some((m) => m.userId === senderId);
        if (!isMember) throw new HttpError(400, "Not a member of this room");

        const deletedMessage = await prisma.message.delete({ where: { id } });

        const io: SocketServer<ClientToServerEvents, ServerToClientEvents> = req.app.get("io");

        if (io) {
            io.to(existingMessage.roomId).emit("messageDeleted", existingMessage.id, existingMessage.roomId);
        }

        return deletedMessage;
    }, "deleteMessage");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}
