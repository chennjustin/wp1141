import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }
  if (session.user?.userId) {
    redirect('/home')
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold">註冊 - 設定你的帳戶</h1>
        <p className="text-sm text-gray-600 mb-4">
          請設定你的 userID 和顯示名稱以完成註冊
        </p>
        <form action="/api/onboarding" method="post" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">userID（唯一）</label>
            <input
              type="text"
              name="userId"
              required
              pattern="[a-zA-Z0-9_\.\-]{3,30}"
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="例如: ric2k1"
            />
            <p className="mt-1 text-xs text-gray-500">3-30 字，可含英數、底線、點與連字號</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">名稱（可重複）</label>
            <input
              type="text"
              name="name"
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="你的顯示名稱"
              defaultValue={session.user?.name ?? ''}
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">完成設定</button>
        </form>
      </div>
    </div>
  )
}


