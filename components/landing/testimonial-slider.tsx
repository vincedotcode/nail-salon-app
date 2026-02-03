'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface Testimonial {
  id: number
  customer_name: string
  content: string
  image_url: string | null
  rating: number
}

export function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [perView, setPerView] = useState(3)

  const getItemsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 768) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }, [])

  useEffect(() => {
    const handleResize = () => setPerView(getItemsPerView())
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getItemsPerView])

  const maxIndex = Math.max(0, testimonials.length - perView)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= perView) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide, testimonials.length, perView])

  if (testimonials.length === 0) return null

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Navigation Buttons */}
      {testimonials.length > perView && (
        <>
          <motion.div 
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden md:block"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full h-12 w-12 bg-background/90 backdrop-blur-sm shadow-lg border-border/50 hover:bg-background hover:scale-105 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <motion.div 
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden md:block"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full h-12 w-12 bg-background/90 backdrop-blur-sm shadow-lg border-border/50 hover:bg-background hover:scale-105 transition-transform"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </>
      )}

      {/* Slider Container */}
      <div className="overflow-hidden px-1">
        <motion.div 
          className="flex"
          animate={{ x: `-${currentIndex * (100 / perView)}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / perView}%` }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300 h-full group hover:-translate-y-1">
                  <CardContent className="p-7 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-5">
                      <Quote className="w-10 h-10 text-primary/20 group-hover:text-primary/30 transition-colors" />
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-border'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 flex-grow leading-relaxed text-[15px]">
                      &quot;{testimonial.content}&quot;
                    </p>
                    
                    <div className="flex items-center gap-4 pt-5 border-t border-border/50">
                      {testimonial.image_url ? (
                        <Image
                          src={testimonial.image_url || "/placeholder.svg"}
                          alt={testimonial.customer_name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-border">
                          <span className="font-serif text-lg font-semibold text-primary">
                            {testimonial.customer_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-foreground block">{testimonial.customer_name}</span>
                        <span className="text-xs text-muted-foreground">Verified Client</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      {testimonials.length > perView && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'bg-primary w-8' 
                  : 'bg-primary/20 w-2 hover:bg-primary/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile Navigation */}
      {testimonials.length > perView && (
        <div className="flex justify-center gap-4 mt-6 md:hidden">
          <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-transparent">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-transparent">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
