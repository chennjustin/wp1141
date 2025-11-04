'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function UserIdLogin() {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [silentLoginAttempt, setSilentLoginAttempt] = useState<{ userId: string; email: string } | null>(null)
  const searchParams = useSearchParams()
  const { status } = useSession()

  // 檢查 URL 參數，判斷是否為靜默登入失敗後的 fallback
  useEffect(() => {
    const silentFailed = searchParams.get('silent_failed')
    const failedUserId = searchParams.get('user_id')
    const failedEmail = searchParams.get('email')

    if (silentFailed === 'true' && failedUserId && failedEmail && !silentLoginAttempt) {
      // 靜默登入失敗，觸發 fallback 到帳號選擇器
      setUserId(failedUserId)
      setSilentLoginAttempt({ userId: failedUserId, email: failedEmail })
      
      // 清除 URL 參數
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      // 延遲觸發 fallback 登入，確保狀態更新完成
      setTimeout(() => {
        // Fallback：使用 prompt: 'select_account' 顯示帳號選擇器
        signIn('google', {
          callbackUrl: '/',
          authorizationParams: {
            login_hint: failedEmail,
            prompt: 'select_account', // 顯示帳號選擇器，但會預選該 email
          },
        })
      }, 100)
    }
  }, [searchParams, silentLoginAttempt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      // 查詢資料庫取得 provider 和 email
      const res = await fetch(`/api/auth/provider-by-userid?userId=${encodeURIComponent(userId)}`)
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || '找不到對應的帳號')
        setLoading(false)
        return
      }

      // 根據 provider 執行不同的登入流程
      if (data.provider === 'google' && data.email) {
        // Google：先嘗試靜默登入（prompt: 'none'）
        // 使用特殊的 callbackUrl 來標記這是靜默登入嘗試
        const callbackUrl = `/?silent_login=true&user_id=${encodeURIComponent(userId)}&email=${encodeURIComponent(data.email)}`
        
        await signIn('google', {
          callbackUrl: callbackUrl,
          authorizationParams: {
            login_hint: data.email,
            prompt: 'none', // 嘗試靜默登入
          },
        })
        return
      }
      
      // GitHub 或 Facebook：直接執行 OAuth 登入
      await signIn(data.provider, { callbackUrl: '/' })
    } catch (err) {
      setError('發生錯誤，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">以 userID 登入</label>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="輸入 userID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
      >
        {loading ? '查詢中…' : '使用 userID 登入'}
      </button>
    </form>
  )
}


