import app from "@/lib/app";
import ENV from "@/util/env";
import prisma from "@/lib/prisma";
import { createServer } from "http";
import initializeSocket from "@/lib/socket";

const server = createServer(app);

const io = initializeSocket(server);

app.set("io", io);

async function start() {
    try {
        await prisma.$connect();
        console.log("✅ Database connected");

        const port = ENV.PORT;
        const serverUrl = ENV.NODE_ENV === "development" ? ENV.LOCAL_URL + port : ENV.SERVER_URL;
        console.log("DATABASE_URL exists:", ENV.DATABASE_URL);

        server.listen(port, () => console.log("🚀 Server running on", serverUrl));
    } catch (err) {
        console.error("❌ Database failed", err);
        process.exit(1);
    }
}

start();
