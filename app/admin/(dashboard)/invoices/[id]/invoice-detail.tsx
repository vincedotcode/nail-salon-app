'use client'

import { useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Printer, CheckCircle, Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/components/logo'

interface Invoice {
  id: number
  booking_id: number | null
  user_id: number
  full_name: string
  email: string
  phone: string | null
  booking_date: string | null
  booking_time: string | null
  service_name: string | null
  amount: number
  status: string
  paid_at: string | null
  notes: string | null
  created_at: string
}

export function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const printRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleMarkPaid() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/pay`, {
        method: 'POST'
      })
      const result = await res.json()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Invoice marked as paid')
        router.refresh()
      }
    } catch {
      toast.error('Failed to update invoice')
    }
    setLoading(false)
  }

  function handlePrint() {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoice.id} - DS Nails</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5a4b4; }
            .logo { font-size: 28px; font-weight: bold; color: #d4899a; }
            .logo span { font-size: 14px; font-weight: normal; color: #666; display: block; }
            .invoice-info { text-align: right; }
            .invoice-info h2 { color: #d4899a; font-size: 24px; margin-bottom: 8px; }
            .client-section { margin-bottom: 30px; }
            .client-section h3 { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; }
            .client-section p { margin: 4px 0; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items th { background: #fdf2f4; padding: 12px; text-align: left; border-bottom: 2px solid #e5a4b4; }
            .items td { padding: 12px; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 24px; color: #d4899a; font-weight: bold; margin-top: 20px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status.paid { background: #dcfce7; color: #166534; }
            .status.unpaid { background: #fef3c7; color: #92400e; }
            .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; }
            .notes { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .notes h4 { font-size: 12px; color: #666; margin-bottom: 8px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              DS Nails
              <span>Gangamah Avenue, Quatre Bornes, Mauritius</span>
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <p><strong>#${invoice.id.toString().padStart(5, '0')}</strong></p>
              <p>Date: ${new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span>
            </div>
          </div>

          <div class="client-section">
            <h3>Bill To</h3>
            <p><strong>${invoice.full_name}</strong></p>
            <p>${invoice.email}</p>
            ${invoice.phone ? `<p>${invoice.phone}</p>` : ''}
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoice.service_name || 'Nail Service'}</td>
                <td>${invoice.booking_date ? new Date(invoice.booking_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                <td style="text-align: right;">Rs ${Number(invoice.amount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total: Rs ${Number(invoice.amount).toLocaleString()}
          </div>

          ${invoice.notes ? `
            <div class="notes">
              <h4>Notes</h4>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for choosing DS Nails!</p>
            <p>Follow us on Instagram: @_ds_nailss</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  function sendWhatsApp() {
    if (!invoice.phone) {
      toast.error('No phone number available')
      return
    }
    const phone = invoice.phone.replace(/\D/g, '')
    const message = `Hi ${invoice.full_name}!\n\nHere's your invoice from DS Nails:\n\nInvoice #${invoice.id.toString().padStart(5, '0')}\nService: ${invoice.service_name || 'Nail Service'}\nAmount: Rs ${Number(invoice.amount).toLocaleString()}\nStatus: ${invoice.status.toUpperCase()}\n\nThank you for choosing DS Nails!`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Invoices
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Invoice #{invoice.id.toString().padStart(5, '0')}</h1>
        <div className="flex gap-2">
          {invoice.phone && (
            <Button variant="outline" onClick={sendWhatsApp}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Send via WhatsApp
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          {invoice.status === 'unpaid' && (
            <Button onClick={handleMarkPaid} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <Card ref={printRef}>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b">
            <div>
              <Logo size="lg" />
              <p className="text-sm text-muted-foreground mt-2">
                Gangamah Avenue, Quatre Bornes<br />
                Mauritius
              </p>
            </div>
            <div className="text-right">
              <h2 className="font-serif text-2xl font-bold text-primary mb-2">INVOICE</h2>
              <p className="text-lg font-medium">#{invoice.id.toString().padStart(5, '0')}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(invoice.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <Badge className="mt-2" variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Bill To</h3>
            <p className="font-medium text-lg">{invoice.full_name}</p>
            <p className="text-muted-foreground">{invoice.email}</p>
            {invoice.phone && <p className="text-muted-foreground">{invoice.phone}</p>}
          </div>

          {/* Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left py-3 px-2 bg-secondary/50">Description</th>
                <th className="text-left py-3 px-2 bg-secondary/50">Date</th>
                <th className="text-right py-3 px-2 bg-secondary/50">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 px-2">{invoice.service_name || 'Nail Service'}</td>
                <td className="py-4 px-2">
                  {invoice.booking_date 
                    ? new Date(invoice.booking_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : '-'
                  }
                </td>
                <td className="py-4 px-2 text-right font-medium">
                  Rs {Number(invoice.amount).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-serif font-bold text-primary">
                Rs {Number(invoice.amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-secondary/30 rounded-lg p-4 mb-8">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
              <p className="text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Paid info */}
          {invoice.paid_at && (
            <div className="bg-green-50 text-green-800 rounded-lg p-4 mb-8">
              <p className="text-sm">
                Paid on {new Date(invoice.paid_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-6 border-t">
            <p>Thank you for choosing DS Nails!</p>
            <p>Follow us on Instagram: @_ds_nailss</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
