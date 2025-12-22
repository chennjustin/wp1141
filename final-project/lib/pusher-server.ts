/**
 * Pusher Server Configuration
 * 
 * This module provides the Pusher server instance for sending real-time notifications.
 */

import Pusher from "pusher";

let pusherServerInstance: Pusher | null = null;

/**
 * Get or create Pusher server instance
 * This ensures the instance is only created when needed and handles missing env vars gracefully
 */
export function getPusherServer(): Pusher | null {
  // Return null if Pusher is not configured (for development/testing)
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
    return null;
  }

  if (!pusherServerInstance) {
    pusherServerInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
  }

  return pusherServerInstance;
}

// Export a singleton instance for backward compatibility
// But it will be null if env vars are not set
export const pusherServer = getPusherServer();

