import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AppLayout from '@/components/AppLayout'
import ProfileConnectionsPage from '@/components/ProfileConnectionsPage'

interface ConnectionsPageProps {
  params: {
    userId: string
  }
  searchParams?: {
    tab?: string
  }
}

export default async function ProfileConnectionsRoute({ params, searchParams }: ConnectionsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { userId: params.userId },
    select: {
      id: true,
      userId: true,
      name: true,
      bio: true,
      image: true,
      avatarUrl: true,
    },
  })

  if (!user) {
    redirect('/home')
  }

  const [followersRecords, followingRecords] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            id: true,
            userId: true,
            name: true,
            bio: true,
            image: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.follow.findMany({
      where: { followerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            id: true,
            userId: true,
            name: true,
            bio: true,
            image: true,
            avatarUrl: true,
          },
        },
      },
    }),
  ])

  const followerUsers = followersRecords
    .map((record) => record.follower)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  const followingUsers = followingRecords
    .map((record) => record.following)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  const viewerId = session.user.id as string
  const candidateIds = Array.from(
    new Set([
      ...followerUsers.map((entry) => entry.id),
      ...followingUsers.map((entry) => entry.id),
    ]).values()
  )

  let viewerFollowingSet = new Set<string>()
  if (candidateIds.length > 0) {
    const viewerFollowingRecords = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followingId: { in: candidateIds },
      },
      select: {
        followingId: true,
      },
    })
    viewerFollowingSet = new Set(viewerFollowingRecords.map((entry) => entry.followingId))
  }

  const mapUser = (entry: typeof followerUsers[number]) => ({
    id: entry.id,
    userId: entry.userId,
    name: entry.name,
    bio: entry.bio,
    avatarUrl: entry.avatarUrl || entry.image,
    isSelf: entry.id === viewerId,
    isFollowing: viewerFollowingSet.has(entry.id),
  })

  const followers = followerUsers.map(mapUser)
  const following = followingUsers.map(mapUser)

  const initialTab = searchParams?.tab === 'following' ? 'following' : 'followers'

  return (
    <AppLayout>
      <ProfileConnectionsPage
        targetUser={{
          id: user.id,
          userId: user.userId,
          name: user.name,
          avatarUrl: user.avatarUrl || user.image,
          bio: user.bio,
        }}
        followers={followers}
        following={following}
        initialTab={initialTab}
      />
    </AppLayout>
  )
}


