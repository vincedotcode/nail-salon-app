'use client'

import { motion } from 'framer-motion'
import { Clock, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration_minutes: number
}

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group h-full hover:shadow-2xl transition-all duration-500 border-border/50 bg-card/80 backdrop-blur-sm hover:-translate-y-2 overflow-hidden relative">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">{service.name}</CardTitle>
          <CardDescription className="text-muted-foreground text-base leading-relaxed">
            {service.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center justify-between pt-5 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{service.duration_minutes} minutes</span>
            </div>
            <div className="font-serif text-2xl font-bold text-primary">
              Rs {service.price.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
