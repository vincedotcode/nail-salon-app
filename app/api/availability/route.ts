import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const serviceId = searchParams.get("serviceId")
    
    if (!date) {
      return Response.json({ error: "Date is required" }, { status: 400 })
    }

    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()

    // Check if date is a blocked day
    const blockedDays = await sql`
      SELECT id FROM blocked_days
      WHERE date = ${date}::date
    `
    
    if (blockedDays.length > 0) {
      return Response.json({ available: false, slots: [], reason: "blocked" })
    }

    // Check if date is during vacation
    const vacations = await sql`
      SELECT id FROM vacations
      WHERE ${date}::date BETWEEN start_date AND end_date
    `
    
    if (vacations.length > 0) {
      return Response.json({ available: false, slots: [], reason: "vacation" })
    }

    // Get working hours for this day of week
    const workingHours = await sql`
      SELECT start_time, end_time
      FROM working_hours
      WHERE day_of_week = ${dayOfWeek} AND is_active = true
    `

    if (workingHours.length === 0) {
      return Response.json({ available: false, slots: [], reason: "closed" })
    }

    // Get service duration if provided
    let serviceDuration = 60 // default 1 hour
    if (serviceId) {
      const service = await sql`
        SELECT duration_minutes FROM services WHERE id = ${parseInt(serviceId)}
      `
      if (service.length > 0) {
        serviceDuration = service[0].duration_minutes
      }
    }

    // Get all confirmed bookings for this date with their durations
    const bookedSlots = await sql`
      SELECT b.booking_time, COALESCE(b.duration_minutes, s.duration_minutes, 60) as duration
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.booking_date = ${date}::date
      AND b.status IN ('confirmed')
    `

    // Build occupied time ranges (booking time + duration + 30 min buffer)
    const occupiedRanges: { start: number; end: number }[] = []
    for (const booking of bookedSlots) {
      const [hours, minutes] = booking.booking_time.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + booking.duration + 30 // 30 min buffer after each booking
      occupiedRanges.push({ start: startMinutes, end: endMinutes })
    }

    // Generate available time slots (30-minute intervals)
    const slots: string[] = []
    const wh = workingHours[0]
    const [startHour, startMin] = wh.start_time.split(':').map(Number)
    const [endHour, endMin] = wh.end_time.split(':').map(Number)
    const workStart = startHour * 60 + startMin
    const workEnd = endHour * 60 + endMin

    for (let time = workStart; time + serviceDuration <= workEnd; time += 30) {
      const slotEnd = time + serviceDuration
      
      // Check if this slot overlaps with any occupied range
      const isOccupied = occupiedRanges.some(range => 
        (time < range.end && slotEnd > range.start)
      )
      
      if (!isOccupied) {
        const hours = Math.floor(time / 60)
        const mins = time % 60
        slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`)
      }
    }

    return Response.json({ available: true, slots })
  } catch (error) {
    console.error("Failed to fetch availability:", error)
    return Response.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}
