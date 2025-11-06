'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AppLayout from '@/components/AppLayout'
import Navbar from '@/components/Navbar'
import HomeFeed from '@/components/HomeFeed'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const refreshFeedRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handlePostCreated = () => {
    if (refreshFeedRef.current) {
      refreshFeedRef.current()
    }
  }

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
    <AppLayout onPostCreated={handlePostCreated}>
      <Navbar type="home" />
      <HomeFeed onRefreshRef={refreshFeedRef} />
    </AppLayout>
  )
}

