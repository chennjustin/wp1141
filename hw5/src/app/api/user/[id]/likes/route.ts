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

    // 取得該使用者按過讚的所有 Post（包括留言）
    const likes = await prisma.like.findMany({
      where: {
        userId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        post: {
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
        },
      },
    })

    // 格式化回傳資料
    const posts = likes.map((like) => {
      const post = like.post
      return {
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
              id: post.parent.id,
              content: post.parent.content,
              authorId: post.parent.authorId,
              createdAt: post.parent.createdAt.toISOString(),
              updatedAt: post.parent.updatedAt.toISOString(),
              author: serializeAuthor(post.parent.author),
            }
          : null,
        likeCount: post._count.likes,
        repostCount: post._count.reposts,
        commentCount: post._count.replies,
        liked: (post.likes as any)?.length > 0,
        reposted: (post.reposts as any)?.length > 0,
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching user likes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

