import fs from "fs";
import path from "path";
import multer from "multer";
import { HttpError } from "@/lib/http-error";

export const uploadsDir = path.resolve(process.cwd(), "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname);
        const baseName = path
            .basename(file.originalname, extension)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 40);

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${baseName || "image"}-${uniqueSuffix}${extension}`);
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
    },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new HttpError(400, "Only image uploads are supported"));
            return;
        }

        cb(null, true);
    },
});
