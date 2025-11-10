'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    signOut({ callbackUrl: '/login' })
  }

  return (
    <button
      onClick={handleLogout}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-full px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
    >
      登出
    </button>
  )
}

