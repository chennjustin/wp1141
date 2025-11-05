import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notFoundResponse } from '@/lib/api-helpers'

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

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

