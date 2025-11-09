import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
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
  ],
  // 關閉 email linking：同一個 email 用不同 provider 會建立不同帳號
  callbacks: {
    async signIn({ user, account }) {
      // 允許所有登入，但確保同一個 provider + providerAccountId 不會重複建立帳號
      return true
    },
    async jwt({ token, user, account, trigger }) {
      // 首次登入時或更新資料時，重新查詢資料庫獲取最新用戶資訊
      const userId = user?.id || token.sub
      
      if (!userId || typeof userId !== 'string') {
        return token
      }

      try {
        // 首次登入時設定過期時間
        if (user?.id) {
          token.sub = user.id
          token.exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 天
        }
        
        // 只在首次登入、session 更新觸發、或 token 中沒有完整資訊時才查詢資料庫
        // 避免每次請求都查詢資料庫造成效能問題
        const shouldRefreshUserData = 
          user?.id || // 首次登入
          trigger === 'update' || // 手動更新 session
          !token.userId || // token 中沒有 userId（可能是舊 token）
          !token.name // token 中沒有 name（可能是舊 token）

        if (shouldRefreshUserData) {
          // 確保 Prisma 連線（防止 build 階段連線出錯）
          try {
            await prisma.$connect()
          } catch (connectError) {
            // Build 階段或資料庫未就緒時，跳過查詢
            console.warn('⚠️ Prisma not connected yet (build phase?):', connectError)
            return token
          }

          const dbUser = await (prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              userId: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              avatarUrl: true,
              coverUrl: true,
              accounts: {
                select: { provider: true },
                take: 1,
              },
            } as any,
          }) as Promise<{
            id: string
            userId: string | null
            name: string | null
            email: string | null
            image: string | null
            bio: string | null
            avatarUrl: string | null
            coverUrl: string | null
            accounts: Array<{ provider: string }>
          } | null>)
          
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
      } catch (error) {
        // 如果資料庫查詢失敗，記錄錯誤但不中斷 auth 流程
        // 使用 token 中現有的資料
        console.error('Error refreshing user data in JWT callback:', error)
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

