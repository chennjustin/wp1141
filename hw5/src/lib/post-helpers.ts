import { PrismaClient } from '@prisma/client'

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
) {
  const allReplies: any[] = []
  
  // 遞迴函數來查詢所有層級
  async function fetchReplies(parentId: string, depth: number = 0): Promise<void> {
    if (depth >= maxDepth) {
      return
    }

    const replies = await prisma.post.findMany({
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
          },
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
              },
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
    })

    for (const reply of replies) {
      const formattedReply = {
        id: reply.id,
        content: reply.content,
        authorId: reply.authorId,
        parentId: reply.parentId,
        depth: depth, // 加入層級資訊
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        author: reply.author,
        parent: reply.parent ? {
          id: reply.parent.id,
          content: '',
          authorId: reply.parent.authorId,
          createdAt: '',
          updatedAt: '',
          author: reply.parent.author,
        } : null,
        likeCount: reply._count.likes,
        repostCount: reply._count.reposts,
        commentCount: reply._count.replies,
        liked: (reply.likes as any)?.length > 0,
        reposted: (reply.reposts as any)?.length > 0,
      }
      
      allReplies.push(formattedReply)
      
      // 遞迴查詢該 reply 的 replies
      await fetchReplies(reply.id, depth + 1)
    }
  }

  await fetchReplies(postId)
  
  return allReplies
}

/**
 * 將平鋪的 replies 轉換為樹狀結構
 * @param replies 平鋪的 replies 陣列
 * @param parentId 父貼文 ID
 * @returns 樹狀結構的 replies
 */
export function buildReplyTree(replies: any[], parentId: string | null): any[] {
  return replies
    .filter((reply) => reply.parentId === parentId)
    .map((reply) => ({
      ...reply,
      replies: buildReplyTree(replies, reply.id),
    }))
}

