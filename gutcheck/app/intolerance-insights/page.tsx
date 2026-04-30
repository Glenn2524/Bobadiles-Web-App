'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface IntoleranceInsight {
  trigger: string
  suspicionLevel: 'high' | 'moderate' | 'low'
  primaryWindow: string
  windowDescription: string
  evidenceStrength: string
  typicalOnset: string
  mechanism: string
  recommendations: string[]
  statistics: {
    totalExposures: number
    symptomEvents: number
    lift: number
    confidence: string
  }
}

interface WindowCorrelation {
  ingredient: string
  window: string
  windowDescription: string
  exposures: number
  symptomFollows: number
  conditionalRate: number
  lift: number
  confidence: string
}

interface AnalysisData {
  intoleranceInsights: IntoleranceInsight[]
  windowCorrelations: WindowCorrelation[]
  daysAnalyzed: number
  totalMeals: number
  symptomDays: number
  dataQuality: string
}

export default function IntoleranceInsightsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('gutcheck_user_id')
    setUserId(id)
    if (id) {
      fetchAnalysis(id)
    }
  }, [])

  const fetchAnalysis = async (uid: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/insights/intolerance?userId=${uid}&daysBack=30`)
      if (!response.ok) {
        throw new Error('Failed to fetch analysis')
      }
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSuspicionColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      default: return 'text-red-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800 text-center">
                {error || 'Failed to load analysis'}
              </p>
              <Button onClick={() => router.push('/')} className="mt-4 mx-auto block">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">🔬 Intolerance Insights</h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>

        {/* Data Quality Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{data.daysAnalyzed}</div>
                <div className="text-sm text-gray-600">Days Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{data.totalMeals}</div>
                <div className="text-sm text-gray-600">Meals Logged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{data.symptomDays}</div>
                <div className="text-sm text-gray-600">Symptom Days</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getDataQualityColor(data.dataQuality)}`}>
                  {data.dataQuality.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">Data Quality</div>
              </div>
            </div>
            {data.dataQuality === 'insufficient' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ More data needed for reliable insights. Keep logging meals and symptoms!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights">Intolerance Insights</TabsTrigger>
            <TabsTrigger value="correlations">Detailed Correlations</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            {data.intoleranceInsights.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">
                    No significant patterns detected yet. Keep logging your meals and symptoms!
                  </p>
                </CardContent>
              </Card>
            ) : (
              data.intoleranceInsights.map((insight, idx) => (
                <Card key={idx} className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{insight.trigger}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {insight.windowDescription} • {insight.typicalOnset} typical onset
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSuspicionColor(insight.suspicionLevel)}`}>
                        {insight.suspicionLevel.toUpperCase()} SUSPICION
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Mechanism</h4>
                      <p className="text-sm text-gray-600">{insight.mechanism}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{insight.statistics.totalExposures}</div>
                        <div className="text-xs text-gray-600">Exposures</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{insight.statistics.symptomEvents}</div>
                        <div className="text-xs text-gray-600">Symptoms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{insight.statistics.lift}x</div>
                        <div className="text-xs text-gray-600">Risk Increase</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        Evidence: {insight.evidenceStrength}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        Confidence: {insight.statistics.confidence}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="correlations" className="space-y-4">
            {data.windowCorrelations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">No correlations found</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Time-Window Correlations</CardTitle>
                  <p className="text-sm text-gray-600">
                    Showing how different foods correlate with symptoms across various time windows
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.windowCorrelations.map((corr, idx) => (
                      <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium">{corr.ingredient}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({corr.windowDescription})
                            </span>
                          </div>
                          <span className="text-sm font-bold text-purple-600">
                            {corr.lift.toFixed(2)}x lift
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>{corr.exposures} exposures</span>
                          <span>{corr.symptomFollows} with symptoms</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {corr.confidence}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Note:</strong> These insights are based on statistical correlations in your data. 
              Always consult with a healthcare provider before making significant dietary changes or 
              eliminating food groups.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Made with Bob