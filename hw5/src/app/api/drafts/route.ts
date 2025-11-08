import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorizedResponse, badRequestResponse, notFoundResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const drafts = await prisma.draft.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(drafts)
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return unauthorizedResponse()
    }

    const { id, content, mediaUrl, mediaType } = await req.json()

    const isEmpty = (!content || content.trim().length === 0) && !mediaUrl
    if (isEmpty) {
      return badRequestResponse('Draft cannot be empty')
    }

    const draftData = {
      content: content?.trim() ?? null,
      mediaUrl: mediaUrl ?? null,
      mediaType: mediaType ?? null,
    }

    let draft
    if (id) {
      const existing = await prisma.draft.findFirst({
        where: {
          id,
          userId: user.id,
        },
      })

      if (!existing) {
        return notFoundResponse('Draft not found')
      }

      draft = await prisma.draft.update({
        where: { id },
        data: draftData,
      })
    } else {
      draft = await prisma.draft.create({
        data: {
          ...draftData,
          userId: user.id,
        },
      })
    }

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Error saving draft:', error)
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
  }
}
