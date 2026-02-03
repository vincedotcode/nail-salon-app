import Link from 'next/link'
import { LogoIcon } from '@/components/logo'
import { AdminLoginForm } from './login-form'
import { Shield } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/20 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoIcon size={60} />
          </div>
          <h1 className="font-serif text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            DS Nails Management
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          <AdminLoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
