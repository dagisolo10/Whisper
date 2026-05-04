import { Router } from "express";
import protect from "@/middlewares/auth";
import { createUser, getUser, searchUser, updateUser } from "@/controllers/user";

const userRoute = Router();

userRoute.post("/", createUser);
userRoute.get("/", protect, getUser);
userRoute.patch("/", protect, updateUser);
userRoute.get("/search", protect, searchUser);

export default userRoute;
