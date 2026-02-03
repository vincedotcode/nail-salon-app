'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageIcon, Plus, Trash2, Loader2, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { addGalleryItemAction, deleteGalleryItemAction } from '../actions'
import Image from 'next/image'
import { ImageUploader } from '@/components/image-uploader'

interface GalleryItem {
  id: number
  image_url: string
  title: string | null
  description: string | null
  is_featured: boolean
}

export function GalleryManager({ gallery }: { gallery: GalleryItem[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl) {
      toast.error('Please upload an image')
      return
    }
    
    setIsAdding(true)
    const formData = new FormData()
    formData.append('imageUrl', imageUrl)
    formData.append('title', title)
    formData.append('description', description)
    
    const result = await addGalleryItemAction(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Image added to gallery')
      setImageUrl('')
      setTitle('')
      setDescription('')
    }
    setIsAdding(false)
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    const result = await deleteGalleryItemAction(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Image deleted')
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-8">
      {/* Add New Image */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <Plus className="w-5 h-5 text-primary" />
            Add New Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label>Upload Image</Label>
              <ImageUploader 
                value={imageUrl}
                onChange={setImageUrl}
                onRemove={() => setImageUrl('')}
                aspectRatio="square"
              />
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input 
                  id="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., French Tips Design" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the design..."
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full h-12" disabled={isAdding || !imageUrl}>
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add to Gallery
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No images in gallery yet</p>
          <p className="text-sm mt-1">Add your first nail design to showcase your work</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {gallery.map(item => (
            <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary shadow-sm hover:shadow-lg transition-shadow">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.title || 'Gallery image'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {item.title && <h4 className="text-white font-medium">{item.title}</h4>}
                  {item.description && (
                    <p className="text-white/80 text-sm line-clamp-2 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9"
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
