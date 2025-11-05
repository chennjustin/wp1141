import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all' // 'all' or 'following'
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')

    const user = await getCurrentUser()

    // 如果要查看追蹤的人的貼文，需要登入
    if (type === 'following' && !user) {
      return unauthorizedResponse()
    }

    const where: any = {
      parentId: null, // 只返回原始貼文，不包含回覆
    }

    if (type === 'following' && user) {
      // 獲取當前用戶追蹤的所有用戶 ID
      const following = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      })

      const followingIds = following.map((f) => f.followingId)
      if (followingIds.length === 0) {
        // 如果沒有追蹤任何人，返回空列表
        return NextResponse.json({
          posts: [],
          nextCursor: null,
        })
      }

      where.authorId = {
        in: followingIds,
      }
    }

    const posts = await prisma.post.findMany({
      where,
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
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
        _count: {
          select: {
            likes: true,
            replies: true,
            reposts: true,
          },
        },
      },
    })

    const hasMore = posts.length > limit
    const result = hasMore ? posts.slice(0, -1) : posts
    const nextCursor = hasMore ? result[result.length - 1].id : null

    return NextResponse.json({
      posts: result,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

