import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

// Define Config type first to avoid circular reference
export type Config = {
  nodeEnv: "development" | "production" | "test";
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  databaseUrl: string;
  nextAuthSecret: string;
  nextAuthUrl: string | undefined;
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
    };
  };
};

let _config: Config | null = null;

export function getConfig(): Config {
  if (_config) return _config;

  const env = envSchema.safeParse(process.env);

  if (!env.success) {
    console.error("❌ Invalid env variables", env.error.flatten().fieldErrors);

    // ❗ 不能 throw，否則 Edge / Build 會直接 crash
    // 改用 safe fallback
    throw new Error("Invalid environment variables");
  }

  _config = {
    nodeEnv: env.data.NODE_ENV,
    isDevelopment: env.data.NODE_ENV === "development",
    isProduction: env.data.NODE_ENV === "production",
    isTest: env.data.NODE_ENV === "test",
    databaseUrl: env.data.DATABASE_URL,
    nextAuthSecret: env.data.NEXTAUTH_SECRET,
    nextAuthUrl: env.data.NEXTAUTH_URL,
    oauth: {
      google: {
        clientId: env.data.GOOGLE_CLIENT_ID,
        clientSecret: env.data.GOOGLE_CLIENT_SECRET,
      },
    },
  };

  return _config;
}
