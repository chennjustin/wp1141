// Mock data for development
// TODO: Replace with real API calls

export interface MockUser {
  id: string
  userId: string
  name: string
  image: string | null
  bio: string | null
  followersCount: number
  followingCount: number
}

export interface MockPost {
  id: string
  content: string
  authorId: string
  createdAt: Date
  likeCount: number
  repostCount: number
  commentCount: number
}

export const mockUsers: MockUser[] = [
  {
    id: 'user1',
    userId: 'alice',
    name: 'Alice Chen',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    bio: 'Software engineer | Coffee enthusiast ☕',
    followersCount: 1234,
    followingCount: 567,
  },
  {
    id: 'user2',
    userId: 'bob',
    name: 'Bob Wang',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    bio: 'Designer & Developer | Building cool stuff 🚀',
    followersCount: 890,
    followingCount: 234,
  },
  {
    id: 'user3',
    userId: 'charlie',
    name: 'Charlie Lin',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    bio: 'Tech blogger | Sharing knowledge 📝',
    followersCount: 5678,
    followingCount: 1234,
  },
]

export const mockPosts: MockPost[] = [
  {
    id: 'post1',
    content: 'Just launched my new project! Check it out 🚀 #coding #webdev',
    authorId: 'user1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likeCount: 42,
    repostCount: 5,
    commentCount: 12,
  },
  {
    id: 'post2',
    content: 'Beautiful sunset today! 🌅 Sometimes you need to step away from the screen and enjoy nature.',
    authorId: 'user2',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likeCount: 128,
    repostCount: 23,
    commentCount: 8,
  },
  {
    id: 'post3',
    content: 'New blog post: "Understanding React Hooks" - A deep dive into useState and useEffect. Link in bio! 📚',
    authorId: 'user3',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    likeCount: 256,
    repostCount: 45,
    commentCount: 34,
  },
  {
    id: 'post4',
    content: 'Working on a new feature. Can\'t wait to share it with everyone! 💪',
    authorId: 'user1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    likeCount: 89,
    repostCount: 12,
    commentCount: 6,
  },
  {
    id: 'post5',
    content: 'Coffee + Code = Perfect morning ☕💻',
    authorId: 'user2',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    likeCount: 201,
    repostCount: 18,
    commentCount: 15,
  },
]

// Helper functions
export function getUserById(id: string): MockUser | undefined {
  return mockUsers.find((user) => user.id === id)
}

export function getUserByUserId(userId: string): MockUser | undefined {
  return mockUsers.find((user) => user.userId === userId)
}

export function getPostsByAuthorId(authorId: string): MockPost[] {
  return mockPosts.filter((post) => post.authorId === authorId)
}

export function getAllPosts(): MockPost[] {
  return mockPosts
}

// Get current user (mock)
export function getCurrentMockUser(): MockUser {
  return mockUsers[0] // Return first user as current user
}

