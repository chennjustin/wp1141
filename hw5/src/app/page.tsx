import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // 若尚未設定 userId，引導去 /register 完成註冊
  if (!session.user?.userId) {
    redirect('/register')
  }

  redirect('/home')
}

