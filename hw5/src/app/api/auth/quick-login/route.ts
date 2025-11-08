import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 查詢該 userId 對應的用戶
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        id: true,
        accounts: {
          select: { provider: true },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 檢查當前 session 是否就是這個用戶
    const session = await getServerSession(authOptions)
    if (session?.user?.id === user.id) {
      // 如果當前 session 就是這個用戶，直接返回成功
      return NextResponse.json({ success: true, alreadyLoggedIn: true })
    }

    // 如果沒有 session 或 session 不是這個用戶，返回需要重新登入
    return NextResponse.json({
      success: false,
      needsReauth: true,
      provider: user.accounts[0]?.provider,
    })
  } catch (error) {
    console.error('Error in quick-login:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

