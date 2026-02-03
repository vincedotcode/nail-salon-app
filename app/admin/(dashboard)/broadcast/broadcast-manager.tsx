'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Send, Users, MessageCircle, History, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveBroadcastAction } from '../actions'

interface Client {
  id: number
  full_name: string
  email: string
  phone: string
}

interface BroadcastHistory {
  id: number
  title: string
  message: string
  sent_at: string | null
  recipients_count: number
  created_at: string
}

export function BroadcastManager({ 
  clients, 
  history 
}: { 
  clients: Client[]
  history: BroadcastHistory[]
}) {
  const [selectedClients, setSelectedClients] = useState<number[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  function toggleClient(id: number) {
    setSelectedClients(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  function selectAll() {
    if (selectedClients.length === clients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(clients.map(c => c.id))
    }
  }

  async function handleSend() {
    if (selectedClients.length === 0) {
      toast.error('Please select at least one client')
      return
    }
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsSending(true)

    // Save broadcast to history
    const formData = new FormData()
    formData.set('title', title || 'Broadcast Message')
    formData.set('message', message)
    await saveBroadcastAction(formData)

    // Open WhatsApp for each selected client
    const selectedClientsList = clients.filter(c => selectedClients.includes(c.id))
    
    for (const client of selectedClientsList) {
      const personalizedMessage = message.replace('{name}', client.full_name.split(' ')[0])
      const url = `https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(personalizedMessage)}`
      window.open(url, '_blank')
      // Small delay between opening tabs
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    toast.success(`Opening WhatsApp for ${selectedClients.length} clients`)
    setIsSending(false)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Compose Message */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <MessageCircle className="w-5 h-5 text-primary" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title (for your reference)</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Discount" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi {name}! We have a special offer for you..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Use {'{name}'} to personalize with client&apos;s first name
              </p>
            </div>

            <div className="p-4 bg-secondary/50 rounded-xl">
              <h4 className="font-medium text-sm mb-2">Quick Templates</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMessage(`Hi {name}! We miss you at DS Nails! Book your next appointment and enjoy 10% off. DM us on Instagram to book!`)}
                >
                  Miss You
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMessage(`Hi {name}! DS Nails is offering a special discount this week! Get 15% off all gel services. Book now before slots fill up!`)}
                >
                  Discount
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMessage(`Hi {name}! Just wanted to check in and see how your nails are doing! Ready for a refresh? Book your next appointment with us!`)}
                >
                  Check-in
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <History className="w-5 h-5 text-primary" />
                Recent Broadcasts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 5).map(item => (
                  <div key={item.id} className="p-3 rounded-lg bg-secondary/50 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{item.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Select Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="flex items-center gap-2 font-serif">
              <Users className="w-5 h-5 text-primary" />
              Select Recipients
            </span>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No clients with phone numbers</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[400px] overflow-auto mb-6">
                {clients.map(client => (
                  <label
                    key={client.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedClients.includes(client.id) 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => toggleClient(client.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{client.full_name}</p>
                      <p className="text-xs text-muted-foreground">{client.phone}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedClients.length} of {clients.length} selected
                  </span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSend}
                  disabled={selectedClients.length === 0 || !message.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send via WhatsApp ({selectedClients.length})
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
