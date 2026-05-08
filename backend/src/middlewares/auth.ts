import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export default async function protect(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = getAuth(req);
        const testId = req.headers["x-test-user-id"];

        if (process.env.NODE_ENV === "development") {
            if (!testId) {
                return res.status(401).json({ error: "Test userId missing.", success: false });
            }
            req.userId = testId as string;
            return next();
        } else {
            if (!userId) return res.status(401).json({ error: "Unauthorized. Login First", success: false });
            req.userId = userId;
            next();
        }
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ error: "Something went wrong", success: false });
    }
}
