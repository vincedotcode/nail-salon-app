'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowLeft, Calendar, Image as ImageIcon, Sparkles, User, Home, History, LayoutDashboard, Users, Receipt } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  match?: (pathname: string, tab?: string | null) => boolean
}

const publicItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
  { href: '/#services', label: 'Services', icon: Sparkles },
  { href: '/#gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/auth/signup', label: 'Book', icon: Calendar, match: (p) => p.startsWith('/auth') },
]

const dashboardItems: NavItem[] = [
  { href: '/dashboard', label: 'Book', icon: Calendar, match: (p, tab) => p === '/dashboard' && (!tab || tab === 'book') },
  { href: '/dashboard?tab=bookings', label: 'Bookings', icon: History, match: (p, tab) => p === '/dashboard' && tab === 'bookings' },
  { href: '/dashboard/try-on', label: 'Try-On', icon: Sparkles, match: (p) => p.startsWith('/dashboard/try-on') },
  { href: '/dashboard/profile', label: 'Profile', icon: User, match: (p) => p.startsWith('/dashboard/profile') },
]

const adminItems: NavItem[] = [
  { href: '/admin', label: 'Admin', icon: LayoutDashboard, match: (p) => p === '/admin' },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar, match: (p) => p.startsWith('/admin/bookings') },
  { href: '/admin/clients', label: 'Clients', icon: Users, match: (p) => p.startsWith('/admin/clients') },
  { href: '/admin/invoices', label: 'Invoices', icon: Receipt, match: (p) => p.startsWith('/admin/invoices') },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [hash, setHash] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setHash(window.location.hash)
    function handleHash() {
      setHash(window.location.hash)
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setHash(window.location.hash)
  }, [pathname])

  const tab = searchParams?.get('tab')

  const hideNav =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/logout')

  const items = useMemo(() => {
    if (pathname.startsWith('/admin')) return adminItems
    if (pathname.startsWith('/dashboard')) return dashboardItems
    return publicItems
  }, [pathname])

  function handleBack() {
    if (typeof window === 'undefined') return
    if (window.history.length > 1) {
      router.back()
    } else if (pathname.startsWith('/admin')) {
      router.push('/admin')
    } else if (pathname.startsWith('/dashboard')) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  if (hideNav) return null

  return (
    <>
      <div className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />
      <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
        <div className="mx-auto max-w-6xl px-4 pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5 gap-2 rounded-2xl border border-border/70 bg-background/95 shadow-lg backdrop-blur-xl px-2 py-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {items.map((item) => {
              const isActive = item.match ? item.match(pathname, tab) : pathname === item.href
              const anchor = item.href.includes('#') ? item.href.split('#')[1] : null
              const anchorActive = anchor ? pathname === '/' && hash === `#${anchor}` : false
              const active = isActive || anchorActive
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
