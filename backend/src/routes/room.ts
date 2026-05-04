import { Router } from "express";
import protect from "@/middlewares/auth";
import { getRooms, createRoom, getConversation } from "@/controllers/room";

const roomRoute = Router();

roomRoute.get("/list", protect, getRooms);
roomRoute.post("/create", protect, createRoom);
roomRoute.get("/:id", protect, getConversation);

export default roomRoute;
