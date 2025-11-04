'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

// 這個組件在 OAuth 登入成功後自動更新 localStorage
export default function SessionUpdater() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.userId) {
      // OAuth 登入成功後，更新 localStorage 中的最近登入帳號
      const recentLogin = {
        userId: session.user.userId,
        name: session.user.name,
        image: session.user.image,
        provider: session.user.provider,
        email: session.user.email,
      }

      try {
        const existing = JSON.parse(localStorage.getItem('recentLogins') || '[]')
        const filtered = existing.filter((u: any) => u.userId !== recentLogin.userId)
        localStorage.setItem('recentLogins', JSON.stringify([recentLogin, ...filtered].slice(0, 5)))
        
        // 觸發自定義事件，通知其他組件更新
        window.dispatchEvent(new Event('recentLoginsUpdated'))
      } catch (err) {
        console.error('Failed to update recent logins:', err)
      }
    }
  }, [session, status])

  return null // 這個組件不渲染任何內容
}

