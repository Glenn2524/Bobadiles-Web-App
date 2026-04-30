'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const symptomTypes = [
  { value: 'diarrhea', label: '💧 Diarrhea', color: 'bg-amber-100 hover:bg-amber-200' },
  { value: 'constipation', label: '🚫 Constipation', color: 'bg-stone-100 hover:bg-stone-200' },
  { value: 'severe_pain', label: '⚡ Severe Pain', color: 'bg-red-100 hover:bg-red-200' },
  { value: 'nausea', label: '🤢 Nausea', color: 'bg-green-100 hover:bg-green-200' },
  { value: 'vomiting', label: '🤮 Vomiting', color: 'bg-purple-100 hover:bg-purple-200' },
  { value: 'bloating_attack', label: '🎈 Bloating Attack', color: 'bg-blue-100 hover:bg-blue-200' },
  { value: 'other', label: '❓ Other', color: 'bg-gray-100 hover:bg-gray-200' }
]

export default function AcuteSymptomPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [symptomType, setSymptomType] = useState<string>('')
  const [severity, setSeverity] = useState(5)
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

    if (!symptomType) {
      alert('Please select a symptom type.')
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/acute-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          symptomType,
          severity,
          notes: notes || null,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to log symptom')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      console.error('Error logging symptom:', error)
      alert('Failed to log symptom. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Log Acute Symptom</h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-800 text-sm">
              <strong>Quick logging:</strong> Use this when you're experiencing a sudden symptom. 
              This helps track patterns and triggers.
            </p>
          </CardContent>
        </Card>

        {success && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-800 text-center font-medium">
                ✓ Symptom logged successfully! Redirecting...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Symptom Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>What are you experiencing?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {symptomTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={symptomType === type.value ? 'default' : 'outline'}
                  className={`h-16 text-lg justify-start ${
                    symptomType === type.value ? '' : type.color
                  }`}
                  onClick={() => setSymptomType(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Severity */}
        {symptomType && (
          <Card>
            <CardHeader>
              <CardTitle>How severe is it?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Severity Level</Label>
                  <span className="text-2xl font-bold">{severity}/10</span>
                </div>
                <Slider
                  value={[severity]}
                  onValueChange={(value) => setSeverity(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Visual severity indicator */}
              <div className="flex gap-1 justify-center">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded ${
                      i < severity
                        ? severity <= 3
                          ? 'bg-yellow-400'
                          : severity <= 6
                          ? 'bg-orange-400'
                          : 'bg-red-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {symptomType && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="What were you doing? What did you eat recently? Any other context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !userId || !symptomType}
          className="w-full h-12 text-lg"
        >
          {loading ? 'Logging...' : 'Log Symptom'}
        </Button>

        {!symptomType && (
          <p className="text-center text-sm text-gray-500">
            Select a symptom type to continue
          </p>
        )}
      </div>
    </div>
  )
}

// Made with Bob
