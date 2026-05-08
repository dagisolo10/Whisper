import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export default async function protect(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = getAuth(req);
        const testId = req.headers["x-test-user-id"] as string;

        const allowTestAuth = process.env.NODE_ENV === "development" && process.env.ALLOW_TEST_AUTH === "true";

        if (allowTestAuth && typeof testId === "string" && testId.trim()) {
            req.userId = testId;
            return next();
        }

        if (!userId) return res.status(401).json({ error: "Unauthorized. Login First", success: false });
        req.userId = userId;
        return next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ error: "Something went wrong", success: false });
    }
}
