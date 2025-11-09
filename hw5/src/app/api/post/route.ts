import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse } from '@/lib/api-helpers'
import { pusherServer } from '@/lib/pusher/server'
import { PUSHER_EVENTS } from '@/lib/pusher/events'
import { serializeAuthor } from '@/lib/serializers'
import { createNotification } from '@/lib/notification-helpers'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    const posts = await prisma.post.findMany({
      where: {
        parentId: null, // 只返回原始貼文，不包含回覆
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
            avatarUrl: true,
          },
        },
        reposts: user
          ? {
              where: {
                userId: user.id,
              },
              select: {
                userId: true,
              },
            }
          : false,
        likes: user
          ? {
              where: {
                userId: user.id,
              },
              select: {
                userId: true,
              },
            }
          : false,
        _count: {
          select: {
            likes: true,
            replies: true,
            reposts: true,
          },
        },
      },
    })

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      author: serializeAuthor(post.author),
      likeCount: post._count.likes,
      repostCount: post._count.reposts,
      commentCount: post._count.replies,
      reposted: user ? (post.reposts as any)?.length > 0 : false,
      liked: user ? (post.likes as any)?.length > 0 : false,
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const authorId = user.id
    if (!authorId) {
      return unauthorizedResponse()
    }

    const { content, mediaUrl, mediaType } = await req.json()

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return badRequestResponse('Content is required')
    }

    const trimmedContent = content.trim()

    if (trimmedContent.length > 280) {
      return badRequestResponse('Content must be 280 characters or less')
    }

    // Validate mediaType if provided
    if (mediaType !== undefined && mediaType !== null) {
      if (mediaType !== 'image' && mediaType !== 'video') {
        return badRequestResponse('mediaType must be "image" or "video"')
      }
    }

    const post = await prisma.post.create({
      data: {
        content: trimmedContent,
        authorId,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      },
      include: {
        author: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
            reposts: true,
          },
        },
      },
    })

    const formattedPost = {
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      author: serializeAuthor(post.author),
      likeCount: post._count.likes,
      repostCount: post._count.reposts,
      commentCount: post._count.replies,
    }

    // Send mention notifications
    const mentionMatches = Array.from(trimmedContent.matchAll(/(^|\s)@([A-Za-z0-9_]{1,32})/g))
    const mentionHandles = Array.from(
      new Set(mentionMatches.map((match) => match[2].toLowerCase()))
    )

    if (mentionHandles.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          OR: mentionHandles.map((handle) => ({
            userId: {
              equals: handle,
              mode: 'insensitive',
            },
          })),
        },
        select: {
          id: true,
        },
      })

      await Promise.all(
        mentionedUsers
          .filter((mentioned) => mentioned.id !== authorId)
          .map((mentioned) =>
            createNotification(prisma, 'mention', authorId, mentioned.id, post.id)
          )
      )
    }

    // Trigger Pusher event
    try {
      await pusherServer().trigger('feed', PUSHER_EVENTS.POST_CREATED, {
        post: formattedPost,
      })
    } catch (pusherError) {
      console.error('Error triggering Pusher event:', pusherError)
      // Don't fail the request if Pusher fails
    }

    return NextResponse.json(formattedPost, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const authorId = user.id
    if (!authorId) {
      return unauthorizedResponse()
    }

    const { postId } = await req.json()

    if (!postId || typeof postId !== 'string') {
      return badRequestResponse('postId is required')
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.authorId !== authorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

