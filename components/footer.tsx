import { Logo } from './logo'
import { Instagram, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-muted-foreground text-sm max-w-md">
              Experience luxury nail care in the comfort of a home-based salon. 
              Premium services with personalized attention in Quatre Bornes, Mauritius.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com/_ds_nailss"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Instagram className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#services" className="hover:text-foreground transition-colors">Services</Link></li>
              <li><Link href="/#gallery" className="hover:text-foreground transition-colors">Gallery</Link></li>
              <li><Link href="/#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link></li>
              <li><Link href="/auth/signup" className="hover:text-foreground transition-colors">Book Appointment</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>Gangamah Avenue, Quatre Bornes, Mauritius</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-primary" />
                <span>By Appointment Only</span>
              </li>
              <li>
                <span className="text-xs">DM on Instagram for appointments</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DS Nails. All rights reserved.</p>
          <p className="mt-1">Owner: @diiyaandoo</p>
        </div>
      </div>
    </footer>
  )
}
