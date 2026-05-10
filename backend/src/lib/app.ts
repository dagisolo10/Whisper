import cors from "cors";
import ENV from "@/util/env";
import express from "express";
import roomRoute from "@/routes/room";
import userRoute from "@/routes/user";
import messageRoute from "@/routes/message";
import { uploadsDir } from "@/middlewares/file";
import { clerkMiddleware } from "@clerk/express";
import errorMiddleWare from "@/middlewares/error";

const app = express();
app.use(express.json());

app.use(cors({ origin: [ENV.CLIENT_URL, "http://localhost:8081"], credentials: true }));
app.use(
    clerkMiddleware({
        clockSkewInMs: 60000,
    }),
);

app.use("/uploads", express.static(uploadsDir));

app.use("/user", userRoute);
app.use("/room", roomRoute);
app.use("/message", messageRoute);
app.use(errorMiddleWare);

export default app;
