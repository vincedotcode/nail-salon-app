'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { cancelBookingAction } from './actions'
import { toast } from 'sonner'

interface Booking {
  id: number
  service_name: string
  price: number
  duration_minutes: number
  booking_date: string
  booking_time: string
  status: string
  notes: string | null
  created_at: string
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: AlertCircle },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle },
  completed: { label: 'Completed', variant: 'outline', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
}

export function MyBookings({ bookings }: { bookings: Booking[] }) {
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  async function handleCancel(bookingId: number) {
    setCancellingId(bookingId)
    const result = await cancelBookingAction(bookingId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Booking cancelled')
    }
    setCancellingId(null)
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-xl font-semibold mb-2">No Bookings Yet</h3>
        <p className="text-muted-foreground">
          Your booking history will appear here once you make your first appointment.
        </p>
      </div>
    )
  }

  const upcomingBookings = bookings.filter(b => 
    new Date(b.booking_date) >= new Date(new Date().setHours(0, 0, 0, 0)) && 
    b.status !== 'cancelled' && 
    b.status !== 'completed'
  )
  const pastBookings = bookings.filter(b => 
    new Date(b.booking_date) < new Date(new Date().setHours(0, 0, 0, 0)) || 
    b.status === 'cancelled' || 
    b.status === 'completed'
  )

  return (
    <div className="space-y-8">
      {upcomingBookings.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {upcomingBookings.map(booking => {
              const status = statusConfig[booking.status] || statusConfig.pending
              const StatusIcon = status.icon
              
              return (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-32 p-4 bg-primary/5 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-border">
                        <span className="text-2xl font-serif font-bold text-primary">
                          {new Date(booking.booking_date).getDate()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <h4 className="font-semibold">{booking.service_name}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {booking.booking_time.slice(0, 5)}
                              </span>
                              <span>{booking.duration_minutes} min</span>
                              <span className="font-medium text-foreground">
                                Rs {booking.price?.toLocaleString()}
                              </span>
                            </div>
                            {booking.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Note: {booking.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-2">
                            <Badge variant={status.variant} className="gap-1">
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                            {booking.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleCancel(booking.id)}
                                disabled={cancellingId === booking.id}
                              >
                                {cancellingId === booking.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Cancel'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-semibold mb-4 text-muted-foreground">Past Appointments</h3>
          <div className="space-y-3">
            {pastBookings.map(booking => {
              const status = statusConfig[booking.status] || statusConfig.pending
              
              return (
                <div 
                  key={booking.id} 
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="block font-semibold">
                        {new Date(booking.booking_date).getDate()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{booking.service_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.booking_time.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
