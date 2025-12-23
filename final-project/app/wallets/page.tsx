import { redirect } from "next/navigation";
import { validateAuthForRoute } from "@/modules/auth/validate-auth";
import { handleDefaultWalletRedirect } from "@/modules/wallet/utils/wallet-redirect";

/**
 * Wallets home page redirect
 */
export default async function WalletsPage() {
  // Validate authentication and userID
  // This will redirect to /login if not authenticated, /register if no userID,
  // or to callbackUrl if provided and validation passes
  const { session } = await validateAuthForRoute({
    pathname: "/wallets",
  });
  
  // At this point, user is authenticated and has userID, and no callbackUrl was provided
  // Try to redirect to default wallet if it exists and is valid
  await handleDefaultWalletRedirect(session, session.user.id);
  
  // If we reach here, no default wallet redirect occurred
  // Redirect to wallets home page
  redirect("/wallets/new");
}
