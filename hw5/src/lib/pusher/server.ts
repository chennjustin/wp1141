import Pusher from 'pusher'

// Singleton instance
let pusherServerInstance: Pusher | null = null

export const pusherServer = (): Pusher => {
  if (pusherServerInstance) {
    return pusherServerInstance
  }

  const appId = process.env.NEXT_PUBLIC_PUSHER_APP_ID
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

  if (!appId || !key || !secret || !cluster) {
    throw new Error('Missing Pusher environment variables')
  }

  pusherServerInstance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  })

  return pusherServerInstance
}

