// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import ConditionalNavBar from '@/components/navigation/ConditionalNavBar'
import CustomCursor from '@/components/ui/CustomCursor'

const inter = Inter({ subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

export const metadata: Metadata = {
  title: 'Platform Maturity Dashboard',
  description: 'Organization-wide capability maturity tracking and investment planning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${spaceGrotesk.variable} cursor-none`}>
        <CustomCursor />
        <ConditionalNavBar />
        {children}
      </body>
    </html>
  )
}
