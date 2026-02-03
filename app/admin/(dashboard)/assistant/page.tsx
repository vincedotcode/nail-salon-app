import { getAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AIChatInterface } from './ai-chat-interface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, TrendingUp, Users, Calendar } from 'lucide-react'

export default async function AssistantPage() {
  const admin = await getAdmin()
  if (!admin) redirect('/admin/login')

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          AI Business Partner
        </h1>
        <p className="text-muted-foreground mt-1">
          Your intelligent assistant for business insights and analytics
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ask about</p>
                <p className="font-semibold">Revenue & Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/20 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-accent-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ask about</p>
                <p className="font-semibold">Client Insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ask about</p>
                <p className="font-semibold">Bookings & Trends</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Interface */}
      <Card className="min-h-[480px] sm:min-h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="font-serif">Chat with Your Business Partner</CardTitle>
          <CardDescription>
            Ask questions about your business, clients, bookings, revenue, and get smart recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <AIChatInterface />
        </CardContent>
      </Card>
    </div>
  )
}
