import { Router } from "express";
import protect from "@/middlewares/auth";
import { deleteMessage, editMessage, sendMessage } from "@/controllers/message";

const messageRoute = Router();

messageRoute.post("/send", protect, sendMessage);
messageRoute.patch("/:id", protect, editMessage);
messageRoute.delete("/:id", protect, deleteMessage);

export default messageRoute;
