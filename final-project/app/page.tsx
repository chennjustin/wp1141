import { redirect } from "next/navigation";
import { validateAuthForRoute } from "@/modules/auth/validate-auth";
import { handleDefaultWalletRedirect } from "@/modules/wallet/utils/wallet-redirect";

interface HomeProps {
  searchParams: { callbackUrl?: string };
}

/**
 * Home page - handles authentication validation and redirects
 */
export default async function Home({ searchParams }: HomeProps) {
  // Validate authentication and userID
  // This will redirect to /login if not authenticated, /register if no userID,
  // or to callbackUrl if provided and validation passes
  const { session } = await validateAuthForRoute({
    callbackUrl: searchParams.callbackUrl,
    pathname: "/",
  });
  
  // At this point, user is authenticated and has userID, and no callbackUrl was provided
  // Try to redirect to default wallet if it exists and is valid
  await handleDefaultWalletRedirect(session, session.user.id);
  
  // If we reach here, no default wallet redirect occurred
  // Redirect to wallets home page
  redirect("/wallets/new");
}
