import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, name, bio } = await req.json()

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  // 檢查 userId 唯一性
  const exists = await prisma.user.findUnique({ where: { userId } })
  if (exists) {
    return NextResponse.json({ error: 'userId already taken' }, { status: 409 })
  }

  // 更新用戶資料
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      userId,
      name: name || undefined,
      bio: bio || undefined,
    },
    select: {
      userId: true,
      name: true,
      image: true,
      bio: true,
      email: true,
      accounts: {
        select: { provider: true },
        take: 1,
      },
    },
  })

  return NextResponse.json({
    success: true,
    user: {
      userId: updatedUser.userId,
      name: updatedUser.name,
      image: updatedUser.image,
      bio: updatedUser.bio,
      provider: updatedUser.accounts[0]?.provider,
      email: updatedUser.email,
    },
  })
}

