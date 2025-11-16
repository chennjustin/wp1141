import { PrismaClient } from "@prisma/client";
import { config } from "@/config/env";

/**
 * Prisma Client instance
 * 
 * Note: This file is a library module, not a route file.
 * Runtime configuration is set in route files (page.tsx, route.ts) that use this module.
 * Prisma Client can only run in Node.js runtime.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDevelopment ? ["query", "error", "warn"] : ["error"],
  });

if (!config.isProduction) globalForPrisma.prisma = prisma;

