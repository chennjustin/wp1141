import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { config } from "@/config/env";
import type { Adapter } from "next-auth/adapters";

// Custom adapter wrapper to prevent account linking for same email different providers
// This ensures each provider account creates a separate user, even if email is the same
function createCustomAdapter(baseAdapter: Adapter): Adapter {
  return {
    ...baseAdapter,
    async getUserByEmail(email) {
      // Return null to prevent account linking based on email alone
      // This forces creation of a new user for each provider
      return null;
    },
  };
}

const baseAdapter = PrismaAdapter(prisma);
const customAdapter = createCustomAdapter(baseAdapter);

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  session: {
    strategy: "database",
  },
  providers: [
    Google({
      clientId: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-ins - custom adapter will handle user creation
      // Ensure user has required fields
      if (!user.name) {
        // If name is missing, use email or a default value
        user.name = user.email?.split("@")[0] || "User";
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // After login, redirect to root page with callbackUrl parameter
      // Root page will check userID and redirect to /register if needed
      // The callbackUrl will be preserved through the registration flow
      
      // Extract the pathname from the URL
      // If url is a relative path (starts with /), use it directly
      // Otherwise, parse it as a full URL and extract the pathname
      let targetPath: string;
      if (url.startsWith("/")) {
        targetPath = url;
      } else {
        try {
          const urlObj = new URL(url);
          targetPath = urlObj.pathname + urlObj.search;
        } catch {
          // If URL parsing fails, default to root
          targetPath = "/";
        }
      }
      
      if (targetPath && targetPath !== "/") {
        return `${baseUrl}/?callbackUrl=${encodeURIComponent(targetPath)}`;
      }
      
      return baseUrl;
    },
    async session({ session, user }) {
      try {
        // Ensure session.user exists
        if (!session.user) {
          return session;
        }

        // Add user id to session
        session.user.id = user.id;

        // Fetch userID from database using session utility
        const { getUserIDFromSession } = await import("@/modules/auth/session");
        const userID = await getUserIDFromSession(user.id);

          // Add userID to session for registration check (may be null if not yet registered)
        session.user.userID = userID;

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        // Set userID to null as fallback
        if (session.user) {
          session.user.userID = null;
        }
        return session;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (isNewUser) {
        console.log("New user signed in:", user.email);
      }
    },
  },
};

// Export NextAuth handler for API routes
const handler = NextAuth(authOptions);

export default handler;

