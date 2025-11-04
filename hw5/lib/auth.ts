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
  // 移除自動 userId 生成：改為首次登入導向 /onboarding 由使用者自行設定
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      // 登入時把使用者 id 放到 token.sub（NextAuth 既有），其餘維持不變
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      // 以 token.sub（即 user.id）查詢資料庫中的最新資料
      if (session.user && token?.sub) {
        session.user.id = token.sub
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { userId: true, name: true, email: true, image: true },
        })
        if (dbUser) {
          // 使用資料庫中的最新值，覆蓋 OAuth provider 提供的值
          if (dbUser.userId) {
            session.user.userId = dbUser.userId
          }
          if (dbUser.name) {
            session.user.name = dbUser.name
          }
          if (dbUser.email) {
            session.user.email = dbUser.email
          }
          if (dbUser.image) {
            session.user.image = dbUser.image
          }
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

