import cors from "cors";
import ENV from "@/util/env";
import express from "express";
import { clerkMiddleware } from "@clerk/express";

const app = express();
app.use(express.json());

app.use(cors({ origin: [ENV.CLIENT_URL], credentials: true }));
app.use(clerkMiddleware());


export default app;
