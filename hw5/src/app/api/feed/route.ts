import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') // 'following' or null

    const user = await getCurrentUser()

    // 如果要查看追蹤的人的貼文，需要登入
    if (filter === 'following' && !user) {
      return unauthorizedResponse()
    }

    const where: any = {
      parentId: null, // 只返回原始貼文，不包含回覆
    }

    if (filter === 'following' && user) {
      // 獲取當前用戶追蹤的所有用戶 ID
      const following = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      })

      const followingIds = following.map((f) => f.followingId)
      if (followingIds.length === 0) {
        // 如果沒有追蹤任何人，返回空列表
        return NextResponse.json([])
      }

      where.authorId = {
        in: followingIds,
      }
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
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

    // 格式化回傳資料，將 _count 轉換為明確的計數欄位
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author,
      likeCount: post._count.likes,
      repostCount: post._count.reposts,
      commentCount: post._count.replies,
      reposted: user ? (post.reposts as any)?.length > 0 : false,
      liked: user ? (post.likes as any)?.length > 0 : false,
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

