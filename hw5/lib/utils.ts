import { prisma } from './prisma'

/**
 * 生成唯一的 userId
 * 格式：email 前綴 + 隨機字串（4-6 位）
 * 例如：john@example.com -> john2k1
 */
export async function generateUserId(email: string): Promise<string> {
  // 提取 email 前綴（@ 符號前的部分）
  const emailPrefix = email.split('@')[0].toLowerCase()
  
  // 生成隨機字串（4-6 位，包含數字和字母）
  const randomString = Math.random()
    .toString(36)
    .substring(2, 8) // 6 位隨機字串
  
  const userId = `${emailPrefix}${randomString}`
  
  // 檢查是否已存在，如果存在則重新生成
  const existingUser = await prisma.user.findUnique({
    where: { userId },
  })
  
  if (existingUser) {
    // 遞迴重新生成直到找到唯一的 userId
    return generateUserId(email)
  }
  
  return userId
}

