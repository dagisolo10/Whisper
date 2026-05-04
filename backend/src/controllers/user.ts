import prisma from "@/lib/prisma.js";
import { getAuth } from "@clerk/express";
import wrapper from "@/util/action-wrapper";
import { HttpError } from "@/lib/http-error";
import type { Request, Response } from "express";
import type { Prisma, User } from "@prisma/client";
import { createUserPayloadSchema, updateUserPayloadSchema } from "@/lib/user-validation";

export async function createUser(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const { userId: id } = getAuth(req);

        if (!id) throw new HttpError(401, "Unauthorized. Login First");

        const parsedPayload = createUserPayloadSchema.safeParse(req.body);
        if (!parsedPayload.success) {
            throw new HttpError(400, parsedPayload.error.issues[0]?.message || "Invalid onboarding payload.");
        }

        const { name, username, bio, avatarUrl } = parsedPayload.data;
        const existingUsername = await prisma.user.findUnique({ where: { username } });

        if (existingUsername && existingUsername.id !== id) {
            throw new HttpError(400, "Username is already taken by another account.");
        }

        const createData: Prisma.UserCreateInput = {
            id,
            name,
            username,
            ...(bio !== undefined ? { bio } : {}),
            ...(avatarUrl !== undefined ? { avatarUrl } : {}),
            lastOnlineAt: new Date(),
        };

        try {
            const user = await prisma.user.create({ data: createData });
            return user;
        } catch (err: any) {
            if (err.code === "P2002") throw new HttpError(400, "Username is already taken");

            throw err;
        }
    }, "createUser");

    return result.success ? res.status(201).json(result) : res.status(result.status).json(result);
}

export async function updateUser(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const id = req.userId;

        if (!id) throw new HttpError(401, "Unauthorized. Login First");

        const parsedPayload = updateUserPayloadSchema.safeParse(req.body);
        if (!parsedPayload.success) {
            throw new HttpError(400, parsedPayload.error.issues.map((iss) => iss.message).join(", ") || "Invalid onboarding payload.");
        }

        const { name, username, bio, avatarUrl } = parsedPayload.data;

        let existingUsername: User | null = null;
        if (username) {
            existingUsername = await prisma.user.findUnique({ where: { username } });
        }

        if (existingUsername && existingUsername.id !== id) {
            throw new HttpError(400, "Username is already taken by another account.");
        }

        const updateData: Prisma.UserUpdateInput = {};
        updateData.lastOnlineAt = new Date();
        if (bio !== undefined) updateData.bio = bio;
        if (name !== undefined) updateData.name = name;
        if (username !== undefined) updateData.username = username;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

        if (Object.keys(updateData).length === 0) throw new HttpError(400, "No fields provided for update");

        try {
            const user = await prisma.user.update({ where: { id }, data: updateData });
            return user;
        } catch (err: any) {
            if (err.code === "P2002") {
                throw new HttpError(400, "Username is already taken");
            }
            if (err.code === "P2025") {
                throw new HttpError(404, "User not found");
            }
            throw err;
        }
    }, "updateUser");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}

export async function getUser(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const id = req.userId;

        if (!id) throw new HttpError(401, "Unauthorized. Login First");

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) throw new HttpError(404, "User not found");

        return user;
    }, "getUser");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}

export async function searchUser(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const id = req.userId;

        if (!id) throw new HttpError(401, "Unauthorized. Login First");

        const rawName = req.query.name;
        const rawUsername = req.query.username;
        const name = typeof rawName === "string" ? rawName : undefined;
        const username = typeof rawUsername === "string" ? rawUsername : undefined;

        if (!name && !username) {
            throw new HttpError(400, "Provide at least a name or username to search");
        }

        const conditions: Prisma.UserWhereInput[] = [];
        if (name) {
            conditions.push({ name: { contains: name, mode: "insensitive" as const } });
        }

        if (username) {
            conditions.push({ username: { contains: username, mode: "insensitive" as const } });
        }

        const users = await prisma.user.findMany({
            where: {
                OR: conditions,
                NOT: { id },
            },
            select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                bio: true,
            },
            take: 50,
        });

        return users;
    }, "searchUser");

    return result.success ? res.status(200).json(result) : res.status(result.status).json(result);
}
