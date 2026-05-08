import cors from "cors";
import ENV from "@/util/env";
import express from "express";
import roomRoute from "@/routes/room";
import userRoute from "@/routes/user";
import messageRoute from "@/routes/message";
import { clerkMiddleware } from "@clerk/express";
import errorMiddleWare from "@/middlewares/error";
import { uploadsDir } from "@/middlewares/file";

const app = express();
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.use(cors({ origin: [ENV.CLIENT_URL], credentials: true }));
app.use(clerkMiddleware());

app.use("/user", userRoute);
app.use("/room", roomRoute);
app.use("/message", messageRoute);
app.use(errorMiddleWare);

export default app;
