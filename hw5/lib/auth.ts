import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { generateUserId } from './utils'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
  events: {
    async createUser({ user }) {
      // 當新用戶被創建時，生成 userId
      if (user.email) {
        const userId = await generateUserId(user.email)
        await prisma.user.update({
          where: { id: user.id },
          data: { userId },
        })
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      // 將 userId 添加到 session
      if (session.user && user) {
        // 使用從資料庫查詢的 user 對象（包含 userId）
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { userId: true },
        })
        if (dbUser?.userId) {
          session.user.userId = dbUser.userId
        } else if (user.email) {
          // 如果還沒有 userId，生成一個
          const userId = await generateUserId(user.email)
          await prisma.user.update({
            where: { id: user.id },
            data: { userId },
          })
          session.user.userId = userId
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

