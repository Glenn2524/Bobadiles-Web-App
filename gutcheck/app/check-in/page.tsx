'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const bristolTypes = [
  { scale: 1, label: 'Hard pellets', emoji: '🔴', description: 'Separate hard lumps, like nuts (hard to pass)' },
  { scale: 2, label: 'Lumpy log', emoji: '🟤', description: 'Sausage-shaped but lumpy' },
  { scale: 3, label: 'Cracked log', emoji: '🌰', description: 'Like a sausage but with cracks on surface' },
  { scale: 4, label: 'Smooth log', emoji: '🥖', description: 'Like a sausage or snake, smooth and soft (ideal)' },
  { scale: 5, label: 'Soft blobs', emoji: '🟡', description: 'Soft blobs with clear-cut edges' },
  { scale: 6, label: 'Mushy', emoji: '🟠', description: 'Fluffy pieces with ragged edges, mushy' },
  { scale: 7, label: 'Liquid', emoji: '💧', description: 'Watery, no solid pieces, entirely liquid' }
]

// Helper function to get slider color based on value
// For positive metrics (wellbeing, energy): red -> green
const getSliderColor = (value: number, max: number = 10) => {
  const percentage = (value / max) * 100
  if (percentage <= 25) return 'bg-red-500'
  if (percentage <= 50) return 'bg-orange-500'
  if (percentage <= 75) return 'bg-yellow-500'
  return 'bg-green-500'
}

// For negative metrics (stress, pain, bloating, constipation): green -> red
const getInverseSliderColor = (value: number, max: number = 10) => {
  const percentage = (value / max) * 100
  if (percentage <= 25) return 'bg-green-500'
  if (percentage <= 50) return 'bg-yellow-500'
  if (percentage <= 75) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function CheckInPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Wellness metrics
  const [wellbeing, setWellbeing] = useState(5)
  const [energy, setEnergy] = useState(5)
  const [stress, setStress] = useState(5)
  const [constipation, setConstipation] = useState(0)
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
          constipation,
          bloating,
          pain,
          unloggedSymptomsToday: unloggedSymptoms,
          unloggedSeverity: unloggedSymptoms ? unloggedSeverity : null,
          notes: notes || null
        })
      })

      if (!checkInResponse.ok) {
        const errorData = await checkInResponse.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to submit check-in')
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
    } catch (error: any) {
      console.error('Error submitting check-in:', error)
      const errorMessage = error.message || 'Failed to submit check-in. Please try again.'
      alert(`Error: ${errorMessage}`)
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
              <div className="flex justify-between items-center">
                <Label>Overall Wellbeing</Label>
                <span className={`text-sm font-bold px-2 py-1 rounded ${getSliderColor(wellbeing)} text-white`}>
                  {wellbeing}/10
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 h-2 rounded-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 to-green-500 opacity-30" />
                <Slider
                  value={[wellbeing]}
                  onValueChange={(value) => setWellbeing(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="relative"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>😢 Poor</span>
                <span>😊 Excellent</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Energy Level</Label>
                <span className={`text-sm font-bold px-2 py-1 rounded ${getSliderColor(energy)} text-white`}>
                  {energy}/10
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 h-2 rounded-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 to-green-500 opacity-30" />
                <Slider
                  value={[energy]}
                  onValueChange={(value) => setEnergy(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="relative"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>😴 Exhausted</span>
                <span>⚡ Energized</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Stress Level</Label>
                <span className={`text-sm font-bold px-2 py-1 rounded ${getInverseSliderColor(stress)} text-white`}>
                  {stress}/10
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-30" />
                <Slider
                  value={[stress]}
                  onValueChange={(value) => setStress(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="relative"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>😌 Calm</span>
                <span>😰 Very Stressed</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Constipation</Label>
                <span className={`text-sm font-bold px-2 py-1 rounded ${getInverseSliderColor(constipation)} text-white`}>
                  {constipation}/10
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-30" />
                <Slider
                  value={[constipation]}
                  onValueChange={(value) => setConstipation(value[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="relative"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>None</span>
                <span>🚫 Severe</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Bloating</Label>
                <span className={`text-sm font-bold px-2 py-1 rounded ${getInverseSliderColor(bloating)} text-white`}>
                  {bloating}/10
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-30" />
                <Slider
                  value={[bloating]}
                  onValueChange={(value) => setBloating(value[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="relative"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>None</span>
                <span>🎈 Severe</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Pain</Label>
                <span className={`text-sm font-bold px-2 py-1 rounded ${getInverseSliderColor(pain)} text-white`}>
                  {pain}/10
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-30" />
                <Slider
                  value={[pain]}
                  onValueChange={(value) => setPain(value[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="relative"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>None</span>
                <span>⚡ Severe</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bristol Stool Scale */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Bowel Movement Today? (Optional)</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs font-bold">
                      i
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Bristol Stool Scale</p>
                    <p className="text-xs">
                      A medical tool to classify stool consistency. Types 3-4 are considered ideal.
                      This helps track digestive health patterns.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-gray-600">Select the type that matches your bowel movement</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {bristolTypes.map((type) => (
                <Button
                  key={type.scale}
                  variant={bristolScale === type.scale ? 'default' : 'outline'}
                  className="justify-start h-auto py-4"
                  onClick={() => setBristolScale(type.scale)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-3xl">{type.emoji}</div>
                    <div className="text-left flex-1">
                      <div className="font-medium">Type {type.scale}: {type.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{type.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
              {bristolScale !== null && (
                <Button
                  variant="ghost"
                  onClick={() => setBristolScale(null)}
                  className="text-sm mt-2"
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
