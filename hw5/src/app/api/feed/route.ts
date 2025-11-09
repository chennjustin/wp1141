import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse } from '@/lib/api-helpers'
import { serializeAuthor } from '@/lib/serializers'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') // 'following' or null

    const user = await getCurrentUser()

    // 如果要查看追蹤的人的貼文，需要登入
    if (filter === 'following' && !user) {
      return unauthorizedResponse()
    }

    // 獲取所有被 repost 的貼文和留言
    // 在 home feed 中，只顯示貼文（parentId: null），留言不會被顯示
    // 在 following feed 中，如果留言被追蹤的人 repost，則可以顯示
    let repostedPostsWhere: any = {}
    if (user && filter === 'following') {
      // 獲取當前用戶追蹤的所有用戶 ID
      const following = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      })
      const followingIds = following.map((f) => f.followingId)
      if (followingIds.length > 0) {
        repostedPostsWhere = {
          userId: {
            in: followingIds,
          },
        }
      } else {
        // 如果沒有追蹤任何人，只返回空列表
        repostedPostsWhere = {
          userId: {
            in: [],
          },
        }
      }
    } else {
      // 在 home feed (filter !== 'following') 中，只顯示貼文，不顯示留言
      repostedPostsWhere = {
        post: {
          parentId: null, // 只顯示貼文，不顯示留言
        },
      }
    }

    const repostedPosts = await prisma.repost.findMany({
      where: repostedPostsWhere,
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
                reposts: true, // 留言的 repost count 就是 repost 該留言的數量
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
            avatarUrl: true,
          },
        },
      },
    })

    // 獲取原始貼文（沒有被 repost 的）
    const where: any = {
      parentId: null, // 只返回原始貼文，不包含回覆
      reposts: {
        none: {}, // 沒有被 repost 的貼文
      },
    }

    if (filter === 'following' && user) {
      // 獲取當前用戶追蹤的所有用戶 ID
      const following = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      })

      const followingIds = following.map((f) => f.followingId)
      if (followingIds.length === 0) {
        // 如果沒有追蹤任何人，只返回 reposted posts
        const formattedReposts = repostedPosts.map((repost) => {
          const post = repost.post
          const isCurrentUserRepost = user && repost.userId === user.id
          return {
            id: post.id,
            content: post.content,
            authorId: post.authorId,
            createdAt: post.createdAt.toISOString(), // 使用原始貼文時間，不使用 repost 時間
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
            depth: post.parentId ? 0 : undefined,
            likeCount: post._count.likes,
            repostCount: post._count.reposts,
            commentCount: post._count.replies,
            reposted: user ? (post.reposts as any)?.length > 0 : false,
            repostedByMe: isCurrentUserRepost || false,
            liked: user ? (post.likes as any)?.length > 0 : false,
          }
        })
        return NextResponse.json(formattedReposts)
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
            avatarUrl: true,
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

    // 格式化 reposted posts
    // 在 following feed 中，如果 repost 是由追蹤的用戶發起，則顯示 repostedBy
    // 使用原始貼文的時間，不使用 repost 時間
    const formattedReposts = repostedPosts.map((repost) => {
      const post = repost.post
      const isCurrentUserRepost = user && repost.userId === user.id
      const repostAuthor = serializeAuthor(repost.user)
      
      return {
        id: post.id,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(), // 使用原始貼文時間，不使用 repost 時間
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
        depth: post.parentId ? 0 : undefined,
        likeCount: post._count.likes,
        repostCount: post._count.reposts,
        commentCount: post._count.replies,
        reposted: user ? (post.reposts as any)?.length > 0 : false,
        repostedByMe: isCurrentUserRepost || false,
        // 在 following feed 中，如果 repost 不是當前用戶發起的，則顯示 repostedBy
        repostedBy: filter === 'following' && !isCurrentUserRepost ? repostAuthor : undefined,
        liked: user ? (post.likes as any)?.length > 0 : false,
      }
    })

    // 格式化原始貼文
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      author: serializeAuthor(post.author),
      likeCount: post._count.likes,
      repostCount: post._count.reposts, // 這個已經是正確的，因為只計算 repost 該貼文的數量
      commentCount: post._count.replies,
      reposted: user ? (post.reposts as any)?.length > 0 : false,
      liked: user ? (post.likes as any)?.length > 0 : false,
    }))

    // 合併並排序（按時間降序）
    const allPosts = [...formattedReposts, ...formattedPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json(allPosts)
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

