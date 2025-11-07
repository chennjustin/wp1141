import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-helpers'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        name: true,
        image: true,
        bio: true,
        email: true,
        avatarUrl: true,
        coverUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user) {
      return notFoundResponse('User not found')
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return unauthorizedResponse()
    }

    // 只能更新自己的資料
    if (params.id !== currentUser.id) {
      return forbiddenResponse('Can only update your own profile')
    }

    const { name, bio, avatarUrl, coverUrl } = await req.json()

    // 驗證資料
    const updateData: any = {}
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return badRequestResponse('name must be a string')
      }
      updateData.name = name.trim() || null
    }
    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return badRequestResponse('bio must be a string')
      }
      updateData.bio = bio.trim() || null
    }
    if (avatarUrl !== undefined) {
      if (avatarUrl !== null && typeof avatarUrl !== 'string') {
        return badRequestResponse('avatarUrl must be a string or null')
      }
      updateData.avatarUrl = avatarUrl || null
    }
    if (coverUrl !== undefined) {
      if (coverUrl !== null && typeof coverUrl !== 'string') {
        return badRequestResponse('coverUrl must be a string or null')
      }
      updateData.coverUrl = coverUrl || null
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        name: true,
        image: true,
        bio: true,
        email: true,
        avatarUrl: true,
        coverUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

