import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')?.trim()
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      id: true,
      email: true,
      accounts: { select: { provider: true }, take: 1 },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 })
  }

  const provider = user.accounts[0]?.provider
  if (!provider) {
    return NextResponse.json({ error: 'provider not linked' }, { status: 404 })
  }

  return NextResponse.json({ provider, email: user.email })
}


