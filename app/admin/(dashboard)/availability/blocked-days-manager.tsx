'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Calendar, Clock, Trash2, Plus, Palmtree } from 'lucide-react'
import { toast } from 'sonner'
import { addVacationAction, deleteVacationAction, updateWorkingHoursAction } from '../actions'

interface WorkingHours {
  id: number
  day_of_week: number
  day_name: string
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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function BlockedDaysManager({ workingHours, vacations }: { workingHours: WorkingHours[], vacations: Vacation[] }) {
  const [loading, setLoading] = useState(false)
  const [newVacation, setNewVacation] = useState({ startDate: '', endDate: '', reason: '' })

  async function handleWorkingHoursToggle(dayOfWeek: number, currentHours: WorkingHours) {
    setLoading(true)
    const result = await updateWorkingHoursAction(
      dayOfWeek, 
      currentHours.start_time, 
      currentHours.end_time, 
      !currentHours.is_active
    )
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`${DAY_NAMES[dayOfWeek]} ${!currentHours.is_active ? 'enabled' : 'disabled'}`)
    }
    setLoading(false)
  }

  async function handleWorkingHoursUpdate(dayOfWeek: number, startTime: string, endTime: string, isActive: boolean) {
    setLoading(true)
    const result = await updateWorkingHoursAction(dayOfWeek, startTime, endTime, isActive)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Working hours updated')
    }
    setLoading(false)
  }

  async function handleAddVacation(e: React.FormEvent) {
    e.preventDefault()
    if (!newVacation.startDate || !newVacation.endDate) {
      toast.error('Please select start and end dates')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.set('startDate', newVacation.startDate)
    formData.set('endDate', newVacation.endDate)
    formData.set('reason', newVacation.reason)

    const result = await addVacationAction(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Days off added')
      setNewVacation({ startDate: '', endDate: '', reason: '' })
    }
    setLoading(false)
  }

  async function handleDeleteVacation(id: number) {
    setLoading(true)
    const result = await deleteVacationAction(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Days off removed')
    }
    setLoading(false)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Clock className="w-5 h-5 text-primary" />
            Working Hours
          </CardTitle>
          <CardDescription>Set your regular working days and hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workingHours.map((wh) => (
            <div key={wh.day_of_week} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
              <Switch
                checked={wh.is_active}
                onCheckedChange={() => handleWorkingHoursToggle(wh.day_of_week, wh)}
                disabled={loading}
              />
              <span className={`font-medium w-24 ${!wh.is_active ? 'text-muted-foreground' : ''}`}>
                {DAY_NAMES[wh.day_of_week]}
              </span>
              {wh.is_active && (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={wh.start_time?.slice(0, 5)}
                    onChange={(e) => handleWorkingHoursUpdate(wh.day_of_week, e.target.value, wh.end_time, wh.is_active)}
                    className="w-28"
                    disabled={loading}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={wh.end_time?.slice(0, 5)}
                    onChange={(e) => handleWorkingHoursUpdate(wh.day_of_week, wh.start_time, e.target.value, wh.is_active)}
                    className="w-28"
                    disabled={loading}
                  />
                </div>
              )}
              {!wh.is_active && (
                <span className="text-muted-foreground text-sm">Day off</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vacations / Days Off */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Palmtree className="w-5 h-5 text-primary" />
            Days Off & Vacations
          </CardTitle>
          <CardDescription>Block specific dates when you&apos;re not available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New */}
          <form onSubmit={handleAddVacation} className="space-y-4 p-4 rounded-lg border border-dashed border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newVacation.startDate}
                  onChange={(e) => setNewVacation({ ...newVacation, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newVacation.endDate}
                  onChange={(e) => setNewVacation({ ...newVacation, endDate: e.target.value })}
                  min={newVacation.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                placeholder="e.g., Holiday, Personal day"
                value={newVacation.reason}
                onChange={(e) => setNewVacation({ ...newVacation, reason: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Days Off
            </Button>
          </form>

          {/* List */}
          <div className="space-y-3">
            {vacations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming days off scheduled</p>
            ) : (
              vacations.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">
                        {new Date(v.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {v.start_date !== v.end_date && (
                          <> - {new Date(v.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                        )}
                      </p>
                      {v.reason && <p className="text-sm text-muted-foreground">{v.reason}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteVacation(v.id)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
