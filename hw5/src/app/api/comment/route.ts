import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse, notFoundResponse } from '@/lib/api-helpers'
import { pusherServer } from '@/lib/pusher/server'
import { PUSHER_EVENTS } from '@/lib/pusher/events'
import { createNotification } from '@/lib/notification-helpers'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { postId, content } = await req.json()

    if (!postId || typeof postId !== 'string') {
      return badRequestResponse('postId is required')
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return badRequestResponse('Content is required')
    }

    if (content.length > 280) {
      return badRequestResponse('Content must be 280 characters or less')
    }

    // 檢查原始貼文是否存在
    const parentPost = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!parentPost) {
      return notFoundResponse('Post not found')
    }

    // 建立回覆（使用 parentId）
    const comment = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        parentId: postId,
      },
      include: {
        author: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    })

    // Get updated commentCount for parent post
    const updatedParentPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
      },
    })

    const commentCount = updatedParentPost?._count.replies || 0

    // 建立通知（不通知自己）
    if (parentPost.authorId !== user.id) {
      await createNotification(prisma, 'comment', user.id, parentPost.authorId, postId)
    }

    // Trigger Pusher events
    try {
      const pusher = pusherServer()
      await Promise.all([
        pusher.trigger('feed', PUSHER_EVENTS.POST_REPLIED, {
          parentId: postId,
          commentCount,
        }),
        pusher.trigger(`post-${postId}`, PUSHER_EVENTS.POST_REPLIED, {
          parentId: postId,
          commentCount,
        }),
      ])
    } catch (pusherError) {
      console.error('Error triggering Pusher event:', pusherError)
      // Don't fail the request if Pusher fails
    }

    return NextResponse.json(
      {
        comment,
        commentCount,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

