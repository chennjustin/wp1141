import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 保護 /home 和 /register 路由，需要登入
        if (req.nextUrl.pathname.startsWith('/home') || req.nextUrl.pathname.startsWith('/register')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/home/:path*', '/register'],
}

