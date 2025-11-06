import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AppLayout from '@/components/AppLayout'
import Navbar from '@/components/Navbar'
import PostDetailPage from '@/components/PostDetailPage'
import { Post } from '@/types/post'

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
      replies: {
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
          likes: {
            where: {
              userId: session.user.id as string,
            },
            select: {
              userId: true,
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
    author: postData.author,
    likeCount: postData._count.likes,
    repostCount: postData._count.reposts,
    commentCount: postData._count.replies,
    liked: (postData.likes as any)?.length > 0,
  }

  // Format replies
  const replies: Post[] = postData.replies.map((reply) => ({
    id: reply.id,
    content: reply.content,
    authorId: reply.authorId,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    author: reply.author,
    likeCount: reply._count.likes,
    repostCount: 0, // Replies don't have reposts in this structure
    commentCount: reply._count.replies,
    liked: (reply.likes as any)?.length > 0,
  }))

  return (
    <AppLayout>
      <Navbar type="profile" profileName="Post" />
      <PostDetailPage parentPost={parentPost} replies={replies} />
    </AppLayout>
  )
}

