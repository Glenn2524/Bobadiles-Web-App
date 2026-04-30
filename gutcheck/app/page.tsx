'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Utensils, 
  ClipboardList, 
  TrendingUp, 
  FileText, 
  AlertCircle,
  Calendar
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [observations, setObservations] = useState<any[]>([])

  useEffect(() => {
    // Check if user exists in localStorage
    const storedName = localStorage.getItem('gutcheck_user_name')
    const storedUserId = localStorage.getItem('gutcheck_user_id')
    
    if (storedName && storedUserId) {
      setUserName(storedName)
      loadDashboardData(storedUserId)
    } else {
      setLoading(false)
    }
  }, [])

  const loadDashboardData = async (userId: string) => {
    try {
      const [userRes, progressRes, observationsRes] = await Promise.all([
        fetch(`/api/user/${userId}`),
        fetch(`/api/user/${userId}/progress`),
        fetch(`/api/user/${userId}/observations`)
      ])

      if (userRes.ok) setUser(await userRes.json())
      if (progressRes.ok) setProgress(await progressRes.json())
      if (observationsRes.ok) setObservations(await observationsRes.json())
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOnboarding = async () => {
    if (!nameInput.trim()) {
      alert('Please enter your name')
      return
    }

    console.log('Starting onboarding with name:', nameInput.trim())

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() })
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const newUser = await response.json()
        console.log('New user created:', newUser)
        localStorage.setItem('gutcheck_user_name', newUser.name)
        localStorage.setItem('gutcheck_user_id', newUser.id)
        setUserName(newUser.name)
        setUser(newUser)
        loadDashboardData(newUser.id)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Failed to create user: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user. Please check the console for details.')
    }
  }

  // Onboarding screen
  if (!userName && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Welcome to GutCheck</CardTitle>
            <CardDescription className="text-base">
              Your digestive health companion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              GutCheck helps you understand patterns between what you eat and how you feel. 
              We'll never tell you what to do — we'll help you and your doctor see the bigger picture.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="name">What should we call you?</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOnboarding()}
              />
            </div>

            <Button 
              onClick={handleOnboarding} 
              className="w-full"
              disabled={!nameInput.trim()}
            >
              Get Started
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              GutCheck is not a medical device and does not provide medical advice.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const userId = localStorage.getItem('gutcheck_user_id')
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })

  const daysUntilAppointment = user?.nextAppointment 
    ? Math.ceil((new Date(user.nextAppointment).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium">Hi {userName}</h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          
          {/* Acute Symptom Button - Always visible */}
          <Button 
            variant="default"
            className="bg-accent hover:bg-accent/90"
            onClick={() => router.push('/acute-symptom')}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Acute Symptom
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Progress Strip */}
        {progress && (
          <Card>
            <CardContent className="pt-6">
              {progress.insightsAvailable ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Tracking for {progress.daysTracked} days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Insights confidence: {progress.daysTracked >= 14 ? 'High' : 'Moderate'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">
                    We've been tracking together for {progress.daysTracked} days. 
                    {progress.daysUntilInsights > 0 && (
                      <span className="font-medium"> {progress.daysUntilInsights} more days until trigger insights become available.</span>
                    )}
                  </p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(progress.daysTracked / 7) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {daysUntilAppointment !== null && daysUntilAppointment > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {daysUntilAppointment} days until your appointment with your doctor
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/meal')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Log a Meal</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/check-in')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Daily Check-in</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-shadow ${
              progress?.insightsAvailable 
                ? 'hover:shadow-md' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => progress?.insightsAvailable && router.push('/insights')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Insights</CardTitle>
                  {!progress?.insightsAvailable && (
                    <CardDescription className="text-xs mt-1">
                      Available after 7 days of tracking
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/report')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">My Report</CardTitle>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Observation Cards */}
        {observations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Recent Observations</h2>
            {observations.map((obs, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <p className="text-sm">{obs.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Disclaimer Footer */}
        <div className="pt-8 pb-4">
          <p className="text-xs text-muted-foreground text-center">
            GutCheck is not a medical device and does not provide medical advice. 
            Always consult a healthcare professional.
          </p>
        </div>
      </main>
    </div>
  )
}

// Made with Bob
