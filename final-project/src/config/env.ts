/**
 * Environment variables configuration with Zod validation
 * 
 * This module provides type-safe access to all environment variables
 * used in the application. All environment variables are validated
 * at application startup using Zod schemas.
 */

import { z } from "zod";

/**
 * Schema for validating environment variables
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database configuration
  DATABASE_URL: z.string().url(),

  // NextAuth configuration
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),

  // OAuth provider configurations
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

/**
 * Validated environment variables
 */
const env = envSchema.parse(process.env);

/**
 * Type-safe environment configuration object
 */
export const config = {
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  databaseUrl: env.DATABASE_URL,

  nextAuthSecret: env.NEXTAUTH_SECRET,
  nextAuthUrl: env.NEXTAUTH_URL,

  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
} as const;

/**
 * Export type for the config object
 */
export type Config = typeof config;

