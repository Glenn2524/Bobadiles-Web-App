import { NextRequest, NextResponse } from 'next/server'
import { analyzeCorrelations } from '@/lib/correlation-engine'
import { generateDoctorReport } from '@/lib/report-formatter'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, daysBack = 14 } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Run correlation analysis
    const analysis = await analyzeCorrelations(userId, daysBack)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const startDateStr = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const endDateStr = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Generate report HTML using templates (no AI)
    const reportHtml = generateDoctorReport(
      analysis,
      user.name,
      startDateStr,
      endDateStr
    )

    return NextResponse.json({
      html: reportHtml,
      analysis
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

// Made with Bob
