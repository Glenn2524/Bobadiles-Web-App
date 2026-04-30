'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

interface Pattern {
  finding: string
  evidence: string
  confidence: string
}

interface InsightsData {
  noticed_patterns: Pattern[]
  unclear_patterns: string[]
  eating_observations: string[]
  discuss_with_doctor: string[]
  data_quality_note: string
  disclaimer: string
}

interface InsightsResponse {
  insights: InsightsData
  raw_analysis?: any
}

interface ErrorResponse {
  error: string
  message: string
  days_logged?: number
}

export default function InsightsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorResponse | null>(null)
  const [expandedPatterns, setExpandedPatterns] = useState<Set<number>>(new Set())

  useEffect(() => {
    const id = localStorage.getItem('gutcheck_user_id')
    setUserId(id)
  }, [])

  const analyzeData = async () => {
    if (!userId) {
      setError({ error: 'no_user', message: 'Please complete onboarding first' })
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, daysBack: 14 })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data as ErrorResponse)
        setInsights(null)
      } else {
        setInsights((data as InsightsResponse).insights)
        setError(null)
      }
    } catch (err) {
      setError({ 
        error: 'network_error', 
        message: 'Failed to fetch insights. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePattern = (index: number) => {
    const newExpanded = new Set(expandedPatterns)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedPatterns(newExpanded)
  }

  const getConfidenceBadge = (confidence: string) => {
    const styles = {
      strong: 'bg-green-100 text-green-800 border-green-300',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      weak: 'bg-gray-100 text-gray-800 border-gray-300'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[confidence as keyof typeof styles] || styles.weak}`}>
        {confidence.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Your Insights
          </h1>
          <p className="text-gray-600">
            AI-powered pattern analysis from your gut health tracking
          </p>
        </div>

        {/* Analyze Button */}
        {!insights && !error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Ready to discover patterns in your gut health data?
                </p>
                <Button
                  onClick={analyzeData}
                  disabled={loading || !userId}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze My Data'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    {error.error === 'insufficient_data' ? 'Not Enough Data Yet' : 'Unable to Generate Insights'}
                  </h3>
                  <p className="text-amber-800 mb-3">{error.message}</p>
                  {error.days_logged !== undefined && (
                    <p className="text-sm text-amber-700">
                      Keep tracking! You're at {error.days_logged} days.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    onClick={analyzeData}
                    className="mt-3"
                    disabled={loading}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights Display */}
        {insights && (
          <>
            {/* Noticed Patterns */}
            {insights.noticed_patterns.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>🔍 Noticed Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.noticed_patterns.map((pattern, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900 flex-1">
                            {pattern.finding}
                          </p>
                          {getConfidenceBadge(pattern.confidence)}
                        </div>
                        
                        <button
                          onClick={() => togglePattern(index)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-2"
                        >
                          {expandedPatterns.has(index) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              How we computed this
                            </>
                          )}
                        </button>
                        
                        {expandedPatterns.has(index) && (
                          <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
                            <p className="font-medium mb-1">Evidence:</p>
                            <p>{pattern.evidence}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unclear Patterns */}
            {insights.unclear_patterns.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>🤔 Unclear Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    These patterns need more data to confirm:
                  </p>
                  <ul className="space-y-2">
                    {insights.unclear_patterns.map((pattern, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Eating Observations */}
            {insights.eating_observations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>🍽️ Eating Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.eating_observations.map((observation, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span>{observation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Discuss with Doctor */}
            {insights.discuss_with_doctor.length > 0 && (
              <Card className="mb-6 border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-900">👨‍⚕️ Discuss with Your Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-700 mb-3">
                    Consider bringing up these points at your next appointment:
                  </p>
                  <ul className="space-y-2">
                    {insights.discuss_with_doctor.map((point, index) => (
                      <li key={index} className="text-purple-900 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">→</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Data Quality Note */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Data Quality: </span>
                  {insights.data_quality_note}
                </p>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="mb-6 bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <p className="text-xs text-gray-600 italic">
                  ⚠️ {insights.disclaimer}
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={analyzeData}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh Analysis'
                )}
              </Button>
              <Button onClick={() => router.push('/')}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Made with Bob