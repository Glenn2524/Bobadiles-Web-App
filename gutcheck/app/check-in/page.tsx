'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const bristolTypes = [
  { scale: 1, label: 'Hard pellets', color: 'bg-stone-700' },
  { scale: 2, label: 'Lumpy log', color: 'bg-stone-600' },
  { scale: 3, label: 'Cracked log', color: 'bg-stone-500' },
  { scale: 4, label: 'Smooth log', color: 'bg-stone-400' },
  { scale: 5, label: 'Soft blobs', color: 'bg-amber-400' },
  { scale: 6, label: 'Mushy', color: 'bg-amber-500' },
  { scale: 7, label: 'Liquid', color: 'bg-amber-600' }
]

export default function CheckInPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Wellness metrics
  const [wellbeing, setWellbeing] = useState(5)
  const [energy, setEnergy] = useState(5)
  const [stress, setStress] = useState(5)
  const [bloating, setBloating] = useState(0)
  const [pain, setPain] = useState(0)

  // Bristol scale
  const [bristolScale, setBristolScale] = useState<number | null>(null)

  // Optional fields
  const [unloggedSymptoms, setUnloggedSymptoms] = useState(false)
  const [unloggedSeverity, setUnloggedSeverity] = useState(5)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('gutcheck_user_id')
    setUserId(id)
  }, [])

  const handleSubmit = async () => {
    if (!userId) {
      alert('User ID not found. Please complete onboarding first.')
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      // Submit check-in
      const checkInResponse = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'evening',
          wellbeing,
          energy,
          stress,
          bloating,
          pain,
          unloggedSymptomsToday: unloggedSymptoms,
          unloggedSeverity: unloggedSymptoms ? unloggedSeverity : null,
          notes: notes || null
        })
      })

      if (!checkInResponse.ok) {
        throw new Error('Failed to submit check-in')
      }

      // Submit bowel movement if Bristol scale selected
      if (bristolScale !== null) {
        const bowelResponse = await fetch('/api/bowel-movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            bristolScale,
            notes: null
          })
        })

        if (!bowelResponse.ok) {
          console.error('Failed to submit bowel movement')
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Error submitting check-in:', error)
      alert('Failed to submit check-in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Daily Check-in</h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800 text-center font-medium">
                ✓ Check-in saved successfully! Redirecting...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Wellness Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Overall Wellbeing</Label>
                <span className="text-sm font-medium">{wellbeing}/10</span>
              </div>
              <Slider
                value={[wellbeing]}
                onValueChange={(value) => setWellbeing(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Energy Level</Label>
                <span className="text-sm font-medium">{energy}/10</span>
              </div>
              <Slider
                value={[energy]}
                onValueChange={(value) => setEnergy(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Exhausted</span>
                <span>Energized</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Stress Level</Label>
                <span className="text-sm font-medium">{stress}/10</span>
              </div>
              <Slider
                value={[stress]}
                onValueChange={(value) => setStress(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Calm</span>
                <span>Very Stressed</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Bloating</Label>
                <span className="text-sm font-medium">{bloating}/10</span>
              </div>
              <Slider
                value={[bloating]}
                onValueChange={(value) => setBloating(value[0])}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Pain</Label>
                <span className="text-sm font-medium">{pain}/10</span>
              </div>
              <Slider
                value={[pain]}
                onValueChange={(value) => setPain(value[0])}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bristol Stool Scale */}
        <Card>
          <CardHeader>
            <CardTitle>Bowel Movement Today? (Optional)</CardTitle>
            <p className="text-sm text-gray-600">Select the Bristol Stool Scale type</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {bristolTypes.map((type) => (
                <Button
                  key={type.scale}
                  variant={bristolScale === type.scale ? 'default' : 'outline'}
                  className="justify-start h-auto py-3"
                  onClick={() => setBristolScale(type.scale)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-8 h-8 rounded ${type.color}`} />
                    <div className="text-left">
                      <div className="font-medium">Type {type.scale}</div>
                      <div className="text-sm opacity-80">{type.label}</div>
                    </div>
                  </div>
                </Button>
              ))}
              {bristolScale !== null && (
                <Button
                  variant="ghost"
                  onClick={() => setBristolScale(null)}
                  className="text-sm"
                >
                  Clear selection
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unlogged Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>Any unlogged symptoms today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="unlogged"
                checked={unloggedSymptoms}
                onChange={(e) => setUnloggedSymptoms(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="unlogged">
                Yes, I had symptoms I didn't log in real-time
              </Label>
            </div>

            {unloggedSymptoms && (
              <div className="space-y-2 pl-6">
                <div className="flex justify-between">
                  <Label>How severe were they?</Label>
                  <span className="text-sm font-medium">{unloggedSeverity}/10</span>
                </div>
                <Slider
                  value={[unloggedSeverity]}
                  onValueChange={(value) => setUnloggedSeverity(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Any other observations about your day..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !userId}
          className="w-full h-12 text-lg"
        >
          {loading ? 'Saving...' : 'Complete Check-in'}
        </Button>
      </div>
    </div>
  )
}

// Made with Bob
