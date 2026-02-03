import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { sql } from '@/lib/db'
import { DashboardHeader } from '../dashboard-header'
import { NailTryOn } from './nail-try-on'
import { SavedDesigns } from './saved-designs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Heart } from 'lucide-react'

async function getSavedDesigns(userId: number) {
  return await sql`
    SELECT * FROM nail_designs 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 20
  `
}

export default async function TryOnPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const savedDesigns = await getSavedDesigns(user.id)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Nail Try-On
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload a photo of your hand and see how different nail designs would look on you
          </p>
        </div>

        <Tabs defaultValue="try-on" className="space-y-6">
          <TabsList>
            <TabsTrigger value="try-on" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Try On Designs
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Heart className="w-4 h-4" />
              Saved Designs ({savedDesigns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="try-on">
            <NailTryOn userId={user.id} />
          </TabsContent>

          <TabsContent value="saved">
            <SavedDesigns designs={savedDesigns} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
