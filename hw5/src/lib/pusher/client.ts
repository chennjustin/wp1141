'use client'

import Pusher from 'pusher-js'

// Singleton instance
let pusherClientInstance: Pusher | null = null

export const pusherClient = (): Pusher => {
  if (typeof window === 'undefined') {
    // Server-side rendering: return a mock object
    return {} as Pusher
  }

  if (pusherClientInstance) {
    return pusherClientInstance
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

  if (!key || !cluster) {
    throw new Error('Missing Pusher environment variables')
  }

  pusherClientInstance = new Pusher(key, {
    cluster,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
  })

  return pusherClientInstance
}

