import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AppLayout from '@/components/AppLayout'
import Navbar from '@/components/Navbar'
import HomeFeed from '@/components/HomeFeed'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  return (
    <AppLayout>
      <Navbar type="home" />
      <HomeFeed />
    </AppLayout>
  )
}

