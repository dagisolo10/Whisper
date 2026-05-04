import { Router } from "express";
import protect from "@/middlewares/auth";
import { createUser, getUser, searchUser, updateUser } from "@/controllers/user";

const userRoute = Router();

userRoute.get("/", protect, getUser);
userRoute.post("/", protect, createUser);
userRoute.patch("/", protect, updateUser);
userRoute.get("/search", protect, searchUser);

export default userRoute;
