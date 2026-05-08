import { HttpError } from "./http-error";

import ENV from "@/util/env.js";
import prisma from "@/lib/prisma.js";
import { verifyToken } from "@clerk/backend";
import type { Message } from "@prisma/client";
import type { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket-events";

const userSocketMap = new Map<string, string[]>();

export default function initializeSocket(server: HttpServer) {
    const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
        cors: { origin: ENV.CLIENT_URL, credentials: true },
    });

    console.log("🚀 Socket.IO server connecting...");

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (typeof token !== "string" || !token.trim()) {
                return next(new HttpError(401, "Unauthorized: missing socket token"));
            }

            let userId;

            if (process.env.NODE_ENV === "development") {
                userId = token;
            } else {
                const payload = await verifyToken(token, { secretKey: ENV.CLERK_SECRET_KEY });
                userId = typeof payload?.sub === "string" ? payload.sub : undefined;
            }

            if (!userId) {
                return next(new HttpError(401, "Unauthorized: invalid socket token"));
            }

            socket.data.userId = userId;
            next();
        } catch (error) {
            console.error("Socket auth error:", error);
            next(new HttpError(401, "Unauthorized: failed socket authentication"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        if (userId) socket.join(`user_${userId}`);

        const currentSockets = userSocketMap.get(userId) || [];
        userSocketMap.set(userId, [...currentSockets, socket.id]);
        const connectedUsers = Array.from(userSocketMap.keys());
        socket.emit("onlineUsers", connectedUsers);
        io.emit("onlineUsers", connectedUsers);
        console.log(`Socket.IO connected. User ${userId} is online`);

        socket.on("joinRoom", async (roomId: string) => {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("roomJoinError", roomId, "Unauthorized: missing socket user id");
                return;
            }

            const isMember = await prisma.room.findFirst({ where: { id: roomId, members: { some: { userId } } }, select: { id: true } });

            if (!isMember) {
                socket.emit("roomJoinError", roomId, "Unauthorized: not a member of the room");
                return;
            }

            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on("leaveRoom", async (roomId: string) => {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("roomLeaveError", roomId, "Unauthorized: missing socket user id");
                return;
            }

            const isMember = await prisma.room.findFirst({ where: { id: roomId, members: { some: { userId } } }, select: { id: true } });

            if (!isMember) {
                socket.emit("roomLeaveError", roomId, "Unauthorized: not a member of the room");
                return;
            }

            socket.leave(roomId);
            console.log(`User ${socket.id} left room ${roomId}`);
        });

        socket.on("markAsRead", async (roomId: string) => {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("roomJoinError", roomId, "Unauthorized: missing socket user id");
                return;
            }

            try {
                const isMember = await prisma.room.findFirst({ where: { id: roomId, members: { some: { userId } } }, select: { id: true } });

                if (!isMember) {
                    socket.emit("roomJoinError", roomId, "Unauthorized: not a member of the room");
                    return;
                }

                await prisma.message.updateMany({
                    where: { roomId, read: false, senderId: { not: userId } },
                    data: { read: true },
                });

                io.to(roomId).emit("messageRead", roomId);
            } catch (error: any) {
                console.error(`Error in markAsRead for room ${roomId}:`, error);
                socket.emit("roomError", roomId, "Failed to mark messages as read", process.env.NODE_ENV === "development" ? error.message : undefined);
            }
        });

        socket.on("sendMessage", async (newMessage: Message, roomId: string) => {
            if (socket.data.userId !== newMessage.senderId) return;

            const room = await prisma.room.findUnique({ where: { id: roomId }, include: { members: true } });

            io.to(roomId).emit("newMessage", newMessage, roomId);

            if (room) {
                room.members.forEach((member) => {
                    io.to(`user_${member.userId}`).emit("newMessage", newMessage, roomId);
                });
            }
        });

        socket.on("editMessage", (updatedMessage: Message, roomId: string) => {
            if (socket.data.userId !== updatedMessage.senderId) return;
            io.to(roomId).emit("messageEdited", updatedMessage);
        });

        socket.on("deleteMessage", (deletedMessage: Message, roomId: string) => {
            if (socket.data.userId !== deletedMessage.senderId) return;
            socket.to(roomId).emit("messageDeleted", deletedMessage.id, roomId);
        });

        socket.on("typing", (roomId: string, userId: string) => {
            if (socket.data.userId !== userId) return;
            io.to(roomId).emit("userStartedTyping", userId, roomId);
        });

        socket.on("stopTyping", (roomId: string, userId: string) => {
            if (socket.data.userId !== userId) return;
            io.to(roomId).emit("userStoppedTyping", userId, roomId);
        });

        socket.on("disconnect", () => {
            const userId = socket.data.userId;
            if (userId) {
                const filteredSockets = userSocketMap.get(userId)?.filter((socketId) => socketId !== socket.id) || [];
                if (filteredSockets.length === 0) userSocketMap.delete(userId);
                else userSocketMap.set(userId, filteredSockets);

                io.emit("onlineUsers", Array.from(userSocketMap.keys()));
                console.log(`Socket.IO disconnected. User ${userId} is offline`);
            }
        });
    });

    return io;
}
