import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { generateUniqueUserId } from "./id";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // Use database sessions via Prisma models
  session: {
    strategy: "database",
  },
  events: {
    // Ensure userId is created at first login
    async createUser({ user }) {
      if (!user.id) return;
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { userId: await generateUniqueUserId() },
        });
      } catch (e) {
        // Ignore if already set by race condition
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        // Include userId in the session object for UI display
        // @ts-expect-error augmenting at runtime
        session.user.userId = user.userId ?? null;
      }
      return session;
    },
  },
  // Recommended for production
  secret: process.env.NEXTAUTH_SECRET,
});


