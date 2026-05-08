import type { Request, Response, NextFunction } from "express";
import multer from "multer";

export default function errorMiddleWare(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    if (err instanceof multer.MulterError) {
        statusCode = 400;
        message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 10MB or smaller" : err.message;
    } else if ((err as Error & { type?: string }).type === "entity.too.large") {
        statusCode = 413;
        message = "Request payload is too large";
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}
