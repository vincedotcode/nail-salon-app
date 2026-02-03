import { sql } from '@/lib/db'
import { BookingsList } from './bookings-list'

async function getBookings() {
  return await sql`
    SELECT b.*, u.full_name, u.email, u.phone, s.name as service_name, s.price
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN services s ON b.service_id = s.id
    ORDER BY 
      CASE WHEN b.status = 'pending' THEN 0 
           WHEN b.status = 'confirmed' THEN 1 
           ELSE 2 END,
      b.booking_date DESC, b.booking_time DESC
  `
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Manage all customer bookings and appointments</p>
      </div>

      <BookingsList bookings={bookings} />
    </div>
  )
}
