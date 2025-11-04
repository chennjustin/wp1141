import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  
  // 檢查是否為靜默登入嘗試
  const silentLogin = searchParams.silent_login
  const silentUserId = searchParams.user_id
  const silentEmail = searchParams.email

  // 如果沒有 session，但有靜默登入參數，說明靜默登入失敗，需要 fallback
  if (!session && silentLogin === 'true' && silentUserId && silentEmail) {
    // 導向登入頁面，並帶上 fallback 參數
    const userId = Array.isArray(silentUserId) ? silentUserId[0] : silentUserId
    const email = Array.isArray(silentEmail) ? silentEmail[0] : silentEmail
    redirect(`/login?silent_failed=true&user_id=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`)
  }

  if (!session) {
    redirect('/login')
  }

  // 若尚未設定 userId，引導去 /register 完成註冊
  if (!session.user?.userId) {
    redirect('/register')
  }

  redirect('/home')
}
