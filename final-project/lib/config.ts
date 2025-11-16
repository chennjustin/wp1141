/**
 * Configuration class for managing environment variables
 * Provides type-safe access to all environment variables used in the application
 * 
 * This class uses a singleton pattern to ensure configuration is loaded once
 * and validated at application startup. All environment variables are accessed
 * through this centralized configuration.
 */
class Config {
  // Application environment
  readonly nodeEnv: "development" | "production" | "test";
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;

  // Database configuration
  readonly databaseUrl: string;

  // NextAuth configuration
  readonly nextAuthSecret: string;
  readonly nextAuthUrl: string | undefined;

  // OAuth provider configurations
  readonly oauth: {
    google: {
      clientId: string;
      clientSecret: string;
    };
  };

  private constructor() {
    // Validate and set Node environment
    const env = process.env.NODE_ENV || "development";
    if (!["development", "production", "test"].includes(env)) {
      throw new Error(`Invalid NODE_ENV: ${env}. Must be one of: development, production, test`);
    }
    this.nodeEnv = env as "development" | "production" | "test";
    this.isDevelopment = this.nodeEnv === "development";
    this.isProduction = this.nodeEnv === "production";

    // Validate and set database URL
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Please set it in your environment variables.");
    }
    this.databaseUrl = process.env.DATABASE_URL;

    // Validate and set NextAuth configuration
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error("NEXTAUTH_SECRET is not set. Please set it in your environment variables.");
    }
    this.nextAuthSecret = process.env.NEXTAUTH_SECRET;
    this.nextAuthUrl = process.env.NEXTAUTH_URL;

    if (!this.nextAuthUrl && this.isProduction) {
      console.warn("NEXTAUTH_URL is not set. This may cause issues in production.");
    }

    // Validate and set OAuth provider configurations
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is not set. Please set it in your environment variables.");
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("GOOGLE_CLIENT_SECRET is not set. Please set it in your environment variables.");
    }

    this.oauth = {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    };
  }

  /**
   * Get the singleton instance of Config
   * This ensures configuration is loaded and validated only once
   */
  private static instance: Config | null = null;

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    Config.instance = null;
  }
}

// Export a singleton instance
export const config = Config.getInstance();

// Also export the Config class for testing purposes
export { Config };

