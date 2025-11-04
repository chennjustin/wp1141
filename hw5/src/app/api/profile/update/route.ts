import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const name = (formData.get('name') as string | null)?.trim()

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  })

  // 更新成功後重新導向到首頁（session 會自動刷新）
  return NextResponse.redirect(new URL('/home', req.url))
}

