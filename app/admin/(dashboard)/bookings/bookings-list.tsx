'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Calendar, Clock, Phone, Mail, Search, CheckCircle, XCircle, Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { confirmBookingAction, cancelBookingAdminAction, completeBookingAction, updateBookingPriceAction } from '../actions'

interface Booking {
  id: number
  full_name: string
  email: string
  phone: string | null
  service_name: string
  price: number
  final_price: number | null
  duration_minutes: number
  booking_date: string
  booking_time: string
  status: string
  notes: string | null
  user_id: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function BookingsList({ bookings }: { bookings: Booking[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState('')

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                         booking.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleAction(action: 'confirm' | 'cancel' | 'complete', bookingId: number, booking?: Booking) {
    setLoadingId(bookingId)
    let result
    if (action === 'confirm') {
      result = await confirmBookingAction(bookingId)
      if (result.success && result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank')
      }
    } else if (action === 'cancel') {
      result = await cancelBookingAdminAction(bookingId)
    } else {
      result = await completeBookingAction(bookingId)
      if (result.success && result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank')
      }
    }
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Booking ${action}ed`)
    }
    setLoadingId(null)
  }

  async function handlePriceUpdate(bookingId: number) {
    const price = parseFloat(editPrice)
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price')
      return
    }
    
    setLoadingId(bookingId)
    const result = await updateBookingPriceAction(bookingId, price)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Price updated')
      setEditingPriceId(null)
      setEditPrice('')
    }
    setLoadingId(null)
  }

  function sendWhatsApp(booking: Booking, type: 'confirm' | 'reminder') {
    if (!booking.phone) {
      toast.error('No phone number available')
      return
    }

    const formattedDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })

    let message = ''
    if (type === 'confirm') {
      message = `Hi ${booking.full_name}! Your appointment at DS Nails has been confirmed.\n\nService: ${booking.service_name}\nDate: ${formattedDate}\nTime: ${booking.booking_time.slice(0, 5)}\n\nSee you soon!`
    } else {
      message = `Hi ${booking.full_name}! This is a friendly reminder about your appointment at DS Nails tomorrow.\n\nService: ${booking.service_name}\nTime: ${booking.booking_time.slice(0, 5)}\n\nSee you soon!`
    }

    window.open(`https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No bookings found</p>
          </div>
        ) : (
          filteredBookings.map(booking => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.full_name}</h3>
                        <p className="text-primary font-medium">{booking.service_name}</p>
                      </div>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.booking_time.slice(0, 5)}
                      </span>
                      {booking.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {booking.email}
                        </span>
                      )}
                      {booking.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {booking.phone}
                        </span>
                      )}
                    </div>
                    
                    {booking.notes && (
                      <p className="text-sm bg-secondary/50 p-2 rounded mt-3">
                        Note: {booking.notes}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      {editingPriceId === booking.id ? (
                        <>
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-32"
                            placeholder="Price"
                          />
                          <Button size="sm" onClick={() => handlePriceUpdate(booking.id)} disabled={loadingId === booking.id}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingPriceId(null); setEditPrice(''); }}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="font-serif text-lg font-semibold text-primary">
                            Rs {(booking.final_price || booking.price)?.toLocaleString()}
                          </p>
                          {booking.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => { 
                                setEditingPriceId(booking.id); 
                                setEditPrice((booking.final_price || booking.price)?.toString() || ''); 
                              }}
                            >
                              Edit Price
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAction('confirm', booking.id)}
                          disabled={loadingId === booking.id}
                        >
                          {loadingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendWhatsApp(booking, 'confirm')}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleAction('cancel', booking.id)}
                          disabled={loadingId === booking.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAction('complete', booking.id)}
                          disabled={loadingId === booking.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendWhatsApp(booking, 'reminder')}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Send Reminder
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
