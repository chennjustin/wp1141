import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-helpers'
import { createNotification } from '@/lib/notification-helpers'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const followerId = user.id
    if (!followerId) {
      return unauthorizedResponse()
    }

    const { userId } = await req.json()

    if (!userId || typeof userId !== 'string') {
      return badRequestResponse('userId is required')
    }

    // 不能追蹤自己
    if (userId === followerId) {
      return forbiddenResponse('Cannot follow yourself')
    }

    // 檢查目標用戶是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return notFoundResponse('User not found')
    }

    // 檢查是否已經追蹤
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    })

    if (existingFollow) {
      // 取消追蹤
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userId,
          },
        },
      })

      return NextResponse.json({ following: false })
    } else {
      // 追蹤
      await prisma.follow.create({
        data: {
          followerId,
          followingId: userId,
        },
      })

      // 建立通知
      await createNotification(prisma, 'follow', followerId, userId, null)

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('Error toggling follow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

