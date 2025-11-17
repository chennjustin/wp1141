import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface HomeProps {
  searchParams: { callbackUrl?: string };
}

export default async function Home({ searchParams }: HomeProps) {
  // Check authentication status
  const session = await getServerSession(authOptions);
  
  // If not authenticated, middleware will handle redirect to /login
  // If authenticated, redirect to appropriate page based on userID status
  if (session?.user) {
    // If user doesn't have userID, redirect to register with callbackUrl preserved
    if (!session.user.userID) {
      const callbackUrl = searchParams.callbackUrl || "/";
      redirect(`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    
    // If user has userID and callbackUrl is provided, redirect to callbackUrl
    if (searchParams.callbackUrl) {
      const callbackUrl = decodeURIComponent(searchParams.callbackUrl);
      redirect(callbackUrl);
    }
    
    // If user has userID and no explicit callbackUrl, redirect to wallets home
    redirect("/wallets");
  }
  
  // If no session, middleware will redirect to /login
  // This component won't render for unauthenticated users
  return null;
}
