import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-helpers'
import { serializeAuthor } from '@/lib/serializers'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
            bio: true,
            avatarUrl: true,
          },
        },
        parent: {
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
          },
        },
        replies: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
              },
            },
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

    if (!post) {
      return notFoundResponse('Post not found')
    }

    // Format response
    return NextResponse.json({
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      author: serializeAuthor(post.author),
      parent: post.parent
        ? {
            ...post.parent,
            author: serializeAuthor(post.parent.author),
          }
        : null,
      replies: post.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        authorId: reply.authorId,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        mediaUrl: reply.mediaUrl,
        mediaType: reply.mediaType,
        author: serializeAuthor(reply.author),
        likeCount: reply._count.likes,
        commentCount: reply._count.replies,
      })),
      likeCount: post._count.likes,
      repostCount: post._count.reposts,
      commentCount: post._count.replies,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const currentUserId = user.id
    if (!currentUserId) {
      return unauthorizedResponse()
    }

    // 檢查貼文是否存在
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!post) {
      return notFoundResponse('Post not found')
    }

    // 檢查是否為作者
    if (post.authorId !== currentUserId) {
      return forbiddenResponse('Only the author can delete this post')
    }

    // 刪除貼文
    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

