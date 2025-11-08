import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { PostModalProvider } from '@/components/PostModalProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'my C',
  description: 'A simplified Twitter-like social web app',
  icons: {
    icon: '/assets/C.png',
  },
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

