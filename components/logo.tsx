'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
          <span className="text-primary-foreground font-serif font-bold text-lg">DS</span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-background" />
      </motion.div>
      <div className="flex flex-col">
        <span className="font-serif text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">DS Nails</span>
        <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Premium Nail Care</span>
      </div>
    </Link>
  )
}

export function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <motion.div 
      className="rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <span 
        className="text-primary-foreground font-serif font-bold"
        style={{ fontSize: size * 0.4 }}
      >
        DS
      </span>
    </motion.div>
  )
}
