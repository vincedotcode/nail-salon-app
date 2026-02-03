'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plane, Plus, Trash2, Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { addVacationAction, deleteVacationAction } from '../actions'

interface Vacation {
  id: number
  start_date: string
  end_date: string
  reason: string | null
}

export function VacationsManager({ vacations }: { vacations: Vacation[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleAdd(formData: FormData) {
    setIsAdding(true)
    const result = await addVacationAction(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Vacation added')
    }
    setIsAdding(false)
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    const result = await deleteVacationAction(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Vacation deleted')
    }
    setDeletingId(null)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Add Vacation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Plus className="w-5 h-5 text-primary" />
            Add Vacation Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input id="reason" name="reason" placeholder="e.g., Family vacation, Personal time" />
            </div>
            <Button type="submit" className="w-full" disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plane className="w-4 h-4 mr-2" />
                  Add Vacation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Vacations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Calendar className="w-5 h-5 text-primary" />
            Scheduled Vacations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vacations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No vacations scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vacations.map(vacation => {
                const startDate = new Date(vacation.start_date)
                const endDate = new Date(vacation.end_date)
                const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

                return (
                  <div 
                    key={vacation.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-muted-foreground">to</span>
                        <span>{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vacation.reason || 'Time off'} ({days} day{days > 1 ? 's' : ''})
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(vacation.id)}
                      disabled={deletingId === vacation.id}
                    >
                      {deletingId === vacation.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
