import fs from "fs";
import path from "path";
import multer from "multer";
import mime from "mime-types";
import { HttpError } from "@/lib/http-error";

export const uploadsDir = path.resolve(process.cwd(), "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const extFromMime = mime.extension(file.mimetype);
        const extension = extFromMime ? `.${extFromMime}` : ".bin";

        const baseName = path
            .basename(file.originalname, path.extname(file.originalname))
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 40);

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${baseName || "file"}-${uniqueSuffix}${extension}`);
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10,
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimetypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        if (!allowedMimetypes.includes(file.mimetype)) {
            cb(new HttpError(400, "Only JPEG, PNG, WEBP, and GIF images are supported"));
            return;
        }

        cb(null, true);
    },
});
