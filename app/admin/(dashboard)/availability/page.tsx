import { redirect } from 'next/navigation'
import { getAdmin } from '@/lib/auth'
import { sql } from '@/lib/db'
import { BlockedDaysManager } from './blocked-days-manager'

async function getWorkingHours() {
  return await sql`SELECT * FROM working_hours ORDER BY day_of_week`
}

async function getVacations() {
  return await sql`SELECT * FROM vacations WHERE end_date >= CURRENT_DATE ORDER BY start_date`
}

export default async function AvailabilityPage() {
  const admin = await getAdmin()
  if (!admin) redirect('/admin/login')

  const [workingHours, vacations] = await Promise.all([
    getWorkingHours(),
    getVacations()
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Schedule & Days Off</h1>
        <p className="text-muted-foreground mt-1">Manage your working hours and days off</p>
      </div>

      <BlockedDaysManager workingHours={workingHours} vacations={vacations} />
    </div>
  )
}
