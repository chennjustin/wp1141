import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AppLayout from '@/components/AppLayout'
import Navbar from '@/components/Navbar'
import PostDetailPage from '@/components/PostDetailPage'
import { Post } from '@/types/post'
import { getNestedReplies } from '@/lib/post-helpers'

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  // Get post from database
  const postData = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          userId: true,
          name: true,
          image: true,
        },
      },
      likes: {
        where: {
          userId: session.user.id as string,
        },
        select: {
          userId: true,
        },
      },
      // 不直接查詢 replies，改用遞迴查詢所有層級
      _count: {
        select: {
          likes: true,
          replies: true,
          reposts: true,
        },
      },
    },
  })

  if (!postData) {
    redirect('/home')
  }

  // Format parent post
  const parentPost: Post = {
    id: postData.id,
    content: postData.content,
    authorId: postData.authorId,
    createdAt: postData.createdAt.toISOString(),
    updatedAt: postData.updatedAt.toISOString(),
    mediaUrl: postData.mediaUrl,
    mediaType: postData.mediaType as 'image' | 'video' | null,
    author: postData.author,
    likeCount: postData._count.likes,
    repostCount: postData._count.reposts,
    commentCount: postData._count.replies,
    liked: (postData.likes as any)?.length > 0,
  }

  // 使用遞迴查詢所有層級的 replies（包括留言的留言）
  const allReplies = await getNestedReplies(
    prisma,
    params.id,
    session.user.id as string
  )

  // Format replies（包含 parent 資訊和層級）
  const replies: Post[] = allReplies.map((reply) => ({
    id: reply.id,
    content: reply.content,
    authorId: reply.authorId,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
    mediaUrl: reply.mediaUrl || null,
    mediaType: reply.mediaType || null,
    author: reply.author,
    parent: reply.parent || undefined,
    depth: reply.depth || 0, // 加入層級資訊
    likeCount: reply.likeCount,
    repostCount: reply.repostCount,
    commentCount: reply.commentCount,
    liked: reply.liked,
    reposted: reply.reposted,
  }))

  return (
    <AppLayout>
      <Navbar type="profile" profileName="Post" />
      <PostDetailPage parentPost={parentPost} replies={replies} />
    </AppLayout>
  )
}

