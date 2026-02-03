import React from "react"
import { redirect } from 'next/navigation'
import { getAdmin } from '@/lib/auth'
import { AdminSidebar } from './admin-sidebar'

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
    <div className="min-h-screen flex">
      <AdminSidebar admin={admin} />
      <main className="flex-1 bg-background overflow-auto">
        {children}
      </main>
    </div>
  )
}
