'use client'

import { useState } from 'react'

export default function EditNameButton({ currentName }: { currentName: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('name', name)

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        // 頁面會自動重新導向，session 會更新
        window.location.reload()
      } else {
        alert('更新失敗，請稍後再試')
        setLoading(false)
      }
    } catch (err) {
      alert('發生錯誤，請稍後再試')
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          required
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? '儲存中...' : '儲存'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false)
            setName(currentName)
          }}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          取消
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-sm text-blue-600 hover:text-blue-800"
    >
      編輯
    </button>
  )
}

