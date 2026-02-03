import { sql } from '@/lib/db'
import { InvoicesManager } from './invoices-manager'

async function getInvoices() {
  return await sql`
    SELECT i.*, u.full_name, u.email, u.phone, b.booking_date, b.booking_time, s.name as service_name
    FROM invoices i
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN bookings b ON i.booking_id = b.id
    LEFT JOIN services s ON b.service_id = s.id
    ORDER BY i.created_at DESC
  `
}

async function getCompletedBookingsWithoutInvoice() {
  return await sql`
    SELECT b.*, u.full_name, u.id as user_id, s.name as service_name, s.price
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN services s ON b.service_id = s.id
    WHERE b.status = 'completed'
      AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.booking_id = b.id)
    ORDER BY b.booking_date DESC
  `
}

async function getInvoiceStats() {
  const [total, paid, unpaid, thisMonth] = await Promise.all([
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM invoices`,
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'`,
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'unpaid'`,
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid' AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)`,
  ])

  return {
    total: total[0].total,
    paid: paid[0].total,
    unpaid: unpaid[0].total,
    thisMonth: thisMonth[0].total,
  }
}

export default async function InvoicesPage() {
  const [invoices, pendingBookings, stats] = await Promise.all([
    getInvoices(),
    getCompletedBookingsWithoutInvoice(),
    getInvoiceStats(),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">Track sales and manage payments</p>
      </div>

      <InvoicesManager invoices={invoices} pendingBookings={pendingBookings} stats={stats} />
    </div>
  )
}
