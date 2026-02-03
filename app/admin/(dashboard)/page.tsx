import { sql } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Receipt, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const [
    totalClients,
    pendingBookings,
    confirmedBookings,
    completedThisMonth,
    revenueThisMonth,
    todayBookings
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM users`,
    sql`SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'`,
    sql`SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'`,
    sql`SELECT COUNT(*) as count FROM bookings WHERE status = 'completed' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`,
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid' AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)`,
    sql`SELECT b.*, u.full_name, u.phone, s.name as service_name FROM bookings b LEFT JOIN users u ON b.user_id = u.id LEFT JOIN services s ON b.service_id = s.id WHERE b.booking_date = CURRENT_DATE AND b.status != 'cancelled' ORDER BY b.booking_time`
  ])

  return {
    totalClients: totalClients[0].count,
    pendingBookings: pendingBookings[0].count,
    confirmedBookings: confirmedBookings[0].count,
    completedThisMonth: completedThisMonth[0].count,
    revenueThisMonth: revenueThisMonth[0].total,
    todayBookings
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Diya! Here&apos;s your salon overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{stats.totalClients}</div>
            <Link href="/admin/clients" className="text-xs text-primary hover:underline">View all clients</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bookings</CardTitle>
            <Clock className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{stats.pendingBookings}</div>
            <Link href="/admin/bookings" className="text-xs text-primary hover:underline">Review bookings</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{stats.confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Upcoming appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Revenue</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">Rs {Number(stats.revenueThisMonth).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.completedThisMonth} completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Calendar className="w-5 h-5 text-primary" />
            Today&apos;s Schedule
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.todayBookings.length > 0 ? (
            <div className="space-y-4">
              {stats.todayBookings.map((booking: { id: number; booking_time: string; full_name: string; phone: string; service_name: string; status: string }) => (
                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-primary/10 px-3 py-2 rounded-lg">
                      <span className="text-lg font-bold font-serif text-primary">
                        {booking.booking_time.slice(0, 5)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{booking.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                      {booking.phone && <p className="text-xs text-muted-foreground">{booking.phone}</p>}
                    </div>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No appointments scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
