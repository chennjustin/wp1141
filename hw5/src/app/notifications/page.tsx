'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AppLayout from '@/components/AppLayout'
import Navbar from '@/components/Navbar'
import NotificationsPage from '@/components/NotificationsPage'

export default function NotificationsPageRoute() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <AppLayout>
      <Navbar type="profile" profileName="Notifications" />
      <NotificationsPage />
    </AppLayout>
  )
}

