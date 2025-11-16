import { PrismaClient } from "@prisma/client";
import { getConfig } from "@/config/env";

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

// Lazy load config to avoid Edge Runtime / Build issues
function getPrismaLogLevel(): ("query" | "error" | "warn" | "info")[] {
  try {
    const config = getConfig();
    return config.isDevelopment ? (["query", "error", "warn"] as const) : (["error"] as const);
  } catch {
    // Fallback if config not available (shouldn't happen in Node runtime)
    return ["error"];
  }
}

function shouldCachePrisma() {
  try {
    const config = getConfig();
    return !config.isProduction;
  } catch {
    // Fallback: cache in non-production
    return process.env.NODE_ENV !== "production";
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: getPrismaLogLevel(),
  });

if (shouldCachePrisma()) globalForPrisma.prisma = prisma;

