'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RegisterFormProps {
  defaultName?: string
  defaultImage?: string
}

export default function RegisterForm({ defaultName = '', defaultImage = '' }: RegisterFormProps) {
  const [userId, setUserId] = useState('')
  const [name, setName] = useState(defaultName)
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, bio }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '註冊失敗')
        setLoading(false)
        return
      }

      // 強制重新載入頁面以更新 session
      // 這樣可以確保 JWT 重新查詢資料庫並獲取最新的 userId
      window.location.href = '/home'
    } catch (err) {
      setError('發生錯誤，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          userID（唯一）*
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          pattern="[a-zA-Z0-9_\.\-]{3,30}"
          className="w-full border rounded px-3 py-2"
          placeholder="例如: ric2k1"
        />
        <p className="mt-1 text-xs text-gray-500">3-30 字，可含英數、底線、點與連字號</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          顯示名稱（可重複）
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="你的顯示名稱"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          自介（選填）
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2"
          placeholder="簡單介紹一下自己..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? '註冊中...' : '完成註冊'}
      </button>
    </form>
  )
}

