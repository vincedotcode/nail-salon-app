'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Camera } from 'lucide-react'

interface GalleryItem {
  id: number
  image_url: string
  title: string
  description: string
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
            index === 0 || index === 5 ? 'md:col-span-1 md:row-span-2 aspect-[3/4]' : 'aspect-square'
          }`}
        >
          {item.image_url ? (
            <Image
              src={item.image_url || "/placeholder.svg"}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <p className="font-serif text-foreground/70">{item.title}</p>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="font-serif text-xl font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-white/80 mt-1">{item.description}</p>
            </div>
          </div>
          
          {/* Corner accent */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
