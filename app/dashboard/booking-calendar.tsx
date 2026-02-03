'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, MessageCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { createBookingAction } from './actions'

interface Service {
  id: number
  name: string
  price: number
  duration_minutes: number
}

interface WorkingHours {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

interface Vacation {
  id: number
  start_date: string
  end_date: string
  reason: string | null
}

interface ConfirmedBooking {
  booking_date: string
  booking_time: string
  duration_minutes: number
}

interface BookingCalendarProps {
  services: Service[]
  workingHours: WorkingHours[]
  vacations: Vacation[]
  confirmedBookings: ConfirmedBooking[]
  userId: number
  userPhone: string | null
  userName: string
}

const BUFFER_MINUTES = 30 // Buffer time after each booking

export function BookingCalendar({ 
  services, 
  workingHours, 
  vacations, 
  confirmedBookings, 
  userId, 
  userPhone, 
  userName 
}: BookingCalendarProps) {
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Create a map of vacation dates
  const vacationDates = useMemo(() => {
    const dates = new Set<string>()
    vacations.forEach(v => {
      const start = new Date(v.start_date)
      const end = new Date(v.end_date)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.add(d.toISOString().split('T')[0])
      }
    })
    return dates
  }, [vacations])

  // Create a map of working hours by day of week
  const workingHoursMap = useMemo(() => {
    const map: Record<number, WorkingHours> = {}
    workingHours.forEach(wh => {
      map[wh.day_of_week] = wh
    })
    return map
  }, [workingHours])

  // Create a map of booked time slots by date
  const bookedSlots = useMemo(() => {
    const map: Record<string, { start: string; end: string }[]> = {}
    confirmedBookings.forEach(b => {
      const dateStr = new Date(b.booking_date).toISOString().split('T')[0]
      if (!map[dateStr]) map[dateStr] = []
      
      // Calculate end time including buffer
      const [hours, minutes] = b.booking_time.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + (b.duration_minutes || 60) + BUFFER_MINUTES
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      
      map[dateStr].push({
        start: b.booking_time,
        end: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
      })
    })
    return map
  }, [confirmedBookings])

  // Check if a date is available
  function isDateAvailable(dateStr: string): boolean {
    const date = new Date(dateStr)
    const dayOfWeek = date.getDay()
    const wh = workingHoursMap[dayOfWeek]
    
    // Check if working on this day
    if (!wh || !wh.is_active) return false
    
    // Check if on vacation
    if (vacationDates.has(dateStr)) return false
    
    return true
  }

  // Get selected service details
  const selectedServiceDetails = useMemo(() => {
    return services.find(s => s.id.toString() === selectedService)
  }, [services, selectedService])

  // Generate time slots for a given date
  function getTimeSlotsForDate(dateStr: string, serviceDuration: number): string[] {
    const date = new Date(dateStr)
    const dayOfWeek = date.getDay()
    const wh = workingHoursMap[dayOfWeek]
    
    if (!wh || !wh.is_active) return []
    
    const slots: string[] = []
    const [startH, startM] = wh.start_time.split(':').map(Number)
    const [endH, endM] = wh.end_time.split(':').map(Number)
    
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    
    // Generate slots every 30 minutes
    for (let m = startMinutes; m + serviceDuration <= endMinutes; m += 30) {
      const h = Math.floor(m / 60)
      const mins = m % 60
      const timeStr = `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      
      // Check if this slot conflicts with any booked slot
      const booked = bookedSlots[dateStr] || []
      const slotEndMinutes = m + serviceDuration
      
      const isConflict = booked.some(b => {
        const [bStartH, bStartM] = b.start.split(':').map(Number)
        const [bEndH, bEndM] = b.end.split(':').map(Number)
        const bookedStart = bStartH * 60 + bStartM
        const bookedEnd = bEndH * 60 + bEndM
        
        // Check for overlap
        return (m < bookedEnd && slotEndMinutes > bookedStart)
      })
      
      if (!isConflict) {
        slots.push(timeStr)
      }
    }
    
    return slots
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: d,
        dateStr,
        isAvailable: isDateAvailable(dateStr),
        isPast: date < today
      })
    }

    return days
  }, [currentMonth, workingHoursMap, vacationDates])

  // Get time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedService || !selectedServiceDetails) return []
    return getTimeSlotsForDate(selectedDate, selectedServiceDetails.duration_minutes)
  }, [selectedDate, selectedService, selectedServiceDetails, bookedSlots, workingHoursMap])

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Please select a service, date, and time')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.set('serviceId', selectedService)
    formData.set('date', selectedDate)
    formData.set('time', selectedTime)
    formData.set('notes', notes)

    const result = await createBookingAction(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Booking request submitted! Diya will confirm via WhatsApp.')
      // Open WhatsApp to notify Diya
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank')
      }
      // Reset form
      setSelectedService('')
      setSelectedDate('')
      setSelectedTime('')
      setNotes('')
    }
    setIsSubmitting(false)
  }

  function sendWhatsApp() {
    if (!selectedService || !selectedDate || !selectedTime || !selectedServiceDetails) {
      toast.error('Please complete your booking selection first')
      return
    }

    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const message = encodeURIComponent(
      `Hi Diya! I'd like to book an appointment.\n\n` +
      `Name: ${userName}\n` +
      `Service: ${selectedServiceDetails.name}\n` +
      `Date: ${formattedDate}\n` +
      `Time: ${selectedTime}\n` +
      `${notes ? `Notes: ${notes}\n` : ''}\n` +
      `Please confirm my booking. Thank you!`
    )

    window.open(`https://wa.me/23057XXXXXXX?text=${message}`, '_blank')
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Service Selection */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Sparkles className="w-5 h-5 text-primary" />
            Select Service
          </CardTitle>
          <CardDescription>Choose the service you want</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {services.map(service => (
            <button
              key={service.id}
              type="button"
              onClick={() => {
                setSelectedService(service.id.toString())
                setSelectedTime('') // Reset time when service changes
              }}
              className={`w-full p-4 rounded-xl text-left transition-all border ${
                selectedService === service.id.toString()
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{service.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {service.duration_minutes} min
                  </p>
                </div>
                <span className="font-serif font-semibold text-primary">
                  Rs {service.price.toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-serif">
              <Calendar className="w-5 h-5 text-primary" />
              Select Date
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs text-muted-foreground font-medium p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                type="button"
                disabled={!day || !day.isAvailable || day.isPast}
                onClick={() => {
                  if (day && day.isAvailable && !day.isPast) {
                    setSelectedDate(day.dateStr)
                    setSelectedTime('')
                  }
                }}
                className={`
                  aspect-square rounded-lg text-sm transition-all
                  ${!day ? 'invisible' : ''}
                  ${day?.isPast ? 'text-muted-foreground/30 cursor-not-allowed' : ''}
                  ${day && !day.isAvailable && !day.isPast ? 'text-muted-foreground cursor-not-allowed' : ''}
                  ${day?.isAvailable && !day.isPast ? 'hover:bg-primary/10 cursor-pointer font-medium' : ''}
                  ${day?.dateStr === selectedDate ? 'bg-primary text-primary-foreground hover:bg-primary' : ''}
                  ${day?.isAvailable && !day.isPast && day.dateStr !== selectedDate ? 'bg-primary/5' : ''}
                `}
              >
                {day?.date}
              </button>
            ))}
          </div>
          
          {/* Time slots */}
          {selectedDate && selectedService && (
            <div className="mt-6">
              <Label className="mb-3 block">Available Times</Label>
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`
                        p-2 rounded-lg text-sm transition-all border
                        ${selectedTime === time
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      {time.slice(0, 5)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No slots available for this date</p>
              )}
            </div>
          )}
          
          {selectedDate && !selectedService && (
            <p className="mt-6 text-sm text-muted-foreground">Please select a service first to see available times</p>
          )}
        </CardContent>
      </Card>

      {/* Booking Summary */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="font-serif">Booking Summary</CardTitle>
          <CardDescription>Review and confirm your booking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedServiceDetails && (
            <div className="p-4 rounded-xl bg-secondary/50">
              <h4 className="font-medium">{selectedServiceDetails.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedServiceDetails.duration_minutes} minutes
              </p>
              <p className="font-serif text-lg font-semibold text-primary mt-2">
                Rs {selectedServiceDetails.price.toLocaleString()}
              </p>
            </div>
          )}

          {selectedDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
              {selectedTime && (
                <>
                  <span className="text-muted-foreground">at</span>
                  <span>{selectedTime.slice(0, 5)}</span>
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific designs or requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={!selectedService || !selectedDate || !selectedTime || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking'}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full gap-2 bg-transparent"
              onClick={sendWhatsApp}
              disabled={!selectedService || !selectedDate || !selectedTime}
            >
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Bookings are confirmed via WhatsApp by Diya
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
