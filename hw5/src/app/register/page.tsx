import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import RegisterForm from '@/components/RegisterForm'
import AuthButtons from '@/components/AuthButtons'
import Link from 'next/link'

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  // 如果已經設定 userId，導向首頁
  if (session?.user?.userId) {
    redirect('/home')
  }

  // 如果有 session 但沒有 userId，顯示註冊表單
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold">完成註冊</h1>
          <p className="text-sm text-gray-600 mb-4">
            請設定你的 userID、顯示名稱和自介以完成註冊
          </p>
          <RegisterForm 
            defaultName={session.user?.name ?? ''} 
            defaultImage={session.user?.image ?? ''}
          />
        </div>
      </div>
    )
  }

  // 如果沒有 session，顯示 OAuth 選項
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">my X</h1>
          <p className="text-gray-600">建立你的帳號</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-center">註冊</h2>
          <p className="text-sm text-gray-600 text-center">
            選擇一個登入方式來建立你的帳號
          </p>
          <AuthButtons />
          <div className="text-sm text-center text-gray-600">
            已經有帳號了？<Link className="text-blue-600 hover:underline" href="/login">前往登入</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
