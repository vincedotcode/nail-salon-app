import { sql } from '@/lib/db'
import { ClientsList } from './clients-list'

async function getClients() {
  return await sql`
    SELECT 
      u.*,
      COUNT(b.id) as total_bookings,
      COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
      COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount END), 0) as total_spent
    FROM users u
    LEFT JOIN bookings b ON b.user_id = u.id
    LEFT JOIN invoices i ON i.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">View and manage your customer database</p>
      </div>

      <ClientsList clients={clients} />
    </div>
  )
}
