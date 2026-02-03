'use server'

import { sql } from '@/lib/db'
import { logout, getAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function adminLogoutAction() {
  await logout(true)
}

// Booking actions
export async function confirmBookingAction(bookingId: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    const result = await sql`
      UPDATE bookings 
      SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING id
    `
    
    // Get booking details for WhatsApp
    const booking = await sql`
      SELECT b.*, u.full_name, u.phone, s.name as service_name, s.price, s.duration_minutes
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ${bookingId}
    `
    
    revalidatePath('/admin', 'layout')
    return { 
      success: true, 
      booking: booking[0],
      whatsappUrl: booking[0]?.phone ? generateWhatsAppUrl(booking[0], 'confirmed') : null
    }
  } catch (error) {
    console.error('Confirm booking error:', error)
    return { error: 'Failed to confirm booking' }
  }
}

function generateWhatsAppUrl(booking: any, type: 'confirmed' | 'completed' | 'new') {
  const phone = booking.phone?.replace(/\D/g, '')
  if (!phone) return null
  
  const formattedDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
  
  let message = ''
  if (type === 'confirmed') {
    message = `Hi ${booking.full_name}! Great news - your appointment at DS Nails has been confirmed!\n\nService: ${booking.service_name}\nDate: ${formattedDate}\nTime: ${booking.booking_time?.slice(0, 5)}\nPrice: Rs ${booking.price?.toLocaleString()}\n\nSee you soon! - Diya`
  } else if (type === 'completed') {
    const finalPrice = booking.final_price || booking.price
    message = `Hi ${booking.full_name}! Thank you for visiting DS Nails today!\n\nService: ${booking.service_name}\nTotal: Rs ${finalPrice?.toLocaleString()}\n\nHope you love your nails! See you next time! - Diya`
  } else {
    message = `New booking request from ${booking.full_name}!\n\nService: ${booking.service_name}\nDate: ${formattedDate}\nTime: ${booking.booking_time?.slice(0, 5)}\nPhone: ${booking.phone}`
  }
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export async function cancelBookingAdminAction(bookingId: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`
      UPDATE bookings 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${bookingId}
    `
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Cancel booking error:', error)
    return { error: 'Failed to cancel booking' }
  }
}

export async function completeBookingAction(bookingId: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`
      UPDATE bookings 
      SET status = 'completed', updated_at = NOW()
      WHERE id = ${bookingId}
    `
    
    // Get booking details for WhatsApp
    const booking = await sql`
      SELECT b.*, u.full_name, u.phone, s.name as service_name, s.price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ${bookingId}
    `
    
    revalidatePath('/admin', 'layout')
    return { 
      success: true,
      booking: booking[0],
      whatsappUrl: booking[0]?.phone ? generateWhatsAppUrl(booking[0], 'completed') : null
    }
  } catch (error) {
    console.error('Complete booking error:', error)
    return { error: 'Failed to complete booking' }
  }
}

export async function updateBookingPriceAction(bookingId: number, finalPrice: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`
      UPDATE bookings 
      SET final_price = ${finalPrice}, updated_at = NOW()
      WHERE id = ${bookingId}
    `
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Update price error:', error)
    return { error: 'Failed to update price' }
  }
}

// Blocked days actions (days Diya is NOT working)
export async function addBlockedDayAction(formData: FormData) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const date = formData.get('date') as string
  const reason = formData.get('reason') as string

  if (!date) {
    return { error: 'Please select a date' }
  }

  try {
    await sql`
      INSERT INTO blocked_days (date, reason)
      VALUES (${date}, ${reason || null})
      ON CONFLICT (date) DO UPDATE SET reason = ${reason || null}
    `
    revalidatePath('/admin/availability', 'page')
    return { success: true }
  } catch (error) {
    console.error('Add blocked day error:', error)
    return { error: 'Failed to block day' }
  }
}

export async function deleteBlockedDayAction(id: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`DELETE FROM blocked_days WHERE id = ${id}`
    revalidatePath('/admin/availability', 'page')
    return { success: true }
  } catch (error) {
    console.error('Delete blocked day error:', error)
    return { error: 'Failed to delete' }
  }
}

// Working hours actions
export async function updateWorkingHoursAction(dayOfWeek: number, startTime: string, endTime: string, isActive: boolean) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`
      UPDATE working_hours 
      SET start_time = ${startTime}, end_time = ${endTime}, is_active = ${isActive}
      WHERE day_of_week = ${dayOfWeek}
    `
    revalidatePath('/admin/availability', 'page')
    return { success: true }
  } catch (error) {
    console.error('Update working hours error:', error)
    return { error: 'Failed to update' }
  }
}

// Vacation actions
export async function addVacationAction(formData: FormData) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const reason = formData.get('reason') as string

  if (!startDate || !endDate) {
    return { error: 'Please fill all fields' }
  }

  try {
    await sql`
      INSERT INTO vacations (start_date, end_date, reason)
      VALUES (${startDate}, ${endDate}, ${reason || null})
    `
    revalidatePath('/admin/vacations', 'page')
    return { success: true }
  } catch (error) {
    console.error('Add vacation error:', error)
    return { error: 'Failed to add vacation' }
  }
}

export async function deleteVacationAction(id: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`DELETE FROM vacations WHERE id = ${id}`
    revalidatePath('/admin/vacations', 'page')
    return { success: true }
  } catch (error) {
    console.error('Delete vacation error:', error)
    return { error: 'Failed to delete' }
  }
}

// Gallery actions
export async function addGalleryItemAction(formData: FormData) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const imageUrl = formData.get('imageUrl') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!imageUrl) {
    return { error: 'Image URL is required' }
  }

  try {
    await sql`
      INSERT INTO gallery (image_url, title, description)
      VALUES (${imageUrl}, ${title || null}, ${description || null})
    `
    revalidatePath('/admin/gallery', 'page')
    revalidatePath('/', 'page')
    return { success: true }
  } catch (error) {
    console.error('Add gallery error:', error)
    return { error: 'Failed to add image' }
  }
}

export async function deleteGalleryItemAction(id: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`DELETE FROM gallery WHERE id = ${id}`
    revalidatePath('/admin/gallery', 'page')
    revalidatePath('/', 'page')
    return { success: true }
  } catch (error) {
    console.error('Delete gallery error:', error)
    return { error: 'Failed to delete' }
  }
}

// Testimonial actions
export async function addTestimonialAction(formData: FormData) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const customerName = formData.get('customerName') as string
  const content = formData.get('content') as string
  const rating = parseInt(formData.get('rating') as string) || 5
  const imageUrl = formData.get('imageUrl') as string

  if (!customerName || !content) {
    return { error: 'Name and content are required' }
  }

  try {
    await sql`
      INSERT INTO testimonials (customer_name, content, rating, image_url, is_approved)
      VALUES (${customerName}, ${content}, ${rating}, ${imageUrl || null}, true)
    `
    revalidatePath('/admin/testimonials', 'page')
    revalidatePath('/', 'page')
    return { success: true }
  } catch (error) {
    console.error('Add testimonial error:', error)
    return { error: 'Failed to add testimonial' }
  }
}

export async function deleteTestimonialAction(id: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`DELETE FROM testimonials WHERE id = ${id}`
    revalidatePath('/admin/testimonials', 'page')
    revalidatePath('/', 'page')
    return { success: true }
  } catch (error) {
    console.error('Delete testimonial error:', error)
    return { error: 'Failed to delete' }
  }
}

// Invoice actions
export async function createInvoiceAction(formData: FormData) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const bookingId = parseInt(formData.get('bookingId') as string)
  const userId = parseInt(formData.get('userId') as string)
  const amount = parseFloat(formData.get('amount') as string)
  const notes = formData.get('notes') as string

  if (!bookingId || !userId || !amount) {
    return { error: 'Missing required fields' }
  }

  try {
    await sql`
      INSERT INTO invoices (booking_id, user_id, amount, notes)
      VALUES (${bookingId}, ${userId}, ${amount}, ${notes || null})
    `
    revalidatePath('/admin/invoices', 'page')
    return { success: true }
  } catch (error) {
    console.error('Create invoice error:', error)
    return { error: 'Failed to create invoice' }
  }
}

export async function markInvoicePaidAction(id: number) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`
      UPDATE invoices SET status = 'paid', paid_at = NOW()
      WHERE id = ${id}
    `
    revalidatePath('/admin/invoices', 'page')
    return { success: true }
  } catch (error) {
    console.error('Mark paid error:', error)
    return { error: 'Failed to update' }
  }
}

// Service actions
export async function addServiceAction(formData: FormData) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const duration = parseInt(formData.get('duration') as string)

  if (!name || !price || !duration) {
    return { error: 'Missing required fields' }
  }

  try {
    await sql`
      INSERT INTO services (name, description, price, duration_minutes)
      VALUES (${name}, ${description || null}, ${price}, ${duration})
    `
    revalidatePath('/admin/services', 'page')
    revalidatePath('/', 'page')
    return { success: true }
  } catch (error) {
    console.error('Add service error:', error)
    return { error: 'Failed to add service' }
  }
}

export async function toggleServiceAction(id: number, isActive: boolean) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  try {
    await sql`UPDATE services SET is_active = ${isActive} WHERE id = ${id}`
    revalidatePath('/admin/services', 'page')
    revalidatePath('/', 'page')
    return { success: true }
  } catch (error) {
    console.error('Toggle service error:', error)
    return { error: 'Failed to update' }
  }
}

// Broadcast actions
export async function saveBroadcastAction(formData: FormData) {
  const admin = await getAdmin()
  if (!admin) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const message = formData.get('message') as string

  if (!title || !message) {
    return { error: 'Title and message are required' }
  }

  try {
    await sql`
      INSERT INTO broadcast_messages (title, message)
      VALUES (${title}, ${message})
    `
    revalidatePath('/admin/broadcast', 'page')
    return { success: true }
  } catch (error) {
    console.error('Save broadcast error:', error)
    return { error: 'Failed to save' }
  }
}

// Legacy alias exports for backwards compatibility
export const addAvailabilityAction = addVacationAction
export const deleteAvailabilityAction = deleteVacationAction
