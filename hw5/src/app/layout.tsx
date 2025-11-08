import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { PostModalProvider } from '@/components/PostModalProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'my X',
  description: 'A simplified social app inspired by X',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <Providers>
          <PostModalProvider>{children}</PostModalProvider>
        </Providers>
      </body>
    </html>
  )
}

