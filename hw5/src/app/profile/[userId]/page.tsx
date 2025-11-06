import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getUserByUserId, getPostsByAuthorId, getCurrentMockUser } from '@/lib/mockData'
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

  // Get user by userId
  const user = getUserByUserId(params.userId)
  if (!user) {
    redirect('/home')
  }

  // Get user's posts
  const posts = getPostsByAuthorId(user.id)

  // Check if it's own profile
  const currentUser = getCurrentMockUser()
  const isOwnProfile = user.id === currentUser.id

  return (
    <AppLayout>
      <Navbar type="profile" profileName={user.name} />
      <ProfilePage user={user} posts={posts} isOwnProfile={isOwnProfile} />
    </AppLayout>
  )
}

