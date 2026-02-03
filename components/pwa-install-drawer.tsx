'use client'

import { useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Share2, Smartphone, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'dsnails_pwa_dismissed_v1'
const INSTALLED_KEY = 'dsnails_pwa_installed_v1'
const DISMISS_TTL_DAYS = 7

export function PwaInstallDrawer() {
  const [open, setOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showIOSSteps, setShowIOSSteps] = useState(false)
  const [showOtherSteps, setShowOtherSteps] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    const android = /android/.test(ua)

    setIsIOS(ios)
    setIsAndroid(android)

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    const installedFlag = localStorage.getItem(INSTALLED_KEY) === 'true'
    if (standalone || installedFlag) {
      setIsInstalled(true)
      return
    }

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000) {
      return
    }

    const timer = window.setTimeout(() => setOpen(true), 600)

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      if (!open) setOpen(true)
    }

    function handleInstalled() {
      setIsInstalled(true)
      setOpen(false)
      localStorage.setItem(INSTALLED_KEY, 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [open])

  function handleDismiss() {
    setOpen(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true')
      setOpen(false)
    }
  }

  if (isInstalled) return null

  return (
    <Drawer open={open} onOpenChange={(next) => (next ? setOpen(true) : handleDismiss())}>
      <DrawerContent className="border-t border-border/60">
        <DrawerHeader className="text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="font-serif text-lg">Install DS Nails</DrawerTitle>
              <DrawerDescription>
                Add the app to your home screen for one-tap bookings, invoices, and updates.
              </DrawerDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border border-primary/20">PWA</Badge>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4">
          {deferredPrompt && (
            <Button onClick={handleInstall} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Add to Home Screen
            </Button>
          )}

        {!deferredPrompt && isIOS && (
          <div className="space-y-3">
            <Button onClick={() => setShowIOSSteps(true)} className="w-full sm:w-auto">
              <Share2 className="w-4 h-4 mr-2" />
              Add to Home Screen
            </Button>
              {showIOSSteps && (
                <div className="rounded-lg border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    iPhone / iPad steps
                  </p>
                  <p>1. Tap the Share button in your browser.</p>
                  <p>2. Choose “Add to Home Screen”.</p>
                  <p>3. Confirm to install.</p>
                </div>
              )}
            </div>
          )}

          {!deferredPrompt && !isIOS && (
            <div className="space-y-3">
              <Button onClick={() => setShowOtherSteps(true)} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Add to Home Screen
              </Button>
              {showOtherSteps && (
                <div className="rounded-lg border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Install from your browser menu</p>
                  <p>
                    {isAndroid
                      ? 'Open Chrome menu → “Install app” or “Add to Home Screen”.'
                      : 'Look for “Install App” or “Add to Home Screen” in your browser menu.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="pt-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Not now
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
