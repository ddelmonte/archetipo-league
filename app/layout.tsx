import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Archetipo League',
  description: 'Il sito ufficiale della Archetipo League – Fantasy NFL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-slate-500 text-sm py-8 mt-12">
          © Archetipo League · Tutti i diritti riservati
        </footer>
      </body>
    </html>
  )
}
