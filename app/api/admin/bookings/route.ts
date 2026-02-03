import { sql } from '@/lib/db'
import { getAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = await getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const bookings = await sql`
      SELECT 
        b.id,
        b.booking_date,
        b.booking_time,
        b.status,
        b.notes,
        COALESCE(b.duration_minutes, s.duration_minutes, 60) as duration_minutes,
        b.final_price,
        u.id as user_id,
        u.full_name,
        u.email,
        u.phone,
        s.id as service_id,
        s.name as service_name,
        s.price as service_price,
        i.id as invoice_id
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN invoices i ON i.booking_id = b.id
      ORDER BY b.booking_date DESC, b.booking_time DESC
      LIMIT 200
    `

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
