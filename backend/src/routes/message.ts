import { Router } from "express";
import protect from "@/middlewares/auth";
import { upload } from "@/middlewares/file";
import { deleteMessage, editMessage, sendMessage } from "@/controllers/message";

const messageRoute = Router();

messageRoute.post("/send", protect, upload.array("files", 10), sendMessage);
messageRoute.patch("/:id", protect, editMessage);
messageRoute.delete("/:id", protect, deleteMessage);

export default messageRoute;
