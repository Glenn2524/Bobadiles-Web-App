import { prisma } from './prisma'
import { getDateString } from './utils'

export interface Observation {
  text: string
  type: 'pattern' | 'milestone' | 'summary'
}

export async function generateObservations(userId: string): Promise<Observation[]> {
  const observations: Observation[] = []
  
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Fetch recent data
  const [recentMeals, recentCheckIns, allCheckIns, user] = await Promise.all([
    prisma.meal.findMany({
      where: { userId, timestamp: { gte: sevenDaysAgo } },
      orderBy: { timestamp: 'desc' }
    }),
    prisma.checkIn.findMany({
      where: { userId, timestamp: { gte: sevenDaysAgo } },
      orderBy: { timestamp: 'desc' }
    }),
    prisma.checkIn.findMany({
      where: { userId },
      orderBy: { timestamp: 'asc' }
    }),
    prisma.user.findUnique({ where: { id: userId } })
  ])

  // Observation 1: Most common irritant this week
  if (recentMeals.length > 0) {
    const irritantCounts = new Map<string, number>()
    recentMeals.forEach(meal => {
      const tags = JSON.parse(meal.irritantTags) as string[]
      tags.forEach(tag => {
        irritantCounts.set(tag, (irritantCounts.get(tag) || 0) + 1)
      })
    })

    if (irritantCounts.size > 0) {
      const mostCommon = Array.from(irritantCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]
      
      observations.push({
        text: `You've logged ${mostCommon[1]} meal${mostCommon[1] > 1 ? 's' : ''} containing ${mostCommon[0]} this week`,
        type: 'pattern'
      })
    }
  }

  // Observation 2: Average well-being this week
  if (recentCheckIns.length > 0) {
    const avgWellbeing = recentCheckIns.reduce((sum, c) => sum + c.wellbeing, 0) / recentCheckIns.length
    observations.push({
      text: `Your average well-being this week: ${avgWellbeing.toFixed(1)}/10`,
      type: 'summary'
    })
  }

  // Observation 3: Best day of week (if statistically meaningful)
  if (allCheckIns.length >= 14) {
    const dayScores = new Map<number, number[]>() // 0=Sunday, 1=Monday, etc.
    
    allCheckIns.forEach(checkIn => {
      const date = new Date(checkIn.timestamp)
      const dayOfWeek = date.getDay()
      if (!dayScores.has(dayOfWeek)) {
        dayScores.set(dayOfWeek, [])
      }
      dayScores.get(dayOfWeek)!.push(checkIn.wellbeing)
    })

    const dayAverages = Array.from(dayScores.entries())
      .map(([day, scores]) => ({
        day,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length
      }))
      .filter(d => d.count >= 2) // Need at least 2 data points

    if (dayAverages.length > 0) {
      const bestDay = dayAverages.sort((a, b) => b.avg - a.avg)[0]
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      
      observations.push({
        text: `${dayNames[bestDay.day]} tends to be your best day so far`,
        type: 'pattern'
      })
    }
  }

  // Observation 4: Tracking streak milestones
  if (allCheckIns.length > 0) {
    const uniqueDays = new Set(allCheckIns.map(c => getDateString(new Date(c.timestamp))))
    const daysTracked = uniqueDays.size
    
    const milestones = [3, 7, 14, 21, 30]
    const reachedMilestone = milestones.find(m => daysTracked === m)
    
    if (reachedMilestone) {
      observations.push({
        text: `You've consistently logged for ${reachedMilestone} days`,
        type: 'milestone'
      })
    }
  }

  // Limit to 3 observations max
  return observations.slice(0, 3)
}

export async function getTrackingProgress(userId: string): Promise<{
  daysTracked: number
  daysUntilInsights: number
  insightsAvailable: boolean
}> {
  const checkIns = await prisma.checkIn.findMany({
    where: { userId },
    select: { timestamp: true }
  })

  const uniqueDays = new Set(checkIns.map(c => getDateString(new Date(c.timestamp))))
  const daysTracked = uniqueDays.size
  const insightsAvailable = daysTracked >= 7
  const daysUntilInsights = Math.max(0, 7 - daysTracked)

  return {
    daysTracked,
    daysUntilInsights,
    insightsAvailable
  }
}

// Made with Bob
