import pg from "pg";
import ENV from "@/util/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = ENV.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter, log: isProduction ? [] : ["query"] });

if (!isProduction) globalForPrisma.prisma = prisma;

export default prisma;
