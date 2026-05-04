import ENV from "@/util/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = ENV.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({ connectionString });
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter, log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
