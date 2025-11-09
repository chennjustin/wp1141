import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const following = await prisma.follow.findMany({
      where: {
        followerId: user.id,
      },
      select: {
        followingId: true,
      },
    })

    const followingIds = following.map((f) => f.followingId)

    return NextResponse.json({ followingIds })
  } catch (error) {
    console.error('Error fetching following IDs:', error)
    return NextResponse.json({ error: 'Failed to fetch following IDs' }, { status: 500 })
  }
}

