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

    const currentUserId = user.id
    if (!currentUserId) {
      return unauthorizedResponse()
    }

    const { postId } = await req.json()

    if (!postId || typeof postId !== 'string') {
      return badRequestResponse('postId is required')
    }

    // 檢查貼文是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        parentId: true,
      },
    })

    if (!post) {
      return notFoundResponse('Post not found')
    }

    // 檢查是否已經轉發
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: currentUserId,
          postId,
        },
      },
    })

    if (existingRepost) {
      // 取消轉發
      await prisma.repost.delete({
        where: {
          userId_postId: {
            userId: currentUserId,
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

      const repostCount = updatedPost?._count.reposts || 0

      // Trigger Pusher events
      try {
        const pusher = pusherServer()
        await Promise.all([
          pusher.trigger('feed', PUSHER_EVENTS.POST_REPOSTED, {
            postId,
            repostCount,
          }),
          pusher.trigger(`post-${postId}`, PUSHER_EVENTS.POST_REPOSTED, {
            postId,
            repostCount,
          }),
        ])
      } catch (pusherError) {
        console.error('Error triggering Pusher event:', pusherError)
        // Don't fail the request if Pusher fails
      }

      return NextResponse.json({
        reposted: false,
        repostCount,
      })
    } else {
      // 轉發
      await prisma.repost.create({
        data: {
          userId: currentUserId,
          postId,
        },
      })

      // 建立通知（不通知自己）
      // 通知原始貼文/留言的作者
      if (post.authorId && post.authorId !== currentUserId) {
        await createNotification(prisma, 'repost', currentUserId, post.authorId, postId)
      }

      // 如果 repost 的是留言（有 parentId），也要通知原始貼文的作者
      if (post.parentId) {
        const parentPost = await prisma.post.findUnique({
          where: { id: post.parentId },
          select: {
            authorId: true,
          },
        })

        if (parentPost && parentPost.authorId && parentPost.authorId !== currentUserId && parentPost.authorId !== post.authorId) {
          await createNotification(prisma, 'repost', currentUserId, parentPost.authorId, postId)
        }
      }

      // 取得更新後的 repostCount 和 repost 作者信息
      const updatedPost = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          _count: {
            select: {
              reposts: true,
            },
          },
          reposts: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  userId: true,
                  name: true,
                  image: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })

      const repostCount = updatedPost?._count.reposts || 0
      const latestRepost = updatedPost?.reposts?.[0]

      // Trigger Pusher events
      try {
        const pusher = pusherServer()
        await Promise.all([
          pusher.trigger('feed', PUSHER_EVENTS.POST_REPOSTED, {
            postId,
            repostCount,
            repostAuthor: latestRepost?.user ? {
              id: latestRepost.user.id,
              userId: latestRepost.user.userId,
              name: latestRepost.user.name,
              image: latestRepost.user.image,
              avatarUrl: latestRepost.user.avatarUrl,
            } : null,
          }),
          pusher.trigger(`post-${postId}`, PUSHER_EVENTS.POST_REPOSTED, {
            postId,
            repostCount,
            repostAuthor: latestRepost?.user ? {
              id: latestRepost.user.id,
              userId: latestRepost.user.userId,
              name: latestRepost.user.name,
              image: latestRepost.user.image,
              avatarUrl: latestRepost.user.avatarUrl,
            } : null,
          }),
        ])
      } catch (pusherError) {
        console.error('Error triggering Pusher event:', pusherError)
        // Don't fail the request if Pusher fails
      }

      return NextResponse.json({
        reposted: true,
        repostCount,
      })
    }
  } catch (error) {
    console.error('Error toggling repost:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

