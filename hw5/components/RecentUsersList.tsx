'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'

interface User {
  userId: string
  name: string | null
  image: string | null
}

export default function RecentUsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/recent-users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setUsers(data.users)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleUserClick = async (userId: string) => {
    try {
      const res = await fetch(`/api/auth/provider-by-userid?userId=${encodeURIComponent(userId)}`)
      const data = await res.json()
      if (res.ok && data.provider) {
        // 若為 Google，帶上 login_hint
        if (data.provider === 'google' && data.email) {
          await signIn('google', { callbackUrl: '/', login_hint: data.email })
        } else {
          await signIn(data.provider, { callbackUrl: '/' })
        }
      }
    } catch (err) {
      console.error('Error signing in:', err)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500 text-center">載入中...</div>
  }

  if (users.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 mb-3">最近登入的用戶</p>
      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user.userId}
            onClick={() => handleUserClick(user.userId)}
            className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
          >
            {user.image && (
              <img
                src={user.image}
                alt={user.name || user.userId}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || '未設定名稱'}
              </p>
              <p className="text-xs text-gray-500 font-mono truncate">
                @{user.userId}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

