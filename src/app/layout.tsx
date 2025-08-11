// src/app/layout.tsx - Updated with AuthProvider for session management
import { Analytics } from "@vercel/analytics/next"
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nudgr - Get Paid Without the Awkward Chase',
  description: 'We handle the awkward nudges so you can focus on your work.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}