import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return null
  }
  return session.user
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

