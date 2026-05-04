import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export default async function protect(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized", success: false });

        req.userId = userId;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ error: "Invalid Session", success: false });
    }
}
