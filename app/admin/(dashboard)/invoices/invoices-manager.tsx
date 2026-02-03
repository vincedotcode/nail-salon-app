'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Receipt, DollarSign, TrendingUp, Clock, CheckCircle, Loader2, Plus, Printer, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createInvoiceAction, markInvoicePaidAction } from '../actions'

interface Invoice {
  id: number
  booking_id: number
  user_id: number
  full_name: string
  email: string
  phone: string | null
  booking_date: string
  booking_time: string
  service_name: string
  amount: number
  status: string
  paid_at: string | null
  notes: string | null
  created_at: string
}

interface PendingBooking {
  id: number
  user_id: number
  full_name: string
  booking_date: string
  booking_time: string
  service_name: string
  price: number
}

interface Stats {
  total: number
  paid: number
  unpaid: number
  thisMonth: number
}

export function InvoicesManager({ 
  invoices, 
  pendingBookings, 
  stats 
}: { 
  invoices: Invoice[]
  pendingBookings: PendingBooking[]
  stats: Stats
}) {
  const [creatingId, setCreatingId] = useState<number | null>(null)
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null)

  async function handleCreateInvoice(booking: PendingBooking) {
    setCreatingId(booking.id)
    const formData = new FormData()
    formData.set('bookingId', booking.id.toString())
    formData.set('userId', booking.user_id.toString())
    formData.set('amount', booking.price.toString())
    
    const result = await createInvoiceAction(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Invoice created')
    }
    setCreatingId(null)
  }

  async function handleMarkPaid(invoiceId: number) {
    setMarkingPaidId(invoiceId)
    const result = await markInvoicePaidAction(invoiceId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Invoice marked as paid')
    }
    setMarkingPaidId(null)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold font-serif">Rs {Number(stats.total).toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold font-serif text-green-600">Rs {Number(stats.paid).toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold font-serif text-amber-600">Rs {Number(stats.unpaid).toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold font-serif">Rs {Number(stats.thisMonth).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Bookings Without Invoice */}
      {pendingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <Plus className="w-5 h-5 text-primary" />
              Create Invoice for Completed Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBookings.map(booking => (
                <div 
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-secondary/50"
                >
                  <div>
                    <h4 className="font-medium">{booking.full_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {booking.service_name} - {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                    <p className="font-serif font-semibold text-primary mt-1">
                      Rs {booking.price?.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCreateInvoice(booking)}
                    disabled={creatingId === booking.id}
                    className="self-start sm:self-auto"
                  >
                    {creatingId === booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Receipt className="w-4 h-4 mr-2" />
                        Create Invoice
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 font-serif">
            <Receipt className="w-5 h-5 text-primary" />
            All Invoices
          </CardTitle>
          <Button asChild>
            <Link href="/admin/invoices/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div 
                  key={invoice.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{invoice.full_name}</h4>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.service_name} - {new Date(invoice.booking_date).toLocaleDateString()}
                    </p>
                    <p className="font-serif text-lg font-semibold text-primary mt-1">
                      Rs {Number(invoice.amount).toLocaleString()}
                    </p>
                    {invoice.paid_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/invoices/${invoice.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {invoice.status === 'unpaid' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(invoice.id)}
                        disabled={markingPaidId === invoice.id}
                      >
                        {markingPaidId === invoice.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Paid
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
