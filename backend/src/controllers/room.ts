import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import wrapper from "@/util/action-wrapper";
import { HttpError } from "@/lib/http-error";
import type { Request, Response } from "express";
import { Server as SocketServer } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket-events";

export async function createRoom(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const userId = req.userId;
        const rawPartnerId = req.body.partnerId;
        const partnerId = typeof rawPartnerId === "string" ? rawPartnerId.trim() : "";

        if (!userId) throw new HttpError(401, "Unauthorized. Login First");
        if (!partnerId) throw new HttpError(400, "partnerId is required");
        if (partnerId === userId) throw new HttpError(400, "Cannot create room with yourself");

        const memberIds = [userId, partnerId];
        const pairKey = memberIds.sort().join("_");

        try {
            const room = await prisma.room.create({
                data: {
                    pairKey,
                    members: { create: memberIds.map((id) => ({ userId: id })) },
                },
                include: {
                    members: { include: { user: true } },
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    read: false,
                                    senderId: {
                                        not: userId,
                                    },
                                },
                            },
                        },
                    },
                },
            });

            return { ...room, unreadCount: room._count.messages };
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                const room = await prisma.room.findUnique({
                    where: { pairKey },
                    include: {
                        members: { include: { user: true } },
                        _count: {
                            select: {
                                messages: {
                                    where: {
                                        read: false,
                                        senderId: {
                                            not: userId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                if (room) return { ...room, unreadCount: room._count.messages };
            }

            throw error;
        }
    }, "createRoom");

    return result.success ? res.status(201).json(result) : res.status(result.status).json(result);
}

export async function getRooms(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const userId = req.userId;

        if (!userId) throw new HttpError(401, "Unauthorized. Login First");

        const rooms = await prisma.room.findMany({
            where: { members: { some: { userId } } },
            include: {
                lastMessage: { include: { user: true } },
                members: { include: { user: true } },
                _count: {
                    select: {
                        messages: {
                            where: {
                                read: false,
                                senderId: {
                                    not: userId,
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
        });

        return rooms.map((room) => ({ ...room, unreadCount: room._count.messages }));
    }, "getRooms");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}

export async function getConversation(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const roomId = req.params.id as string;
        const userId = req.userId;

        if (!userId) throw new HttpError(401, "Unauthorized. Login First");

        const roomData = await prisma.$transaction(async (tx) => {
            const roomAccess = await tx.room.findFirst({
                where: { id: roomId, members: { some: { userId } } },
                select: { id: true },
            });

            if (!roomAccess) throw new HttpError(404, "Room not found");

            await tx.message.updateMany({
                where: {
                    roomId,
                    read: false,
                    senderId: { not: userId },
                },
                data: { read: true },
            });

            const room = await tx.room.findFirst({
                where: { id: roomId, members: { some: { userId } } },
                include: {
                    members: { include: { user: true } },
                    _count: {
                        select: {
                            messages: {
                                where: {
                                    read: false,
                                    senderId: {
                                        not: userId,
                                    },
                                },
                            },
                        },
                    },
                    messages: {
                        take: 50,
                        include: { user: true, lastInRoom: true },
                        orderBy: { createdAt: "desc" },
                    },
                },
            });

            if (!room) throw new HttpError(404, "Room not found");

            return { ...room, unreadCount: room._count.messages };
        });

        const io: SocketServer<ClientToServerEvents, ServerToClientEvents> = req.app.get("io");
        if (roomData && io) {
            io.to(roomId).emit("messageRead", roomId);
        }

        return roomData;
    }, "getConversation");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}
