'use client'

import { useEffect, useRef } from 'react'
import { pusherClient } from '@/lib/pusher/client'
import type Pusher from 'pusher-js'
import type { Channel } from 'pusher-js'

type EventHandler = (data: any) => void

interface PusherSubscription {
  channel: Channel
  handlers: Map<string, EventHandler[]>
}

class PusherManager {
  private static instance: PusherManager | null = null
  private pusher: Pusher | null = null
  private subscriptions: Map<string, PusherSubscription> = new Map()

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.pusher = pusherClient()
      } catch (error) {
        console.error('Failed to initialize Pusher:', error)
      }
    }
  }

  static getInstance(): PusherManager {
    if (!PusherManager.instance) {
      PusherManager.instance = new PusherManager()
    }
    return PusherManager.instance
  }

  subscribe(channelName: string, event: string, handler: EventHandler): () => void {
    if (!this.pusher) {
      return () => {}
    }

    let subscription = this.subscriptions.get(channelName)
    
    if (!subscription) {
      const channel = this.pusher.subscribe(channelName)
      subscription = {
        channel,
        handlers: new Map(),
      }
      this.subscriptions.set(channelName, subscription)
    }

    if (!subscription.handlers.has(event)) {
      subscription.handlers.set(event, [])
      // Bind event to channel
      subscription.channel.bind(event, (data: any) => {
        const handlers = subscription!.handlers.get(event) || []
        handlers.forEach((h) => h(data))
      })
    }

    const handlers = subscription.handlers.get(event)!
    handlers.push(handler)

    // Return unsubscribe function
    return () => {
      const handlers = subscription!.handlers.get(event)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
        
        // If no more handlers, unbind event
        if (handlers.length === 0) {
          subscription!.channel.unbind(event)
          subscription!.handlers.delete(event)
        }
      }

      // If no more events, unsubscribe from channel
      if (subscription!.handlers.size === 0) {
        this.pusher!.unsubscribe(channelName)
        this.subscriptions.delete(channelName)
      }
    }
  }

  unsubscribe(channelName: string) {
    if (this.subscriptions.has(channelName)) {
      this.pusher?.unsubscribe(channelName)
      this.subscriptions.delete(channelName)
    }
  }
}

/**
 * Hook to subscribe to Pusher events
 * Automatically handles cleanup on unmount
 */
export function usePusherSubscription(
  channelName: string | null,
  event: string,
  handler: EventHandler | null
) {
  const managerRef = useRef(PusherManager.getInstance())
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!channelName || !event || !handler) {
      return
    }

    const wrappedHandler = (data: any) => {
      if (handlerRef.current) {
        handlerRef.current(data)
      }
    }

    const unsubscribe = managerRef.current.subscribe(channelName, event, wrappedHandler)

    return unsubscribe
  }, [channelName, event])
}

