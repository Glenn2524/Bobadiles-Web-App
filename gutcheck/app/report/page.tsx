'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [reportHtml, setReportHtml] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('gutcheck_user_id')
    setUserId(id)
    
    if (!id) {
      setError('No user ID found. Please complete onboarding first.')
    }
  }, [])

  const generateReport = async () => {
    if (!userId) {
      setError('No user ID found. Please complete onboarding first.')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, daysBack: 30 })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
      
      const data = await response.json()
      setReportHtml(data.html)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header - Hidden when printing */}
        <div className="mb-6 print:hidden">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Medical Report</CardTitle>
              <p className="text-sm text-gray-600">
                Generate a comprehensive report to share with your healthcare provider
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
                
                {!reportHtml && (
                  <Button
                    onClick={generateReport}
                    disabled={loading || !userId}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Generating Report...' : 'Generate Report'}
                  </Button>
                )}
                
                {reportHtml && (
                  <div className="flex gap-2">
                    <Button
                      onClick={generateReport}
                      disabled={loading}
                      variant="outline"
                      className="flex-1"
                    >
                      Regenerate Report
                    </Button>
                    <Button
                      onClick={handlePrint}
                      className="flex-1"
                    >
                      🖨️ Print Report
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Display */}
        {reportHtml && (
          <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
            <div 
              dangerouslySetInnerHTML={{ __html: reportHtml }}
              className="report-content"
            />
          </div>
        )}

        {/* Loading State */}
        {loading && !reportHtml && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing your data and generating report...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!reportHtml && !loading && !error && userId && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Ready to Generate Your Report</h3>
              <p className="text-gray-600">
                Click the button above to create a comprehensive medical report based on your last 14 days of data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .report-content {
            page-break-inside: avoid;
          }
          
          .report-content h1,
          .report-content h2,
          .report-content h3 {
            page-break-after: avoid;
          }
          
          .report-content table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}

// Made with Bob
