import { PrismaClient } from '@prisma/client'
import { BasicAuthor, Post } from '@/types/post'

interface ReplyWithRelations {
  id: string
  content: string
  authorId: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  mediaUrl: string | null
  mediaType: string | null
  author: BasicAuthor
  parent: {
    id: string
    authorId: string
    author: BasicAuthor
  } | null
  likes: Array<{ userId: string }>
  reposts: Array<{ userId: string }>
  _count: {
    likes: number
    replies: number
    reposts: number
  }
}

interface FormattedReply {
  id: string
  content: string
  authorId: string
  parentId: string | null
  depth: number
  createdAt: string
  updatedAt: string
  mediaUrl: string | null
  mediaType: 'image' | 'video' | null
  author: BasicAuthor
  parent: {
    id: string
    content: string
    authorId: string
    createdAt: string
    updatedAt: string
    author: BasicAuthor
  } | null
  likeCount: number
  repostCount: number
  commentCount: number
  liked: boolean
  reposted: boolean
}

/**
 * 遞迴查詢所有層級的 replies（留言的留言）
 * @param prisma Prisma client instance
 * @param postId 父貼文 ID
 * @param userId 當前使用者 ID（用於查詢 likes 和 reposts）
 * @param maxDepth 最大深度（預設 10 層，防止無限遞迴）
 * @returns 所有層級的 replies（平鋪陣列）
 */
export async function getNestedReplies(
  prisma: PrismaClient,
  postId: string,
  userId: string,
  maxDepth: number = 10
): Promise<FormattedReply[]> {
  const allReplies: FormattedReply[] = []
  
  // 遞迴函數來查詢所有層級
  async function fetchReplies(parentId: string, depth: number = 0): Promise<void> {
    if (depth >= maxDepth) {
      console.warn(`Maximum reply depth (${maxDepth}) reached for post ${postId}`)
      return
    }

    try {
      const replies = (await prisma.post.findMany({
        where: {
          parentId: parentId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              userId: true,
              name: true,
              image: true,
              avatarUrl: true,
            } as any,
          },
          parent: {
            select: {
              id: true,
              authorId: true,
              author: {
                select: {
                  id: true,
                  userId: true,
                  name: true,
                  image: true,
                  avatarUrl: true,
                } as any,
              },
            },
          },
          likes: {
            where: {
              userId: userId,
            },
            select: {
              userId: true,
            },
          },
          reposts: {
            where: {
              userId: userId,
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
      }) as unknown) as ReplyWithRelations[]

      for (const reply of replies) {
        const formattedReply: FormattedReply = {
          id: reply.id,
          content: reply.content,
          authorId: reply.authorId,
          parentId: reply.parentId,
          depth: depth,
          createdAt: reply.createdAt.toISOString(),
          updatedAt: reply.updatedAt.toISOString(),
          mediaUrl: reply.mediaUrl,
          mediaType: reply.mediaType as 'image' | 'video' | null,
          author: {
            ...reply.author,
            avatarUrl: reply.author.avatarUrl ?? null,
          },
          parent: reply.parent
            ? {
                id: reply.parent.id,
                content: '',
                authorId: reply.parent.authorId,
                createdAt: '',
                updatedAt: '',
                author: {
                  ...reply.parent.author,
                  avatarUrl: reply.parent.author.avatarUrl ?? null,
                },
              }
            : null,
          likeCount: reply._count.likes,
          repostCount: reply._count.reposts,
          commentCount: reply._count.replies,
          liked: reply.likes.length > 0,
          reposted: reply.reposts.length > 0,
        }
        
        allReplies.push(formattedReply)
        
        // 遞迴查詢該 reply 的 replies
        await fetchReplies(reply.id, depth + 1)
      }
    } catch (error) {
      console.error(`Error fetching replies for parent ${parentId} at depth ${depth}:`, error)
      // 不中斷整個流程，繼續處理其他 replies
    }
  }

  try {
    await fetchReplies(postId)
  } catch (error) {
    console.error(`Error in getNestedReplies for post ${postId}:`, error)
    throw error
  }
  
  return allReplies
}

/**
 * 將平鋪的 replies 轉換為樹狀結構
 * @param replies 平鋪的 replies 陣列
 * @param parentId 父貼文 ID
 * @returns 樹狀結構的 replies
 */
export function buildReplyTree(replies: FormattedReply[], parentId: string | null): Post[] {
  return replies
    .filter((reply) => reply.parentId === parentId)
    .map((reply) => ({
      ...reply,
      replies: buildReplyTree(replies, reply.id),
    }))
}

