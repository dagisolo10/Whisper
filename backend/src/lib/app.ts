import cors from "cors";
import ENV from "@/util/env";
import express from "express";
import roomRoute from "@/routes/room";
import userRoute from "@/routes/user";
import messageRoute from "@/routes/message";
import { clerkMiddleware } from "@clerk/express";

const app = express();
app.use(express.json());

app.use(cors({ origin: [ENV.CLIENT_URL], credentials: true }));
app.use(clerkMiddleware());

app.use("/user", userRoute);
app.use("/room", roomRoute);
app.use("/message", messageRoute);

export default app;
