import { sql } from '@/lib/db'
import { BroadcastManager } from './broadcast-manager'

async function getClients() {
  return await sql`
    SELECT id, full_name, email, phone 
    FROM users 
    WHERE phone IS NOT NULL AND phone != ''
    ORDER BY full_name
  `
}

async function getBroadcastHistory() {
  return await sql`
    SELECT * FROM broadcast_messages ORDER BY created_at DESC LIMIT 10
  `
}

export default async function BroadcastPage() {
  const [clients, history] = await Promise.all([
    getClients(),
    getBroadcastHistory()
  ])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Broadcast</h1>
        <p className="text-muted-foreground">Send messages to all clients via WhatsApp</p>
      </div>

      <BroadcastManager clients={clients} history={history} />
    </div>
  )
}
