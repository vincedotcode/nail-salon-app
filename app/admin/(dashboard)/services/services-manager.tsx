'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Settings, Plus, Loader2, Clock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { addServiceAction, toggleServiceAction } from '../actions'

interface Service {
  id: number
  name: string
  description: string | null
  price: number
  duration_minutes: number
  is_active: boolean
}

export function ServicesManager({ services }: { services: Service[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  async function handleAdd(formData: FormData) {
    setIsAdding(true)
    const result = await addServiceAction(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Service added')
    }
    setIsAdding(false)
  }

  async function handleToggle(id: number, currentState: boolean) {
    setTogglingId(id)
    const result = await toggleServiceAction(id, !currentState)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Service ${!currentState ? 'enabled' : 'disabled'}`)
    }
    setTogglingId(null)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Add New Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Plus className="w-5 h-5 text-primary" />
            Add New Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" name="name" placeholder="e.g., Gel Manicure" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe what's included..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs)</Label>
                <Input id="price" name="price" type="number" placeholder="1000" required min="0" step="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" name="duration" type="number" placeholder="60" required min="15" step="15" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add Service
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Settings className="w-5 h-5 text-primary" />
            Current Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No services yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map(service => (
                <div 
                  key={service.id}
                  className={`p-4 rounded-xl border ${service.is_active ? 'border-border bg-card' : 'border-border/50 bg-secondary/30 opacity-60'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{service.name}</h4>
                        {!service.is_active && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {service.duration_minutes} min
                        </span>
                        <span className="font-serif font-semibold text-primary">
                          Rs {service.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => handleToggle(service.id, service.is_active)}
                        disabled={togglingId === service.id}
                      />
                    </div>
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
