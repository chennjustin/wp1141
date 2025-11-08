import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

const MAX_RESULTS = 8

const buildWhereClause = (query: string | null) => {
  const base: Record<string, any> = {
    userId: {
      not: null,
    },
  }

  if (query && query.trim().length > 0) {
    base.AND = [
      {
        OR: [
          {
            userId: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
    ]
  }

  return base
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return unauthorizedResponse()
    }

    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')
    const limitParam = searchParams.get('limit')
    const limit = Math.min(
      MAX_RESULTS,
      Math.max(1, limitParam ? Number.parseInt(limitParam, 10) || MAX_RESULTS : MAX_RESULTS)
    )

    const following = await prisma.follow.findMany({
      where: {
        followerId: user.id,
      },
      select: {
        followingId: true,
      },
    })

    const followingIds = following.map((item) => item.followingId)

    const selectFields = {
      id: true,
      userId: true,
      name: true,
      image: true,
      avatarUrl: true,
    }

    const followedUsers =
      followingIds.length === 0
        ? []
        : await prisma.user.findMany({
            where: {
              ...buildWhereClause(query),
              id: {
                in: followingIds,
              },
            },
            select: selectFields,
            orderBy: [
              {
                userId: 'asc',
              },
            ],
            take: limit,
          })

    const taken = followedUsers.length
    const remaining = Math.max(0, limit - taken)

    const excludedIds = new Set<string>([user.id, ...followingIds])

    let otherUsers: Array<{
      id: string
      userId: string | null
      name: string | null
      image: string | null
      avatarUrl: string | null
    }> = []

    if (remaining > 0) {
      otherUsers = await prisma.user.findMany({
        where: {
          ...buildWhereClause(query),
          id: {
            notIn: Array.from(excludedIds),
          },
        },
        select: selectFields,
        orderBy: [
          {
            userId: 'asc',
          },
        ],
        take: remaining,
      })
    }

    const combined = [...followedUsers, ...otherUsers].filter((candidate) => candidate.userId)

    return NextResponse.json({
      users: combined,
    })
  } catch (error) {
    console.error('Error fetching mention suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch mention suggestions' }, { status: 500 })
  }
}


