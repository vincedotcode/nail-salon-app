import { sql } from '@/lib/db'
import { getAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const admin = await getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, amount, notes, bookingId, status, paidAt } = await req.json()

    let resolvedUserId = userId ? Number(userId) : null
    let resolvedAmount = amount !== undefined && amount !== null ? Number(amount) : null
    let resolvedBookingId = bookingId ? Number(bookingId) : null

    if (resolvedBookingId) {
      const existingInvoice = await sql`
        SELECT id FROM invoices WHERE booking_id = ${resolvedBookingId} LIMIT 1
      `
      if (existingInvoice.length > 0) {
        return NextResponse.json({ error: 'Invoice already exists for this booking' }, { status: 400 })
      }

      const booking = await sql`
        SELECT b.user_id, b.final_price, s.price as service_price
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.id = ${resolvedBookingId}
        LIMIT 1
      `

      if (booking.length === 0) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      if (!resolvedUserId) {
        resolvedUserId = Number(booking[0].user_id)
      }
      if (!resolvedAmount) {
        resolvedAmount = Number(booking[0].final_price || booking[0].service_price || 0)
      }
    }

    if (!resolvedUserId || !resolvedAmount || Number.isNaN(resolvedAmount)) {
      return NextResponse.json({ error: 'User and amount are required' }, { status: 400 })
    }

    const normalizedStatus = status === 'paid' ? 'paid' : 'unpaid'
    const paidAtValue = normalizedStatus === 'paid'
      ? (paidAt || new Date().toISOString())
      : null

    const result = await sql`
      INSERT INTO invoices (user_id, booking_id, amount, notes, status, paid_at)
      VALUES (${resolvedUserId}, ${resolvedBookingId || null}, ${resolvedAmount}, ${notes || null}, ${normalizedStatus}, ${paidAtValue})
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
