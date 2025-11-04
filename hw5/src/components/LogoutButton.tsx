'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  const handleLogout = () => {
    // 清除 localStorage 中的最近登入紀錄
    localStorage.removeItem('recentLogins')
    signOut({ callbackUrl: '/login' })
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
    >
      登出
    </button>
  )
}

