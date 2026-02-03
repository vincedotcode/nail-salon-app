'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUploader } from '@/components/image-uploader'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateProfile } from './actions'

interface User {
  id: number
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
}

export function ProfileForm({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    formData.set('avatarUrl', avatarUrl)
    
    try {
      const result = await updateProfile(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profile updated!')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-4 mb-6">
        <ImageUploader
          onUpload={(url) => setAvatarUrl(url)}
          currentImage={avatarUrl}
          className="w-32 h-32 rounded-full"
          placeholder="Upload avatar"
        />
        <p className="text-sm text-muted-foreground">Click to upload a profile picture</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.full_name}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone || ''}
            placeholder="+230 5XXX XXXX"
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  )
}
