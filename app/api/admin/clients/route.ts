import { sql } from '@/lib/db'
import { getAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = await getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const clients = await sql`
      SELECT id, full_name, email, phone 
      FROM users 
      ORDER BY full_name
    `
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}
