'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Receipt, ArrowLeft, Loader2, Search, Calendar, Clock, User, Sparkles, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Client {
  id: number
  full_name: string
  email: string
  phone: string | null
}

interface Service {
  id: number
  name: string
  price: number
  duration_minutes: number
}

interface Booking {
  id: number
  booking_date: string
  booking_time: string
  status: string
  notes: string | null
  duration_minutes: number | null
  final_price: number | null
  user_id: number
  full_name: string
  email: string
  phone: string | null
  service_id: number | null
  service_name: string | null
  service_price: number | null
  invoice_id: number | null
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingStatus, setBookingStatus] = useState('completed')
  const [showInvoiced, setShowInvoiced] = useState(false)
  const [autoFill, setAutoFill] = useState(true)

  const [selectedClient, setSelectedClient] = useState('')
  const [selectedService, setSelectedService] = useState('')

  const [discount, setDiscount] = useState('')
  const [extraFees, setExtraFees] = useState('')
  const [amountOverride, setAmountOverride] = useState(false)
  const [manualAmount, setManualAmount] = useState('')

  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid'>('unpaid')
  const [paidAt, setPaidAt] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [serviceDate, setServiceDate] = useState('')
  const [serviceTime, setServiceTime] = useState('')
  const [sendWhatsapp, setSendWhatsapp] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsRes, servicesRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/clients'),
          fetch('/api/services'),
          fetch('/api/admin/bookings'),
        ])
        const [clientsData, servicesData, bookingsData] = await Promise.all([
          clientsRes.json(),
          servicesRes.json(),
          bookingsRes.json(),
        ])
        setClients(Array.isArray(clientsData) ? clientsData : [])
        setServices(Array.isArray(servicesData) ? servicesData : [])
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      } catch {
        toast.error('Failed to load invoice data')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedBookingId) || null,
    [bookings, selectedBookingId]
  )

  const selectedClientDetails = useMemo(
    () => clients.find((c) => c.id.toString() === selectedClient) || null,
    [clients, selectedClient]
  )

  const selectedServiceDetails = useMemo(
    () => services.find((s) => s.id.toString() === selectedService) || null,
    [services, selectedService]
  )

  useEffect(() => {
    if (!selectedBooking || !autoFill) return

    setSelectedClient(selectedBooking.user_id.toString())
    setSelectedService(selectedBooking.service_id?.toString() || '')
    setNotes(selectedBooking.notes || '')
    setServiceDate(selectedBooking.booking_date)
    setServiceTime(selectedBooking.booking_time?.slice(0, 5) || '')
    setAmountOverride(false)
  }, [selectedBooking, autoFill])

  const baseAmount = useMemo(() => {
    if (selectedBooking) {
      return Number(selectedBooking.final_price || selectedBooking.service_price || 0)
    }
    if (selectedServiceDetails) {
      return Number(selectedServiceDetails.price || 0)
    }
    return 0
  }, [selectedBooking, selectedServiceDetails])

  const discountValue = Number(discount || 0)
  const extraValue = Number(extraFees || 0)
  const computedTotal = Math.max(0, baseAmount + extraValue - discountValue)

  const amountToSend = amountOverride ? Number(manualAmount || 0) : computedTotal

  const filteredBookings = bookings
    .filter((booking) => (showInvoiced ? true : !booking.invoice_id))
    .filter((booking) => (bookingStatus === 'all' ? true : booking.status === bookingStatus))
    .filter((booking) => {
      const search = bookingSearch.trim().toLowerCase()
      if (!search) return true
      return (
        booking.full_name.toLowerCase().includes(search) ||
        booking.email.toLowerCase().includes(search) ||
        booking.phone?.includes(search) ||
        booking.service_name?.toLowerCase().includes(search)
      )
    })

  const notesToSend = useMemo(() => {
    const detailLines = []
    if (!selectedBooking && selectedServiceDetails) detailLines.push(`Service: ${selectedServiceDetails.name}`)
    if (!selectedBooking && serviceDate) detailLines.push(`Service date: ${serviceDate}`)
    if (!selectedBooking && serviceTime) detailLines.push(`Service time: ${serviceTime}`)
    if (paymentMethod) detailLines.push(`Payment method: ${paymentMethod}`)
    if (dueDate) detailLines.push(`Due date: ${dueDate}`)
    if (reference) detailLines.push(`Reference: ${reference}`)

    const baseNotes = notes.trim()
    return [baseNotes, ...detailLines].filter(Boolean).join('\n')
  }, [notes, paymentMethod, dueDate, reference, selectedBooking, selectedServiceDetails, serviceDate, serviceTime])

  function toggleAmountOverride() {
    if (!amountOverride) {
      setManualAmount(computedTotal.toFixed(2))
    }
    setAmountOverride(!amountOverride)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedClient) {
      toast.error('Please select a client')
      return
    }
    if (!amountToSend || Number.isNaN(amountToSend)) {
      toast.error('Please enter a valid amount')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(selectedClient),
          serviceId: selectedService ? parseInt(selectedService) : null,
          bookingId: selectedBookingId,
          amount: amountToSend,
          notes: notesToSend || null,
          status: paymentStatus,
          paidAt: paymentStatus === 'paid' ? (paidAt || new Date().toISOString()) : null,
        }),
      })

      const result = await res.json()

      if (result.error) {
        toast.error(result.error)
        setSubmitting(false)
        return
      }

      toast.success('Invoice created successfully')

      if (sendWhatsapp) {
        const phone = selectedBooking?.phone || selectedClientDetails?.phone
        const name = selectedBooking?.full_name || selectedClientDetails?.full_name || 'there'
        if (phone) {
          const message = [
            `Hi ${name.split(' ')[0]}!`,
            '',
            `Your DS Nails invoice is ready.`,
            `Invoice #${result.id?.toString().padStart(5, '0')}`,
            selectedBooking?.service_name || selectedServiceDetails?.name ? `Service: ${selectedBooking?.service_name || selectedServiceDetails?.name}` : '',
            `Amount: Rs ${Number(amountToSend).toLocaleString()}`,
            paymentStatus === 'paid' ? 'Status: Paid' : 'Status: Unpaid',
          ]
            .filter(Boolean)
            .join('\n')
          window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
        }
      }

      router.push(`/admin/invoices/${result.id}`)
    } catch {
      toast.error('Failed to create invoice')
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Invoices
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <Receipt className="w-5 h-5 text-primary" />
                Create New Invoice
              </CardTitle>
              <CardDescription>Pick a booking to auto-fill details or create a custom invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bookings by client, email, phone, or service..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={bookingStatus} onValueChange={setBookingStatus}>
                  <SelectTrigger className="w-full lg:w-44">
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

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={autoFill} onCheckedChange={setAutoFill} />
                  <span className="text-sm text-muted-foreground">Auto-fill from booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showInvoiced} onCheckedChange={setShowInvoiced} />
                  <span className="text-sm text-muted-foreground">Show already invoiced</span>
                </div>
                {selectedBookingId && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedBookingId(null)}>
                    Clear selection
                  </Button>
                )}
              </div>

              <div className="grid gap-3 max-h-[340px] overflow-auto pr-1">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No bookings found</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setSelectedBookingId(booking.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedBookingId === booking.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/40 hover:bg-secondary/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{booking.full_name}</p>
                            <Badge className={statusStyles[booking.status] || 'bg-secondary text-foreground'}>
                              {booking.status}
                            </Badge>
                            {booking.invoice_id && (
                              <Badge variant="outline" className="text-xs">Invoiced</Badge>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {booking.booking_time?.slice(0, 5)}
                            </span>
                            {booking.service_name && (
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                {booking.service_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-lg font-semibold text-primary">
                            Rs {Number(booking.final_price || booking.service_price || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.duration_minutes || 60} min
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Invoice Details</CardTitle>
              <CardDescription>Confirm client, service, and pricing details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.full_name} ({client.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} - Rs {service.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!selectedBooking && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceDate">Service Date</Label>
                      <Input
                        id="serviceDate"
                        type="date"
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceTime">Service Time</Label>
                      <Input
                        id="serviceTime"
                        type="time"
                        value={serviceTime}
                        onChange={(e) => setServiceTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (Rs)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extra">Extra Charges (Rs)</Label>
                    <Input
                      id="extra"
                      type="number"
                      min="0"
                      step="0.01"
                      value={extraFees}
                      onChange={(e) => setExtraFees(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Invoice Total (Rs) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountOverride ? manualAmount : computedTotal.toFixed(2)}
                      onChange={(e) => setManualAmount(e.target.value)}
                      disabled={!amountOverride}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={toggleAmountOverride}>
                      {amountOverride ? 'Use auto total' : 'Override amount'}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as 'paid' | 'unpaid')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Paid Date</Label>
                    <Input
                      type="date"
                      value={paidAt}
                      onChange={(e) => setPaidAt(e.target.value)}
                      disabled={paymentStatus !== 'paid'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                        <SelectItem value="mobile-money">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reference</Label>
                    <Input
                      placeholder="Receipt #, transaction id, etc."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes for the invoice..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Notes will include payment details and references automatically.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={sendWhatsapp} onCheckedChange={setSendWhatsapp} />
                    <span className="text-sm text-muted-foreground">Send WhatsApp after creation</span>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4 mr-2" />
                        Create Invoice
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Invoice Preview</CardTitle>
              <CardDescription>Review the invoice summary before saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedBooking?.full_name || selectedClientDetails?.full_name || 'Client name'}</p>
                  <p className="text-xs text-muted-foreground">{selectedBooking?.email || selectedClientDetails?.email || 'Email'}</p>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
                <p className="text-sm font-medium">Service</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking?.service_name || selectedServiceDetails?.name || 'Select a service'}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{selectedBooking?.booking_date || serviceDate || 'Date'}</span>
                  <Clock className="w-3 h-3" />
                  <span>{selectedBooking?.booking_time?.slice(0, 5) || serviceTime || 'Time'}</span>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base Amount</span>
                  <span>Rs {baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>- Rs {discountValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Extra Charges</span>
                  <span>+ Rs {extraValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>Rs {amountToSend.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs ${paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </div>

              {notesToSend && (
                <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                  {notesToSend}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                Invoice will be linked to the booking when selected.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
