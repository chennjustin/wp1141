import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse, notFoundResponse } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { postId } = await req.json()

    if (!postId || typeof postId !== 'string') {
      return badRequestResponse('postId is required')
    }

    // 檢查貼文是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return notFoundResponse('Post not found')
    }

    // 檢查是否已經轉發
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    })

    if (existingRepost) {
      // 取消轉發
      await prisma.repost.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId,
          },
        },
      })

      // 取得更新後的 repostCount
      const updatedPost = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          _count: {
            select: {
              reposts: true,
            },
          },
        },
      })

      return NextResponse.json({
        reposted: false,
        repostCount: updatedPost?._count.reposts || 0,
      })
    } else {
      // 轉發
      await prisma.repost.create({
        data: {
          userId: user.id,
          postId,
        },
      })

      // 取得更新後的 repostCount
      const updatedPost = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          _count: {
            select: {
              reposts: true,
            },
          },
        },
      })

      return NextResponse.json({
        reposted: true,
        repostCount: updatedPost?._count.reposts || 0,
      })
    }
  } catch (error) {
    console.error('Error toggling repost:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

