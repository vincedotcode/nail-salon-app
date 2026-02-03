import { sql } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users, Calendar, Receipt, ArrowUp, ArrowDown } from 'lucide-react'

async function getRevenueStats() {
  const [
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    totalClients,
    totalBookings,
    completedBookings,
    monthlyRevenue,
    topServices,
    recentInvoices
  ] = await Promise.all([
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'`,
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid' AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)`,
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid' AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')`,
    sql`SELECT COUNT(*) as count FROM users`,
    sql`SELECT COUNT(*) as count FROM bookings`,
    sql`SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'`,
    sql`
      SELECT 
        TO_CHAR(paid_at, 'Mon YYYY') as month,
        SUM(amount) as total
      FROM invoices 
      WHERE status = 'paid' AND paid_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(paid_at, 'Mon YYYY'), DATE_TRUNC('month', paid_at)
      ORDER BY DATE_TRUNC('month', paid_at) DESC
      LIMIT 6
    `,
    sql`
      SELECT s.name, COUNT(*) as bookings, SUM(COALESCE(i.amount, s.price)) as revenue
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      LEFT JOIN invoices i ON i.booking_id = b.id AND i.status = 'paid'
      WHERE b.status IN ('completed', 'confirmed')
      GROUP BY s.id, s.name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `,
    sql`
      SELECT i.*, u.full_name, s.name as service_name
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE i.status = 'paid'
      ORDER BY i.paid_at DESC
      LIMIT 5
    `
  ])

  const thisMonth = Number(thisMonthRevenue[0].total)
  const lastMonth = Number(lastMonthRevenue[0].total)
  const percentChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

  return {
    totalRevenue: Number(totalRevenue[0].total),
    thisMonthRevenue: thisMonth,
    lastMonthRevenue: lastMonth,
    percentChange,
    totalClients: Number(totalClients[0].count),
    totalBookings: Number(totalBookings[0].count),
    completedBookings: Number(completedBookings[0].count),
    monthlyRevenue,
    topServices,
    recentInvoices
  }
}

export default async function RevenuePage() {
  const stats = await getRevenueStats()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Revenue Dashboard</h1>
        <p className="text-muted-foreground">Track your business performance and earnings</p>
      </div>

      {/* Main Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold font-serif text-primary">
                  Rs {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold font-serif">
                  Rs {stats.thisMonthRevenue.toLocaleString()}
                </p>
                <div className={`flex items-center text-sm mt-1 ${stats.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.percentChange >= 0 ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(stats.percentChange).toFixed(1)}% vs last month
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold font-serif">{stats.totalClients}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Bookings</p>
                <p className="text-3xl font-bold font-serif">{stats.completedBookings}</p>
                <p className="text-sm text-muted-foreground">{stats.totalBookings} total</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Monthly Revenue</CardTitle>
            <CardDescription>Last 6 months breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.monthlyRevenue.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No revenue data yet</p>
            ) : (
              <div className="space-y-4">
                {stats.monthlyRevenue.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.month}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ 
                            width: `${Math.min(100, (Number(item.total) / Math.max(...stats.monthlyRevenue.map((m: any) => Number(m.total)))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-28 text-right">
                        Rs {Number(item.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Top Services</CardTitle>
            <CardDescription>Most popular services by bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topServices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No service data yet</p>
            ) : (
              <div className="space-y-4">
                {stats.topServices.map((service: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                  >
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {service.bookings} bookings
                      </p>
                    </div>
                    <span className="font-serif font-semibold text-primary">
                      Rs {Number(service.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Paid Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <Receipt className="w-5 h-5 text-primary" />
              Recent Payments
            </CardTitle>
            <CardDescription>Latest paid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentInvoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payments yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Client</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Service</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentInvoices.map((invoice: any) => (
                      <tr key={invoice.id} className="border-b last:border-0">
                        <td className="py-3 px-2 font-medium">
                          #{invoice.id.toString().padStart(5, '0')}
                        </td>
                        <td className="py-3 px-2">{invoice.full_name}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {invoice.service_name || '-'}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-2 text-right font-serif font-semibold text-primary">
                          Rs {Number(invoice.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
