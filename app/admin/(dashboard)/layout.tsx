import React from "react"
import { redirect } from 'next/navigation'
import { getAdmin } from '@/lib/auth'
import { AdminMobileNav, AdminSidebar } from './admin-sidebar'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdmin()
  
  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <AdminSidebar admin={admin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav admin={admin} />
        <main className="flex-1 min-w-0 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
