import { sql } from '@/lib/db'
import { ServicesManager } from './services-manager'

async function getServices() {
  return await sql`SELECT * FROM services ORDER BY price ASC`
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">Manage your nail service offerings</p>
      </div>

      <ServicesManager services={services} />
    </div>
  )
}
