import { NextRequest, NextResponse } from 'next/server'
import { analyzeMultiWindowCorrelations } from '@/lib/multi-window-correlation'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const daysBack = parseInt(searchParams.get('daysBack') || '30')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Perform multi-window correlation analysis
    const analysis = await analyzeMultiWindowCorrelations(userId, daysBack)

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('Failed to analyze intolerances:', error)
    return NextResponse.json(
      { error: 'Failed to analyze intolerances', details: error.message },
      { status: 500 }
    )
  }
}

// Made with Bob