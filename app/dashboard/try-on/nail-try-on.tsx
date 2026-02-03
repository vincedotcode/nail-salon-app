'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/image-uploader'
import { toast } from 'sonner'
import { Loader2, Sparkles, Download, Heart, Wand2 } from 'lucide-react'
import { generateNailDesign, saveDesign } from './actions'

const NAIL_TEMPLATES = [
  { id: 'french', name: 'Classic French', description: 'Timeless white tips with nude base' },
  { id: 'ombre', name: 'Ombre Gradient', description: 'Soft color transition effect' },
  { id: 'glitter', name: 'Glitter Glam', description: 'Sparkling glitter accents' },
  { id: 'floral', name: 'Floral Art', description: 'Delicate flower designs' },
  { id: 'geometric', name: 'Geometric', description: 'Modern geometric patterns' },
  { id: 'marble', name: 'Marble Effect', description: 'Elegant marble swirls' },
  { id: 'chrome', name: 'Chrome Mirror', description: 'Metallic mirror finish' },
  { id: 'minimal', name: 'Minimalist', description: 'Simple and elegant' },
]

export function NailTryOn({ userId }: { userId: number }) {
  const [handImage, setHandImage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleGenerate() {
    if (!handImage) {
      toast.error('Please upload a photo of your hand first')
      return
    }

    if (!selectedTemplate && !customPrompt) {
      toast.error('Please select a template or describe your design')
      return
    }

    setIsGenerating(true)
    setGeneratedImage('')

    try {
      const result = await generateNailDesign({
        handImageUrl: handImage,
        template: selectedTemplate,
        customPrompt: customPrompt,
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.imageUrl) {
        setGeneratedImage(result.imageUrl)
        toast.success('Design generated!')
      }
    } catch {
      toast.error('Failed to generate design')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleSave() {
    if (!generatedImage) return

    setIsSaving(true)
    try {
      const result = await saveDesign({
        userId,
        originalImage: handImage,
        generatedImage,
        templateName: selectedTemplate || 'Custom Design',
        notes: customPrompt,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Design saved!')
      }
    } catch {
      toast.error('Failed to save design')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Column - Upload and Options */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Step 1: Upload Your Hand
            </CardTitle>
            <CardDescription>
              Take a clear photo of your hand with good lighting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader
              onUpload={setHandImage}
              currentImage={handImage}
              className="w-full aspect-square max-w-xs mx-auto rounded-2xl"
              placeholder="Upload hand photo"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Step 2: Choose a Style</CardTitle>
            <CardDescription>
              Select a template or describe your dream design
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NAIL_TEMPLATES.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </motion.button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or describe</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom">Custom Design</Label>
              <Textarea
                id="custom"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe your dream nail design... e.g., 'Rose gold with tiny white flowers and crystal accents'"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !handImage}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Design
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Result */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="font-serif">Your Design</CardTitle>
          <CardDescription>
            See how the design looks on your hand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-square rounded-2xl bg-muted flex flex-col items-center justify-center gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-muted-foreground">AI is working its magic...</p>
              </motion.div>
            ) : generatedImage ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated nail design"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Save Design
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = generatedImage
                      link.download = 'nail-design.png'
                      link.click()
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center gap-3"
              >
                <Sparkles className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-center">
                  Your generated design<br />will appear here
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
