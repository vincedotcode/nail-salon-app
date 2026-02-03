'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, Plus, Trash2, Loader2, Star, Quote } from 'lucide-react'
import { toast } from 'sonner'
import { addTestimonialAction, deleteTestimonialAction } from '../actions'
import Image from 'next/image'
import { ImageUploader } from '@/components/image-uploader'

interface Testimonial {
  id: number
  customer_name: string
  content: string
  image_url: string | null
  rating: number
  is_approved: boolean
}

export function TestimonialsManager({ testimonials }: { testimonials: Testimonial[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [rating, setRating] = useState('5')
  const [content, setContent] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName || !content) {
      toast.error('Please fill in required fields')
      return
    }
    
    setIsAdding(true)
    const formData = new FormData()
    formData.append('customerName', customerName)
    formData.append('rating', rating)
    formData.append('content', content)
    if (imageUrl) formData.append('imageUrl', imageUrl)
    
    const result = await addTestimonialAction(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Testimonial added')
      setCustomerName('')
      setContent('')
      setImageUrl('')
      setRating('5')
    }
    setIsAdding(false)
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    const result = await deleteTestimonialAction(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Testimonial deleted')
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-8">
      {/* Add New Testimonial */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <Plus className="w-5 h-5 text-primary" />
            Add New Testimonial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Label>Customer Photo (optional)</Label>
              <ImageUploader 
                value={imageUrl}
                onChange={setImageUrl}
                onRemove={() => setImageUrl('')}
                aspectRatio="square"
              />
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input 
                  id="customerName" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Priya M." 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        <span className="flex items-center gap-2">
                          {num} Star{num > 1 ? 's' : ''}
                          <span className="flex">
                            {Array.from({ length: num }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="content">Review *</Label>
                <Textarea 
                  id="content" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What did they say about their experience?"
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12" disabled={isAdding}>
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Testimonial
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Quote className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No testimonials yet</p>
          <p className="text-sm mt-1">Add customer reviews to build trust with potential clients</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map(testimonial => (
            <Card key={testimonial.id} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {testimonial.image_url ? (
                      <Image
                        src={testimonial.image_url || "/placeholder.svg"}
                        alt={testimonial.customer_name}
                        width={56}
                        height={56}
                        className="rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-border">
                        <span className="font-serif text-xl font-semibold text-primary">
                          {testimonial.customer_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">{testimonial.customer_name}</h4>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-border'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={deletingId === testimonial.id}
                  >
                    {deletingId === testimonial.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-muted-foreground leading-relaxed">&quot;{testimonial.content}&quot;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
