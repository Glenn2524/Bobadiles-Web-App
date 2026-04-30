import { NextRequest, NextResponse } from 'next/server'
import { analyzeCorrelations } from '@/lib/correlation-engine'
import { formatInsights } from '@/lib/insights-formatter'

export async function POST(request: NextRequest) {
  try {
    const { userId, daysBack = 14 } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Run correlation analysis
    const analysis = await analyzeCorrelations(userId, daysBack)

    // Check if enough data
    if (analysis.days_logged < 7) {
      return NextResponse.json({
        error: 'insufficient_data',
        message: `We need at least 7 days of tracking to find meaningful patterns. You're at ${analysis.days_logged} days — keep going!`,
        days_logged: analysis.days_logged
      }, { status: 400 })
    }

    // Format insights using templates (no AI)
    const insights = formatInsights(analysis, 'User')

    return NextResponse.json({
      insights,
      raw_analysis: analysis
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

// Made with Bob
