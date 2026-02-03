'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MapPin, Instagram, MessageCircle, Calendar, ArrowRight, Phone } from 'lucide-react'

const contactItems = [
  {
    icon: MapPin,
    title: 'Location',
    content: 'Gangamah Avenue, Quatre Bornes, Mauritius',
    link: null
  },
  {
    icon: Instagram,
    title: 'Instagram',
    content: '@_ds_nailss',
    link: 'https://instagram.com/_ds_nailss'
  },
  {
    icon: MessageCircle,
    title: 'Quick Contact',
    content: 'DM on Instagram for appointments',
    link: null
  }
]

export function Contact() {
  return (
    <section id="contact" className="py-28 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Visit Us
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-balance mb-6">
              Ready for Beautiful Nails?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Our cozy home-based salon is located in Gangamah Avenue, Quatre Bornes, Mauritius. 
              Book your appointment today and experience personalized nail care like never before.
            </p>

            <div className="space-y-4 mb-10">
              {contactItems.map((item, index) => (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    {item.link ? (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">{item.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2 h-14 text-base group" asChild>
                <Link href="/auth/signup">
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 h-14 text-base bg-transparent border-2" asChild>
                <a href="https://instagram.com/_ds_nailss" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-5 h-5" />
                  Follow Us
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 overflow-hidden border border-border/50 backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <motion.div 
                    className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-8 border-4 border-white/50 shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-serif text-5xl font-bold text-primary">DS</span>
                  </motion.div>
                  <h3 className="font-serif text-3xl font-bold mb-3">DS Nails</h3>
                  <p className="text-muted-foreground text-lg">Premium Nail Care</p>
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-serif text-xl font-medium">Diya</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
