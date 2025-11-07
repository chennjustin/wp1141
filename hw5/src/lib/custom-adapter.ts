import { Adapter } from 'next-auth/adapters'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma) as Adapter

  return {
    ...baseAdapter,
    async getUserByAccount({ providerAccountId, provider }) {
      // 只透過 provider + providerAccountId 查找 User，不透過 email
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        select: { user: true },
      })
      return (account?.user ?? null) as any
    },
    async linkAccount(account: any) {
      // linkAccount 只會在已有 User 的情況下被呼叫
      // 我們確保不會透過 email 連結，只透過 provider + providerAccountId
      return await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },
    async createUser(user: any) {
      // 建立新 User 時，不檢查 email 是否已存在
      // 直接建立新 User，讓同一個 email 可以有多個 User
      return (await prisma.user.create({
        data: {
          email: user.email,
          emailVerified: user.emailVerified,
          name: user.name,
          image: user.image,
        },
      })) as any
    },
    async getUserByEmail(email) {
      // 覆蓋這個方法，讓它不透過 email 查找 User
      // 這樣 NextAuth 就不會嘗試連結同一個 email 的帳號
      // 返回 null 表示找不到，會建立新 User
      return null
    },
  }
}

