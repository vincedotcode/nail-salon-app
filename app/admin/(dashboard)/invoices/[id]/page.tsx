import { sql } from '@/lib/db'
import { notFound } from 'next/navigation'
import { InvoiceDetail } from './invoice-detail'

async function getInvoice(id: number) {
  const invoice = await sql`
    SELECT i.*, u.full_name, u.email, u.phone, b.booking_date, b.booking_time, s.name as service_name
    FROM invoices i
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN bookings b ON i.booking_id = b.id
    LEFT JOIN services s ON b.service_id = s.id
    WHERE i.id = ${id}
  `
  return invoice[0]
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(parseInt(id))

  if (!invoice) {
    notFound()
  }

  return (
    <div className="p-8">
      <InvoiceDetail invoice={invoice} />
    </div>
  )
}
