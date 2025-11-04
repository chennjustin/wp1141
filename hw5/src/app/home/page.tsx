import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import EditNameButton from '@/components/EditNameButton'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">歡迎回來！</h1>
            <LogoutButton />
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-sm font-medium text-gray-500 mb-1">用戶資訊</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">名稱</label>
                  <EditNameButton currentName={user.name || ''} />
                </div>
                <p className="mt-1 text-lg text-gray-900">{user.name || '未設定'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">電子郵件</label>
                <p className="mt-1 text-lg text-gray-900">{user.email || '未設定'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">用戶 ID</label>
                <p className="mt-1 text-lg font-mono text-blue-600">
                  {user.userId || '載入中...'}
                </p>
              </div>
              
              {user.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-700">自介</label>
                  <p className="mt-1 text-lg text-gray-900">{user.bio}</p>
                </div>
              )}
            </div>
            
            {user.image && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-700">頭像</label>
                <div className="mt-2">
                  <img
                    src={user.image}
                    alt={user.name || 'User avatar'}
                    className="w-24 h-24 rounded-full border-2 border-gray-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

