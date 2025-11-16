import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Explicitly specify Node.js runtime to avoid Edge Runtime limitations
// Edge Runtime does not support Node.js APIs like __dirname, __filename, fs, etc.
// This ensures compatibility with next-auth's withAuth middleware
export const runtime = "nodejs";

export default withAuth(
  function middleware(req) {
    const { pathname, search } = req.nextUrl;

    // Detect database session cookie by environment
    // Cover both NextAuth v4 (next-auth.*) and Auth.js v5 (authjs.*) cookie names
    const sessionCookie =
      req.cookies.get("__Secure-next-auth.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value ||
      req.cookies.get("authjs.session-token")?.value;

    const isLoggedIn = Boolean(sessionCookie);

    if(process.env.NODE_ENV === "development") {
      console.log("--------------------------------");
      console.log("Path: ", req.url);
      console.log("Session Cookie: ", sessionCookie);
      console.log("Is Logged In: ", isLoggedIn);
      console.log("Pathname: ", pathname);
      console.log("Search: ", search);
      console.log("--------------------------------");
    }

    // Define public paths that do not require authentication
    const isPublic =
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/public") ||
      pathname === "/favicon.ico";

    // If route is protected and user is not logged in, redirect to /login with callback
    if (!isPublic && !isLoggedIn) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?callbackUrl=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

