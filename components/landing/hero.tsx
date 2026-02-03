'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sparkles, Star, Instagram, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/50 to-accent/10" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-1/4 left-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="text-center lg:text-left"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Home-Based Luxury Nail Salon</span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]"
            >
              Where Beauty
              <span className="block mt-2 text-primary">
                Meets Artistry
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty leading-relaxed"
            >
              Experience personalized nail care in the intimate setting of our home-based salon. 
              Every appointment is a journey to beautiful, healthy nails crafted just for you.
            </motion.p>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center lg:justify-start gap-10 mt-10"
            >
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground mt-2 block">354 Followers</span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <span className="font-serif text-3xl font-bold text-foreground">111+</span>
                <span className="text-sm text-muted-foreground block">Happy Clients</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-12 justify-center lg:justify-start"
            >
              <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14 group" asChild>
                <Link href="/auth/signup">
                  Book Your Appointment
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base gap-2 h-14 bg-transparent border-2" asChild>
                <a href="https://instagram.com/_ds_nailss" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-5 h-5" />
                  Follow Us
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Image Grid */}
          <motion.div 
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5">
                <motion.div 
                  className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/hero-nails.jpg"
                    alt="Beautiful nail art"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-transparent" />
                  <div className="absolute bottom-5 left-5 text-white">
                    <p className="font-serif text-xl font-medium">Gel Nails</p>
                    <p className="text-sm text-white/80">Premium quality</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/gallery-1.jpg"
                    alt="Nail art designs"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-transparent" />
                  <div className="absolute bottom-5 left-5 text-white">
                    <p className="font-serif text-xl font-medium">Nail Art</p>
                    <p className="text-sm text-white/80">Custom designs</p>
                  </div>
                </motion.div>
              </div>
              <div className="space-y-5 pt-12">
                <motion.div 
                  className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/gallery-2.jpg"
                    alt="Manicure services"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-transparent" />
                  <div className="absolute bottom-5 left-5 text-white">
                    <p className="font-serif text-xl font-medium">Manicure</p>
                    <p className="text-sm text-white/80">Pamper yourself</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/gallery-3.jpg"
                    alt="Pedicure services"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-transparent" />
                  <div className="absolute bottom-5 left-5 text-white">
                    <p className="font-serif text-xl font-medium">Pedicure</p>
                    <p className="text-sm text-white/80">Complete care</p>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Decorative gradient orbs */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
