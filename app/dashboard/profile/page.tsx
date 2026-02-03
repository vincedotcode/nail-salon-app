import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { sql } from '@/lib/db'
import { DashboardHeader } from '../dashboard-header'
import { ProfileForm } from './profile-form'
import { ChangePasswordForm } from './change-password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, History } from 'lucide-react'

async function getUserBookingStats(userId: number) {
  const stats = await sql`
    SELECT 
      COUNT(*) as total_bookings,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      SUM(CASE WHEN status = 'completed' THEN COALESCE(final_price, s.price) ELSE 0 END) as total_spent
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    WHERE b.user_id = ${userId}
  `
  return stats[0]
}

export default async function ProfilePage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const stats = await getUserBookingStats(user.id)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.total_bookings || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-primary font-semibold">Rs</span>
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {parseFloat(stats.total_spent || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-sm">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm user={user} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
