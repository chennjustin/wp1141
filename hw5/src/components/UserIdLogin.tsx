'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function UserIdLogin() {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/auth/provider-by-userid?userId=${encodeURIComponent(userId)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '找不到對應的帳號')
        setLoading(false)
        return
      }
      // 若為 Google，帶上 login_hint 以自動選擇對應 email，避免帳號選擇器
      if (data.provider === 'google' && data.email) {
        await signIn('google', {
          callbackUrl: '/',
          authorizationParams: {
            login_hint: data.email, // 使用 login_hint 預填 email，跳過帳號選擇器
          },
        })
        return
      }
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


