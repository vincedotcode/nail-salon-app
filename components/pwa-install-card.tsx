'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, CheckCircle, Share2 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isSafari, setIsSafari] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    const safari = /safari/.test(ua) && !/crios|fxios|chrome|android/.test(ua)
    setIsIOS(ios)
    setIsSafari(safari)

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleInstalled() {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <Card className="border-border/60 bg-card/90">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-semibold">Install DS Nails</h3>
            <p className="text-sm text-muted-foreground">
              Get quick access from your home screen for bookings, invoices, and updates.
            </p>
          </div>
          {isInstalled && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              Installed
            </span>
          )}
        </div>

        {!isInstalled && deferredPrompt && (
          <Button onClick={handleInstall} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
        )}

        {!isInstalled && isIOS && isSafari && !deferredPrompt && (
          <div className="rounded-lg border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Share2 className="w-4 h-4" />
              Install on iPhone / iPad
            </div>
            <p>1. Tap the Share button in Safari.</p>
            <p>2. Choose “Add to Home Screen”.</p>
            <p>3. Confirm to install the app.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
