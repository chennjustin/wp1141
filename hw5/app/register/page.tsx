import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginButton from '@/components/LoginButton'
import Link from 'next/link'

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">X-Clone</h1>
          <p className="text-gray-600">建立你的帳號</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-center">註冊</h2>
          <p className="text-sm text-gray-600 text-center">
            選擇一個登入方式來建立你的帳號
          </p>
          
          {/* OAuth Provider 選單 */}
          <LoginButton />
          
          <div className="text-sm text-center text-gray-600">
            已經有帳號了？<Link className="text-blue-600 hover:underline" href="/login">前往登入</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

