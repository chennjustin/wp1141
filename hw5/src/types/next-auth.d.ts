import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      userId?: string | null
      bio?: string | null
      avatarUrl?: string | null
      coverUrl?: string | null
      provider?: string | null
    }
  }

  interface User {
    id: string
    userId?: string | null
    bio?: string | null
    avatarUrl?: string | null
    coverUrl?: string | null
    provider?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string | null
    bio?: string | null
    avatarUrl?: string | null
    coverUrl?: string | null
    provider?: string | null
  }
}

