'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ImageIcon, 
  MessageSquare, 
  Receipt, 
  Settings,
  Plane,
  LogOut,
  Clock,
  Send,
  TrendingUp,
  Bot
} from 'lucide-react'
import { adminLogoutAction } from './actions'
import { toast } from 'sonner'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/assistant', label: 'AI Partner', icon: Bot },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/availability', label: 'Schedule', icon: Clock },
  { href: '/admin/vacations', label: 'Days Off', icon: Plane },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
  { href: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/admin/broadcast', label: 'Broadcast', icon: Send },
  { href: '/admin/services', label: 'Services', icon: Settings },
]

interface Admin {
  name: string
  email: string
}

export function AdminSidebar({ admin }: { admin: Admin }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await adminLogoutAction()
    toast.success('Logged out')
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <LogoIcon size={40} />
          <div>
            <h2 className="font-serif font-bold">DS Nails</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-serif font-semibold text-primary">
              {admin.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{admin.name}</p>
            <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
          </div>
        </div>
        <form action={handleLogout}>
          <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent" type="submit">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  )
}
