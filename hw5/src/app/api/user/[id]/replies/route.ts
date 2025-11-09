import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'
import { serializeAuthor } from '@/lib/serializers'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return unauthorizedResponse()
    }

    const currentUserId = currentUser.id
    if (!currentUserId) {
      return unauthorizedResponse()
    }

    // 檢查使用者是否存在
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!user) {
      return notFoundResponse('User not found')
    }

    // 取得該使用者回覆的所有留言（parentId 不為 null）
    const replies = await prisma.post.findMany({
      where: {
        authorId: params.id,
        parentId: {
          not: null,
        },
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
        likes: {
          where: {
            userId: currentUserId,
          },
          select: {
            userId: true,
          },
        },
        reposts: {
          where: {
            userId: currentUserId,
          },
          select: {
            userId: true,
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

    // 格式化回傳資料
    const posts = replies.map((reply) => {
      return {
        id: reply.id,
        content: reply.content,
        authorId: reply.authorId,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        mediaUrl: reply.mediaUrl,
        mediaType: reply.mediaType,
        author: serializeAuthor(reply.author),
        parent: reply.parent
          ? {
              id: reply.parent.id,
              content: reply.parent.content,
              authorId: reply.parent.authorId,
              createdAt: reply.parent.createdAt.toISOString(),
              updatedAt: reply.parent.updatedAt.toISOString(),
              author: serializeAuthor(reply.parent.author),
            }
          : null,
        likeCount: reply._count.likes,
        repostCount: reply._count.reposts,
        commentCount: reply._count.replies,
        liked: (reply.likes as any)?.length > 0,
        reposted: (reply.reposts as any)?.length > 0,
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching user replies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

