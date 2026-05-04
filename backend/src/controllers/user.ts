import prisma from "@/lib/prisma.js";
import type { User } from "@prisma/client";
import wrapper from "@/util/action-wrapper";
import type { Request, Response } from "express";
import { createUserPayloadSchema, updateUserPayloadSchema } from "@/lib/user-validation";

export async function createUser(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const id = req.userId;

        if (!id) throw new Error("Unauthorized. Login First");

        const parsedPayload = createUserPayloadSchema.safeParse(req.body);
        if (!parsedPayload.success) {
            throw new Error(parsedPayload.error.issues[0]?.message || "Invalid onboarding payload.");
        }

        const { name, username, bio, profile } = parsedPayload.data;
        const existingUsername = await prisma.user.findUnique({ where: { username } });

        if (existingUsername && existingUsername.id !== id) {
            throw new Error("Username is already taken by another account.");
        }

        const createData = {
            id,
            name,
            username,
            ...(bio !== undefined ? { bio } : {}),
            ...(profile !== undefined ? { profile } : {}),
        };

        const user = await prisma.user.create({ data: createData });

        return user;
    }, "createUser");

    return !result.success ? res.status(400).json(result) : res.status(200).json(result);
}

export async function updateUser(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const id = req.userId;

        if (!id) throw new Error("Unauthorized. Login First");

        const parsedPayload = updateUserPayloadSchema.safeParse(req.body);
        if (!parsedPayload.success) {
            throw new Error(parsedPayload.error.issues.map((iss) => iss.message).join(", ") || "Invalid onboarding payload.");
        }

        const { name, username, bio, profile } = parsedPayload.data;

        let existingUsername: User | null = null;
        if (username) {
            existingUsername = await prisma.user.findUnique({ where: { username } });
        }

        if (existingUsername && existingUsername.id !== id) {
            throw new Error("Username is already taken by another account.");
        }

        const updateData: Record<string, string | null> = {};
        if (name !== undefined) updateData.name = name;
        if (username !== undefined) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (profile !== undefined) updateData.profile = profile;

        const user = await prisma.user.update({ where: { id }, data: updateData });

        return user;
    }, "updateUser");

    return !result.success ? res.status(400).json(result) : res.status(200).json(result);
}

export async function getUser(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const id = req.userId;

        if (!id) throw new Error("Unauthorized. Login First");

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) throw new Error("User not found");

        return user;
    }, "getUser");

    return !result.success ? res.status(400).json(result) : res.status(200).json(result);
}

export async function searchUser(req: Request, res: Response) {
    const result = await wrapper(async () => {
        const id = req.userId;

        if (!id) throw new Error("Unauthorized. Login First");

        const name = req.query.name as string | undefined;
        const username = req.query.username as string | undefined;

        if (!name && !username) {
            throw new Error("Provide at least a name or username to search");
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    name
                        ? {
                              name: { contains: name, mode: "insensitive" },
                          }
                        : {},
                    username
                        ? {
                              username: { contains: username, mode: "insensitive" },
                          }
                        : {},
                ],
                NOT: { id },
            },
        });

        return users;
    }, "searchUser");

    return !result.success ? res.status(400).json(result) : res.status(200).json(result);
}
