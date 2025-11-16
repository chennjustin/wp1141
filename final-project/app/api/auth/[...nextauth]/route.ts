import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Use Node.js runtime for next-auth and Prisma adapter
export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

