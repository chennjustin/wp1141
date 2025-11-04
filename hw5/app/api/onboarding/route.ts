import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const userId = (formData.get('userId') as string | null)?.trim()
  const name = (formData.get('name') as string | null)?.trim()

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  // 檢查唯一性
  const exists = await prisma.user.findUnique({ where: { userId } })
  if (exists) {
    return NextResponse.json({ error: 'userId already taken' }, { status: 409 })
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { userId, name: name ?? undefined },
  })

  // 設定完成後導向首頁
  return NextResponse.redirect(new URL('/home', req.url))
}


