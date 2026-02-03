import { sql } from '@/lib/db'
import { VacationsManager } from './vacations-manager'

async function getVacations() {
  return await sql`
    SELECT * FROM vacations 
    WHERE end_date >= CURRENT_DATE 
    ORDER BY start_date
  `
}

export default async function VacationsPage() {
  const vacations = await getVacations()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Vacations</h1>
        <p className="text-muted-foreground">Block dates when you&apos;re not available for bookings</p>
      </div>

      <VacationsManager vacations={vacations} />
    </div>
  )
}
