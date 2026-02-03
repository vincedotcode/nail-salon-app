'use server'

import { sql } from '@/lib/db'
import { logout, getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function logoutAction() {
  await logout(false)
}

export async function createBookingAction(formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: 'Please log in to book' }
  }

  const serviceId = formData.get('serviceId') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string

  if (!serviceId || !date || !time) {
    return { error: 'Please select a service, date, and time' }
  }

  try {
    // Get service details
    const service = await sql`SELECT * FROM services WHERE id = ${parseInt(serviceId)}`
    if (service.length === 0) {
      return { error: 'Invalid service' }
    }

    // Check if slot is still available (not conflicting with confirmed bookings)
    const conflicting = await sql`
      SELECT * FROM bookings 
      WHERE booking_date = ${date} 
        AND status IN ('confirmed', 'completed')
        AND (
          (booking_time::time <= ${time}::time 
           AND booking_time::time + make_interval(mins => COALESCE(duration_minutes, 60) + 30) > ${time}::time)
          OR (${time}::time < booking_time::time 
              AND ${time}::time + make_interval(mins => ${service[0].duration_minutes} + 30) > booking_time::time)
        )
    `

    if (conflicting.length > 0) {
      return { error: 'This slot is no longer available' }
    }

    // Create booking with duration
    const booking = await sql`
      INSERT INTO bookings (user_id, service_id, booking_date, booking_time, duration_minutes, notes, status)
      VALUES (${user.id}, ${parseInt(serviceId)}, ${date}, ${time}, ${service[0].duration_minutes}, ${notes || null}, 'pending')
      RETURNING id
    `

    // Generate WhatsApp URL to notify Diya
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
    
    const adminPhone = '23057XXXXXXX' // Replace with Diya's actual WhatsApp number
    const message = `New booking request!\n\nClient: ${user.full_name}\nPhone: ${user.phone || 'Not provided'}\nService: ${service[0].name}\nDate: ${formattedDate}\nTime: ${time.slice(0, 5)}\n${notes ? `Notes: ${notes}\n` : ''}\nPlease confirm or reject this booking.`
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`

    revalidatePath('/dashboard', 'page')
    return { success: true, bookingId: booking[0].id, whatsappUrl }
  } catch (error) {
    console.error('Booking error:', error)
    return { error: 'Failed to create booking' }
  }
}

export async function cancelBookingAction(bookingId: number) {
  const user = await getUser()
  if (!user) {
    return { error: 'Please log in' }
  }

  try {
    await sql`
      UPDATE bookings 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${bookingId} AND user_id = ${user.id}
    `

    revalidatePath('/dashboard', 'page')
    return { success: true }
  } catch (error) {
    console.error('Cancel booking error:', error)
    return { error: 'Failed to cancel booking' }
  }
}
