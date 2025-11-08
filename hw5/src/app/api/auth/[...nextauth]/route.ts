import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// 標記為 dynamic route，避免 Next.js 在 build 階段靜態分析
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

