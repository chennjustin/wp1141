import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, notFoundResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const draft = await prisma.draft.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!draft) {
      return notFoundResponse('Draft not found')
    }

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Error retrieving draft:', error)
    return NextResponse.json({ error: 'Failed to retrieve draft' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const draft = await prisma.draft.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!draft) {
      return notFoundResponse('Draft not found')
    }

    await prisma.draft.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 })
  }
}
