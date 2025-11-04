import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginButton from '@/components/LoginButton'
import Link from 'next/link'
import UserIdLogin from '@/components/UserIdLogin'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">X-Clone</h1>
          <p className="text-gray-600">歡迎來到 X-Clone</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-center">登入</h2>
          {/* 以 userId 登入 */}
          <UserIdLogin />

          <div className="flex items-center gap-2">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500">或</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* 直接選擇 Provider 登入 */}
          <LoginButton />
          <div className="text-sm text-center text-gray-600">
            還沒有帳號？登入後若尚未設定 userID，系統會帶你到 <Link className="underline" href="/onboarding">註冊頁</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

