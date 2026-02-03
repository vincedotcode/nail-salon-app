import Link from 'next/link'
import { Logo } from '@/components/logo'
import { SignupForm } from './signup-form'
import { Calendar, Clock, Sparkles } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-8">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold mb-4 text-center">
            Join DS Nails
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Create your account to book appointments, view available slots, 
            and manage your nail care journey.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Easy Booking</h4>
                <p className="text-sm text-muted-foreground">View available slots and book instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Manage Appointments</h4>
                <p className="text-sm text-muted-foreground">Track your booking history</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Exclusive Updates</h4>
                <p className="text-sm text-muted-foreground">Get notified about promotions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-8" />
          
          <div className="mb-8">
            <h1 className="font-serif text-2xl font-bold">Create Account</h1>
            <p className="text-muted-foreground mt-2">
              Sign up to start booking your appointments
            </p>
          </div>

          <SignupForm />

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
