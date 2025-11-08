import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import AuthButtons from '@/components/AuthButtons'
import UserIdLogin from '@/components/UserIdLogin'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  // 如果已經登入，導向首頁
  if (session) {
    redirect('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">my X</h1>
          <p className="text-gray-600">歡迎回到 my X</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-center">登入</h2>
          
          {/* OAuth 登入按鈕和最近登入 */}
          <AuthButtons />

          {/* 以 userId 登入 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-500">或</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <UserIdLogin />
          </div>

          <div className="text-sm text-center text-gray-600 pt-4 border-t">
            還沒有帳號？<Link className="text-blue-600 hover:underline" href="/register">前往註冊</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
