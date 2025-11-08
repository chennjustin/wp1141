import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 使用官方推薦的 singleton 模式
// 確保在所有環境（包括 build 階段）都使用同一個實例
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// 在非 production 環境中，將實例保存到 global 以避免多個實例
// 注意：在 build 階段，即使 NODE_ENV 是 production，我們也需要設置 global
// 因為 Next.js build 可能會在開發模式下執行
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

