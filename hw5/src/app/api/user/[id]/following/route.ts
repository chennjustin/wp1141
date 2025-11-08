import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, notFoundResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

type RelationshipUser = {
  id: string
  userId: string | null
  name: string | null
  avatarUrl: string | null
  bio: string | null
  isSelf: boolean
  isFollowing: boolean
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!targetUser) {
      return notFoundResponse('User not found')
    }

    const currentUser = await getCurrentUser()

    const following = await prisma.follow.findMany({
      where: {
        followerId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        following: {
          select: {
            id: true,
            userId: true,
            name: true,
            bio: true,
            image: true,
            avatarUrl: true,
          },
        },
      },
    })

    const followingUsers = following
      .map((follow) => follow.following)
      .filter((user): user is NonNullable<typeof user> => Boolean(user))

    let followingSet = new Set<string>()

    if (currentUser && followingUsers.length > 0) {
      const currentFollowing = await prisma.follow.findMany({
        where: {
          followerId: currentUser.id,
          followingId: {
            in: followingUsers.map((user) => user.id),
          },
        },
        select: {
          followingId: true,
        },
      })

      followingSet = new Set(currentFollowing.map((follow) => follow.followingId))
    }

    const formattedUsers: RelationshipUser[] = followingUsers.map((user) => ({
      id: user.id,
      userId: user.userId,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl || user.image,
      isSelf: currentUser?.id === user.id,
      isFollowing: currentUser ? followingSet.has(user.id) : false,
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 })
  }
}


