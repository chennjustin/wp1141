import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')

    const where: any = {
      parentId: null, // 只返回原始貼文，不包含回覆
    }

    if (userId) {
      where.authorId = userId
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
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { content, parentId } = await req.json()

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return badRequestResponse('Content is required')
    }

    if (content.length > 280) {
      return badRequestResponse('Content must be 280 characters or less')
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        ...(parentId && { parentId }),
      },
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

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return badRequestResponse('postId is required')
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

