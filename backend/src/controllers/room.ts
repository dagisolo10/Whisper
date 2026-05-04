import prisma from "@/lib/prisma";
import wrapper from "@/util/action-wrapper";
import type { Request, Response } from "express";

export async function createRoom(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const userId = req.userId;
        const partnerId = req.body.partnerId as string;

        if (!userId) throw new HttpError(401, "Unauthorized. Login First");

        const memberIds = [userId, partnerId];

        if (memberIds.length !== 2) throw new HttpError(400, "Room require exactly two members");

        const existingRoom = await prisma.room.findFirst({
            where: {
                AND: memberIds.map((id) => ({ members: { some: { userId: id } } })),
            },
            include: {
                members: { include: { user: true } },
                messages: { include: { user: true }, orderBy: { createdAt: "asc" } },
            },
        });

        if (existingRoom && existingRoom.members.length === 2) return existingRoom;

        const room = await prisma.room.create({
            data: { members: { create: memberIds.map((id) => ({ userId: id })) } },
            include: {
                members: { include: { user: true } },
                messages: { include: { user: true }, orderBy: { createdAt: "asc" } },
            },
        });

        return room;
    }, "createRoom");

    return result.success ? res.status(201).json(result) : res.status(result.status).json(result);
}

export async function getRooms(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const userId = req.userId;

        if (!userId) throw new Error("Unauthorized. Login First");

        const rooms = await prisma.room.findMany({
            where: { members: { some: { userId } } },
            include: {
                lastMessage: true,
                members: { include: { user: true } },
                messages: { include: { user: true }, orderBy: { createdAt: "desc" } },
                _count: { select: { messages: { where: { read: false } } } },
            },
            orderBy: [{ lastMessage: { createdAt: "desc" } }, { updatedAt: "desc" }],
        });

        return rooms;
    }, "getRooms");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}

export async function getConversation(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const roomId = req.params.id as string;
        const userId = req.userId;

        if (!userId) throw new Error("Unauthorized. Login First");

        const roomData = await prisma.$transaction(async (tx) => {
            await tx.message.updateMany({
                where: { roomId, read: false, senderId: { not: userId } },
                data: { read: true },
            });

            const room = await tx.room.findFirst({
                where: { id: roomId, members: { some: { userId } } },
                include: {
                    members: { include: { user: true } },
                    messages: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 50 },
                },
            });

            if (!room) throw new Error("Room not found");

            return room;
        });

        return roomData;
    }, "getConversation");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}
