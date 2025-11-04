import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 取得最近登入的用戶（有設定 userId 的），按更新時間排序
    const recentUsers = await prisma.user.findMany({
      where: {
        userId: { not: null },
        name: { not: null },
      },
      select: {
        userId: true,
        name: true,
        image: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10, // 最多顯示 10 個
    })

    return NextResponse.json({ users: recentUsers })
  } catch (error) {
    console.error('Error fetching recent users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

