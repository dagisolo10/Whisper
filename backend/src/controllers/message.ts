import fs from "fs/promises";
import prisma from "@/lib/prisma";
import wrapper from "@/util/action-wrapper";
import { HttpError } from "@/lib/http-error";
import type { Request, Response } from "express";
import { Server as SocketServer } from "socket.io";
import { MessageType, Prisma, type Room } from "@prisma/client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket-events.js";

const cleanupFiles = async (files: Express.Multer.File[]) => {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
};

export async function sendMessage(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const files = Array.isArray(req.files) ? req.files : [];
        const messageType = req.body.messageType as MessageType;

        if (files.length > 0 && messageType !== "Image") {
            await cleanupFiles(files);
            throw new HttpError(400, "Files can only be uploaded with Image message type");
        }

        const textContent = typeof req.body.textContent === "string" ? req.body.textContent.trim() : "";
        const imageUrls = messageType === "Image" ? files.map((file) => `/uploads/${file.filename}`) : [];

        const senderId = req.userId;
        const roomId = req.body.roomId as string | undefined;
        const rawPartnerId = req.body.partnerId;
        const partnerId = typeof rawPartnerId === "string" ? rawPartnerId.trim() : "";

        try {
            if (!senderId) throw new HttpError(401, "Unauthorized. Login First");
            if (!messageType) throw new HttpError(400, "Message type is required");
            if (!Object.values(MessageType).includes(messageType)) throw new HttpError(400, "Invalid message type");
            if (!partnerId && !roomId) throw new HttpError(400, "Either partnerId or roomId are required");
            if (messageType === "Text" && !textContent) throw new HttpError(400, "Message text is required");
            if (messageType === "Image" && imageUrls.length === 0) throw new HttpError(400, "At least one image is required");
            if (!textContent && imageUrls.length === 0) throw new HttpError(400, "Message is required");
        } catch (error) {
            await cleanupFiles(files);
            throw error;
        }

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
                    textContent: textContent || null,
                    imageUrls,
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
        const textContent = typeof req.body.textContent === "string" ? req.body.textContent.trim() : "";
        const senderId = req.userId;

        if (!senderId) throw new HttpError(401, "Unauthorized. Login First");
        if (!id || typeof id !== "string") throw new HttpError(400, "Message ID is required");
        if (!textContent) throw new HttpError(400, "Message text is required");

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
        if (existingMessage.senderId !== senderId) throw new HttpError(403, "You can only edit your own messages");
        if (existingMessage.messageType !== "Text") throw new HttpError(400, "Only text messages can be edited");

        const isMember = existingMessage.room.members.some((m) => m.userId === senderId);
        if (!isMember) throw new HttpError(403, "Not a member of this room");

        const updatedMessage = await prisma.message.update({
            where: {
                id,
            },
            data: {
                textContent,
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
