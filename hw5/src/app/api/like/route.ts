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

    // 檢查是否已經按讚
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    })

    if (existingLike) {
      // 取消按讚
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId,
          },
        },
      })

      return NextResponse.json({ liked: false })
    } else {
      // 按讚
      await prisma.like.create({
        data: {
          userId: user.id,
          postId,
        },
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

