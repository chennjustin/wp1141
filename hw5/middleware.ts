import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 保護 /home 路由，需要登入
        if (req.nextUrl.pathname.startsWith('/home')) {
          return !!token
        }
        // 若進入 /onboarding 也需登入，但避免沒有 userId 的新用戶被擋在外
        if (req.nextUrl.pathname.startsWith('/onboarding')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/home/:path*', '/onboarding'],
}

