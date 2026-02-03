import { sql } from '@/lib/db'
import { getAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const admin = await getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, serviceId, amount, notes, bookingId } = await req.json()

    if (!userId || !amount) {
      return NextResponse.json({ error: 'User and amount are required' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO invoices (user_id, booking_id, amount, notes, status)
      VALUES (${userId}, ${bookingId || null}, ${amount}, ${notes || null}, 'unpaid')
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
