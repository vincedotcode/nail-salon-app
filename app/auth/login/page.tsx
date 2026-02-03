import Link from 'next/link'
import { Logo } from '@/components/logo'
import { LoginForm } from './login-form'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-8" />
          
          <div className="mb-8">
            <h1 className="font-serif text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to manage your appointments
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>

          <div className="mt-6 text-center">
            <Link href="/admin/login" className="text-xs text-muted-foreground hover:text-foreground">
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-8">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold mb-4">
            Beautiful Nails Await
          </h2>
          <p className="text-muted-foreground">
            Sign in to book your next appointment and view your booking history. 
            Experience premium nail care at DS Nails.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20" />
            <div className="w-16 h-16 rounded-xl bg-accent/30" />
            <div className="w-12 h-12 rounded-xl bg-primary/10" />
          </div>
        </div>
      </div>
    </div>
  )
}
