'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteDesign } from './actions'

interface Design {
  id: number
  image_url: string
  generated_image_url: string
  template_name: string
  notes: string | null
  created_at: string
}

export function SavedDesigns({ designs }: { designs: Design[] }) {
  async function handleDelete(id: number) {
    const result = await deleteDesign(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Design deleted')
    }
  }

  if (designs.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground mb-4">No saved designs yet</p>
          <p className="text-sm text-muted-foreground">
            Generate some designs and save your favorites!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {designs.map((design, index) => (
        <motion.div
          key={design.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="group overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={design.generated_image_url || design.image_url}
                alt={design.template_name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard?design=${design.id}`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      Book
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(design.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm truncate">{design.template_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(design.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
