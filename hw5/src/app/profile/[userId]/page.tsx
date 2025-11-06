import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AppLayout from '@/components/AppLayout'
import Navbar from '@/components/Navbar'
import ProfilePage from '@/components/ProfilePage'

interface ProfilePageProps {
  params: {
    userId: string
  }
}

export default async function ProfilePageRoute({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  // Get user by userId from database
  const user = await prisma.user.findUnique({
    where: { userId: params.userId },
    select: {
      id: true,
      userId: true,
      name: true,
      image: true,
      bio: true,
      email: true,
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
    redirect('/home')
  }

  // Get user's posts and reposts from database
  const postsData = await prisma.post.findMany({
    where: {
      parentId: null, // 只返回原始貼文，不包含回覆
      OR: [
        { authorId: user.id }, // 使用者自己的貼文
        { reposts: { some: { userId: user.id } } }, // 使用者轉發的貼文
      ],
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
      reposts: {
        where: {
          userId: user.id,
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

  // Format posts to match Post type
  const posts = postsData.map((post) => ({
    id: post.id,
    content: post.content,
    authorId: post.authorId,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author,
    likeCount: post._count.likes,
    repostCount: post._count.reposts,
    commentCount: post._count.replies,
    repostedByMe: post.reposts.length > 0, // 標記是否為轉發的貼文
  }))

  // Format user to match User type
  const formattedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
  }

  // Determine self / following
  const isSelf = user.userId === session.user.userId
  let isFollowing = false
  if (!isSelf) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
        followerId: session.user.id as string,
          followingId: user.id,
        },
      },
      select: { followerId: true },
    })
    isFollowing = !!follow
  }

  return (
    <AppLayout>
      <Navbar type="profile" profileName={user.name || undefined} />
      <ProfilePage user={formattedUser} posts={posts} isSelf={isSelf} isFollowing={isFollowing} />
    </AppLayout>
  )
}

