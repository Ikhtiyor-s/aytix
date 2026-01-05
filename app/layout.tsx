import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingTelegramButton from '@/components/FloatingTelegramButton'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'A full-stack marketplace application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-14 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {children}
          </main>
          <Footer />
          <FloatingTelegramButton />
        </Providers>
      </body>
    </html>
  )
}



