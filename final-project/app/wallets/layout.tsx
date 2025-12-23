import { ReactNode } from "react";
import { validateAuthForRoute } from "@/modules/auth/validate-auth";
import { WalletsClientLayout } from "./WalletsClientLayout";

interface WalletsLayoutProps {
  children: ReactNode;
}

/**
 * Wallets layout wrapper - Server Component
 * 
 * This layout performs authentication validation before rendering the client layout.
 * All routes under /wallets will be protected by this validation.
 * 
 * This ensures that every route under /wallets is authenticated and has userID
 * before any rendering occurs.
 * 
 * Note: Layout components cannot receive searchParams, so callbackUrl handling
 * is done at the page level. The validation here ensures session and userID are valid.
 */
export default async function WalletsLayout({ children }: WalletsLayoutProps) {
  // Validate authentication and userID for all /wallets routes
  // This will redirect to /login if not authenticated, or /register if no userID
  // Note: callbackUrl redirect after successful validation is handled at page level
  await validateAuthForRoute({
    pathname: "/wallets",
  });

  // If we reach here, user is authenticated and has userID
  // Render the client layout component
  return <WalletsClientLayout>{children}</WalletsClientLayout>;
}
