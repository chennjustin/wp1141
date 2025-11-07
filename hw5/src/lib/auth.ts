import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import { prisma } from './prisma'
import { CustomPrismaAdapter } from './custom-adapter'

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  // 關閉 email linking：同一個 email 用不同 provider 會建立不同帳號
  callbacks: {
    async signIn({ user, account }) {
      // 允許所有登入，但確保同一個 provider + providerAccountId 不會重複建立帳號
      return true
    },
    async jwt({ token, user, account, trigger }) {
      // 首次登入時或更新資料時，重新查詢資料庫獲取最新用戶資訊
      if (user?.id || token?.sub) {
        const userId = user?.id || token.sub
        
        if (userId) {
          // 首次登入時設定過期時間
          if (user?.id) {
            token.sub = user.id
            token.exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 天
          }
          
          // 每次 JWT 被使用時，都重新查詢資料庫獲取最新資訊
          // 這樣註冊完成後，JWT 會自動更新為最新資料
          const dbUser = await prisma.user.findUnique({
            where: { id: userId as string },
            include: {
              accounts: { select: { provider: true }, take: 1 },
            },
          })
          
          if (dbUser) {
            token.userId = dbUser.userId
            token.name = dbUser.name
            token.email = dbUser.email
            token.image = dbUser.image
            token.bio = dbUser.bio ?? null
            token.avatarUrl = dbUser.avatarUrl ?? null
            token.coverUrl = dbUser.coverUrl ?? null
            token.provider = dbUser.accounts[0]?.provider
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      // 將 token 中的資訊同步到 session
      if (session.user && token?.sub) {
        session.user.id = token.sub
        session.user.userId = token.userId as string | undefined
        session.user.name = token.name as string | undefined
        session.user.email = token.email as string | undefined
        session.user.image = token.image as string | undefined
        session.user.bio = token.bio as string | undefined
        session.user.avatarUrl = token.avatarUrl as string | undefined
        session.user.coverUrl = token.coverUrl as string | undefined
        session.user.provider = token.provider as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // OAuth callback 後的處理：根據 callbackUrl 決定導向
      // 如果 callbackUrl 是根路徑，會由 root page 檢查並導向 /register 或 /home
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      // 預設導向根路徑，由 root page 處理
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 天
  },
}

