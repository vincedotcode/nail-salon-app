'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Receipt, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

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
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch('/api/admin/clients'),
          fetch('/api/services')
        ])
        const [clientsData, servicesData] = await Promise.all([
          clientsRes.json(),
          servicesRes.json()
        ])
        setClients(clientsData)
        setServices(servicesData)
      } catch {
        toast.error('Failed to load data')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Update amount when service changes
  useEffect(() => {
    if (selectedService) {
      const service = services.find(s => s.id.toString() === selectedService)
      if (service) {
        setAmount(service.price.toString())
      }
    }
  }, [selectedService, services])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedClient || !amount) {
      toast.error('Please fill in all required fields')
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
          amount: parseFloat(amount),
          notes
        })
      })

      const result = await res.json()
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Invoice created successfully')
        router.push(`/admin/invoices/${result.id}`)
      }
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
      <Link href="/admin/invoices" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Invoices
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Receipt className="w-5 h-5 text-primary" />
            Create New Invoice
          </CardTitle>
          <CardDescription>Generate an invoice for a client</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.full_name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service (optional)</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - Rs {service.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Rs) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for the invoice..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={submitting}>
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
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/invoices">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
