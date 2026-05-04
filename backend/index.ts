import app from "@/lib/app";
import { createServer } from "http";
import initializeSocket from "@/lib/socket";

const port = process.env.PORT;

const server = createServer(app);

const io = initializeSocket(server);

app.set("io", io);

server.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
