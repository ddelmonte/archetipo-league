'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, Swords, BarChart3, Star, Home } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { href: '/',            label: 'Home',        icon: Home },
  { href: '/albo-doro',  label: 'Albo d\'oro', icon: Trophy },
  { href: '/trofei',     label: 'Trofei',       icon: Star },
  { href: '/rivalita',   label: 'Rivalità',     icon: Swords },
  { href: '/classifiche',label: 'Classifiche',  icon: BarChart3 },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🏈</span>
          <span className="font-bold text-amber-400 text-lg tracking-wide hidden sm:block">
            Archetipo League
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                path === href
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
