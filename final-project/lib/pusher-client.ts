/**
 * Pusher Client Configuration
 * 
 * This module provides the Pusher client instance for receiving real-time notifications.
 * Only used on the client side.
 */

"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

/**
 * Get or create Pusher client instance
 * This ensures the client is only created on the client side
 */
export function getPusherClient(): Pusher {
  if (typeof window === "undefined") {
    throw new Error("Pusher client can only be used on the client side");
  }

  if (!pusherClient) {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      throw new Error("NEXT_PUBLIC_PUSHER_KEY is not set");
    }

    if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      throw new Error("NEXT_PUBLIC_PUSHER_CLUSTER is not set");
    }

    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
    });
  }

  return pusherClient;
}

