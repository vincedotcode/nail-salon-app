import { sql } from '@/lib/db'
import { getAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await sql`
      UPDATE invoices 
      SET status = 'paid', paid_at = NOW()
      WHERE id = ${parseInt(id)}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking invoice paid:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
