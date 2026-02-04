import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { sql } from '@/lib/db'
import { DashboardHeader } from './dashboard-header'
import { BookingCalendar } from './booking-calendar'
import { MyBookings } from './my-bookings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, History, User } from 'lucide-react'

async function getServices() {
  return await sql`SELECT * FROM services WHERE is_active = true ORDER BY price ASC`
}

async function getWorkingHours() {
  return await sql`SELECT * FROM working_hours WHERE is_active = true ORDER BY day_of_week`
}

async function getVacations() {
  return await sql`SELECT * FROM vacations WHERE end_date >= CURRENT_DATE ORDER BY start_date`
}

async function getConfirmedBookings() {
  // Get all confirmed/completed bookings to block those time slots
  return await sql`
    SELECT booking_date, booking_time, duration_minutes 
    FROM bookings 
    WHERE status IN ('confirmed', 'completed') 
      AND booking_date >= CURRENT_DATE
  `
}

async function getUserBookings(userId: number) {
  return await sql`
    SELECT b.*, s.name as service_name, s.price, s.duration_minutes
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    WHERE b.user_id = ${userId}
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { tab?: string }
}) {
  const tabParam = searchParams?.tab
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const [services, workingHours, vacations, confirmedBookings, bookings] = await Promise.all([
    getServices(),
    getWorkingHours(),
    getVacations(),
    getConfirmedBookings(),
    getUserBookings(user.id)
  ])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold">Welcome, {user.full_name.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Manage your appointments and book new sessions</p>
        </div>

        <Tabs defaultValue={tabParam === 'bookings' ? 'bookings' : 'book'} className="space-y-8">
          <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-3">
            <TabsTrigger value="book" className="gap-2">
              <Calendar className="w-4 h-4" />
              Book
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <History className="w-4 h-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <BookingCalendar 
              services={services} 
              workingHours={workingHours}
              vacations={vacations}
              confirmedBookings={confirmedBookings}
              userId={user.id}
              userPhone={user.phone}
              userName={user.full_name}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <MyBookings bookings={bookings} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSection user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function ProfileSection({ user }: { user: { full_name: string; email: string; phone: string | null; created_at: string } }) {
  return (
    <div className="max-w-md">
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-serif text-2xl font-bold text-primary">
              {user.full_name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user.full_name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Phone</span>
            <p className="font-medium">{user.phone || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Member since</span>
            <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
