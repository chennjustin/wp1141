'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
    >
      登出
    </button>
  )
}

