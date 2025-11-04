'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'

// 合併 OAuth 登入按鈕和最近登入列表
export default function AuthButtons() {
  const [recentLogins, setRecentLogins] = useState<any[]>([])

  useEffect(() => {
    // 從 localStorage 取得最近登入帳號
    const getRecentLogins = () => {
      if (typeof window === 'undefined') return []
      try {
        return JSON.parse(localStorage.getItem('recentLogins') || '[]')
      } catch {
        return []
      }
    }

    // 初始載入
    setRecentLogins(getRecentLogins())

    // 監聽自定義事件（當 localStorage 在同頁面更新時）
    const handleRecentLoginsUpdate = () => {
      setRecentLogins(getRecentLogins())
    }

    // 監聽 localStorage 變化（當其他分頁更新時）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recentLogins') {
        setRecentLogins(getRecentLogins())
      }
    }

    window.addEventListener('recentLoginsUpdated', handleRecentLoginsUpdate)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('recentLoginsUpdated', handleRecentLoginsUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleOAuthLogin = (provider: string, email?: string) => {
    if (provider === 'google' && email) {
      signIn('google', { callbackUrl: '/', login_hint: email })
    } else {
      signIn(provider as 'google' | 'github' | 'facebook', { callbackUrl: '/' })
    }
  }

  const handleRecentLogin = async (login: any) => {
    // 先檢查是否有有效的 session（快速登入）
    try {
      const quickLoginRes = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: login.userId }),
      })
      const quickLoginData = await quickLoginRes.json()

      if (quickLoginData.success && quickLoginData.alreadyLoggedIn) {
        // 如果已經登入該用戶，直接跳轉到首頁
        window.location.href = '/home'
        return
      }
    } catch (err) {
      console.error('Quick login check failed:', err)
    }

    // 如果沒有有效的 session，需要重新 OAuth 登入
    handleOAuthLogin(login.provider, login.email)
  }


  return (
    <div className="space-y-4">
      {/* 最近登入帳號 */}
      {recentLogins.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">最近登入</p>
          {recentLogins.map((login: any) => (
            <button
              key={login.userId}
              onClick={() => handleRecentLogin(login)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              {login.image && (
                <img
                  src={login.image}
                  alt={login.name || login.userId}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {login.name || '未設定名稱'}
                </p>
                <p className="text-xs text-gray-500 font-mono truncate">
                  @{login.userId}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* OAuth 登入按鈕 */}
      {recentLogins.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">或</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => handleOAuthLogin('google')}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          使用 Google 登入
        </button>

        <button
          onClick={() => handleOAuthLogin('github')}
          className="w-full flex items-center justify-center gap-3 bg-gray-900 border border-gray-900 rounded-lg px-6 py-3 text-white font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          使用 GitHub 登入
        </button>

        <button
          onClick={() => handleOAuthLogin('facebook')}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 border border-blue-600 rounded-lg px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          使用 Facebook 登入
        </button>
      </div>
    </div>
  )
}

