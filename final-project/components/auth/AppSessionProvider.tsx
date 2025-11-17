"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface AppSessionProviderProps {
  children: ReactNode;
}

/**
 * Global SessionProvider wrapper for NextAuth.
 *
 * This component ensures that hooks such as `useSession` can be used
 * anywhere in the client component tree.
 */
export function AppSessionProvider({ children }: AppSessionProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}




