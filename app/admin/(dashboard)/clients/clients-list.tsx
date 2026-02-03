'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Phone, Calendar, MessageCircle, DollarSign } from 'lucide-react'

interface Client {
  id: number
  full_name: string
  email: string
  phone: string | null
  created_at: string
  total_bookings: number
  completed_bookings: number
  total_spent: number
}

export function ClientsList({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase()) ||
    client.phone?.includes(search)
  )

  function sendWhatsApp(client: Client) {
    if (!client.phone) return
    const message = `Hi ${client.full_name}! This is DS Nails. We hope you're doing well!`
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="text-2xl font-bold font-serif">{clients.length}</div>
          <div className="text-sm text-muted-foreground">Total Clients</div>
        </div>
        <div className="p-4 rounded-xl bg-secondary">
          <div className="text-2xl font-bold font-serif">
            {clients.filter(c => Number(c.total_bookings) > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Active Clients</div>
        </div>
        <div className="p-4 rounded-xl bg-secondary">
          <div className="text-2xl font-bold font-serif">
            {clients.filter(c => Number(c.completed_bookings) >= 3).length}
          </div>
          <div className="text-sm text-muted-foreground">VIP (3+ visits)</div>
        </div>
        <div className="p-4 rounded-xl bg-secondary">
          <div className="text-2xl font-bold font-serif">
            Rs {clients.reduce((sum, c) => sum + Number(c.total_spent), 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No clients found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-serif text-lg font-bold text-primary">
                        {client.full_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.full_name}</h3>
                      {Number(client.completed_bookings) >= 3 && (
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                          VIP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{client.total_bookings} bookings ({client.completed_bookings} completed)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Rs {Number(client.total_spent).toLocaleString()} total spent</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {client.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 bg-transparent"
                      onClick={() => sendWhatsApp(client)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
