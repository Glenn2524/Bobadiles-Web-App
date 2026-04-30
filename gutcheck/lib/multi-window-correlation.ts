import { prisma } from './prisma'
import { getDateString } from './utils'
import { TIME_WINDOWS, TimeWindow, hoursBetween, isInWindow, TRIGGER_KNOWLEDGE } from './trigger-timing'

export interface WindowCorrelation {
  ingredient: string
  window: string
  windowDescription: string
  exposures: number
  symptomFollows: number
  controlExposures: number
  controlSymptoms: number
  conditionalRate: number
  baselineRate: number
  lift: number
  confidence: 'strong' | 'moderate' | 'weak' | 'insufficient_data'
  pValue?: number
}

export interface IntoleranceInsight {
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

export interface MultiWindowAnalysis {
  windowCorrelations: WindowCorrelation[]
  intoleranceInsights: IntoleranceInsight[]
  daysAnalyzed: number
  totalMeals: number
  symptomDays: number
  dataQuality: 'excellent' | 'good' | 'fair' | 'insufficient'
}

/**
 * Analyze correlations across multiple time windows
 */
export async function analyzeMultiWindowCorrelations(
  userId: string,
  daysBack: number = 30
): Promise<MultiWindowAnalysis> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  // Fetch all data
  const [meals, checkIns, acuteSymptoms] = await Promise.all([
    prisma.meal.findMany({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    }),
    prisma.checkIn.findMany({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    }),
    prisma.acuteSymptom.findMany({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    })
  ])

  // Build symptom events with precise timing
  const symptomEvents = buildPreciseSymptomEvents(checkIns, acuteSymptoms)
  
  // Calculate data quality
  const daysWithData = new Set<string>()
  meals.forEach(m => daysWithData.add(getDateString(new Date(m.timestamp))))
  checkIns.forEach(c => daysWithData.add(getDateString(new Date(c.timestamp))))
  
  const daysAnalyzed = daysWithData.size
  const dataQuality = assessDataQuality(meals.length, checkIns.length, daysAnalyzed)

  // Analyze each ingredient/tag across all time windows
  const windowCorrelations = analyzeAllWindows(meals, symptomEvents)

  // Generate intolerance insights
  const intoleranceInsights = generateIntoleranceInsights(windowCorrelations)

  return {
    windowCorrelations: windowCorrelations.slice(0, 20), // Top 20
    intoleranceInsights,
    daysAnalyzed,
    totalMeals: meals.length,
    symptomDays: new Set(symptomEvents.map(e => getDateString(e.timestamp))).size,
    dataQuality
  }
}

interface SymptomEvent {
  timestamp: Date
  severity: number
  source: string
}

function buildPreciseSymptomEvents(
  checkIns: any[],
  acuteSymptoms: any[]
): SymptomEvent[] {
  const events: SymptomEvent[] = []

  // Process check-ins
  checkIns.forEach(checkIn => {
    const isSymptomDay = 
      checkIn.bloating >= 6 || 
      checkIn.pain >= 6 || 
      checkIn.wellbeing <= 4

    if (isSymptomDay) {
      const severity = Math.max(checkIn.bloating, checkIn.pain, 10 - checkIn.wellbeing)
      
      // Use symptomOnsetTime if available, otherwise use check-in time
      let timestamp = new Date(checkIn.timestamp)
      if (checkIn.symptomOnsetTime) {
        const onsetDate = new Date(checkIn.timestamp)
        const [hours, minutes] = checkIn.symptomOnsetTime.toString().split(':')
        onsetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        timestamp = onsetDate
      }

      events.push({
        timestamp,
        severity,
        source: 'check-in'
      })
    }

    // Unlogged symptoms
    if (checkIn.unloggedSymptomsToday && checkIn.unloggedSeverity >= 6) {
      let timestamp = new Date(checkIn.timestamp)
      if (checkIn.symptomOnsetTime) {
        const onsetDate = new Date(checkIn.timestamp)
        const [hours, minutes] = checkIn.symptomOnsetTime.toString().split(':')
        onsetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        timestamp = onsetDate
      }

      events.push({
        timestamp,
        severity: checkIn.unloggedSeverity,
        source: 'unlogged'
      })
    }
  })

  // Process acute symptoms
  acuteSymptoms.forEach(symptom => {
    if (symptom.severity >= 5) {
      events.push({
        timestamp: new Date(symptom.timestamp),
        severity: symptom.severity,
        source: 'acute'
      })
    }
  })

  return events
}

function analyzeAllWindows(
  meals: any[],
  symptomEvents: SymptomEvent[]
): WindowCorrelation[] {
  const correlations: WindowCorrelation[] = []
  
  // Track exposures per ingredient per window
  const exposureMap = new Map<string, Map<string, {
    symptomExposures: number
    totalExposures: number
    controlExposures: number
    controlSymptoms: number
  }>>()

  // For each meal, check all time windows
  meals.forEach(meal => {
    const mealTime = new Date(meal.timestamp)
    const ingredients = JSON.parse(meal.ingredients) as string[]
    const irritants = JSON.parse(meal.irritantTags) as string[]
    const allTriggers = [...ingredients, ...irritants]

    allTriggers.forEach(trigger => {
      if (!exposureMap.has(trigger)) {
        exposureMap.set(trigger, new Map())
      }
      const triggerMap = exposureMap.get(trigger)!

      TIME_WINDOWS.forEach(window => {
        if (!triggerMap.has(window.name)) {
          triggerMap.set(window.name, {
            symptomExposures: 0,
            totalExposures: 0,
            controlExposures: 0,
            controlSymptoms: 0
          })
        }
        const stats = triggerMap.get(window.name)!
        stats.totalExposures++

        // Check if any symptom occurred in this window after the meal
        const symptomInWindow = symptomEvents.some(event => 
          isInWindow(mealTime, event.timestamp, window)
        )

        if (symptomInWindow) {
          stats.symptomExposures++
        } else {
          stats.controlExposures++
        }
      })
    })
  })

  // Calculate correlations
  exposureMap.forEach((windowMap, trigger) => {
    windowMap.forEach((stats, windowName) => {
      const window = TIME_WINDOWS.find(w => w.name === windowName)!
      
      if (stats.totalExposures < 3) return // Need minimum data

      const conditionalRate = stats.symptomExposures / stats.totalExposures
      const baselineRate = symptomEvents.length / meals.length
      const lift = baselineRate > 0 ? conditionalRate / baselineRate : 0

      // Determine confidence based on window-specific thresholds
      let confidence: WindowCorrelation['confidence'] = 'insufficient_data'
      if (lift >= 2.0 && stats.totalExposures >= 5) {
        confidence = 'strong'
      } else if (lift >= 1.5 && stats.totalExposures >= 4) {
        confidence = 'moderate'
      } else if (lift >= 1.2 && stats.totalExposures >= 3) {
        confidence = 'weak'
      }

      correlations.push({
        ingredient: trigger,
        window: windowName,
        windowDescription: window.description,
        exposures: stats.totalExposures,
        symptomFollows: stats.symptomExposures,
        controlExposures: stats.controlExposures,
        controlSymptoms: stats.controlSymptoms,
        conditionalRate,
        baselineRate,
        lift,
        confidence
      })
    })
  })

  // Sort by lift descending
  return correlations.sort((a, b) => b.lift - a.lift)
}

function generateIntoleranceInsights(
  correlations: WindowCorrelation[]
): IntoleranceInsight[] {
  const insights: IntoleranceInsight[] = []
  
  // Group correlations by ingredient
  const byIngredient = new Map<string, WindowCorrelation[]>()
  correlations.forEach(corr => {
    if (!byIngredient.has(corr.ingredient)) {
      byIngredient.set(corr.ingredient, [])
    }
    byIngredient.get(corr.ingredient)!.push(corr)
  })

  byIngredient.forEach((windowCorrs, trigger) => {
    // Find strongest correlation
    const strongest = windowCorrs.reduce((max, curr) => 
      curr.lift > max.lift ? curr : max
    )

    // Only report if there's meaningful correlation
    if (strongest.confidence === 'insufficient_data') return

    // Get knowledge about this trigger
    const knowledge = TRIGGER_KNOWLEDGE.find(k => k.tag === trigger)

    // Determine suspicion level
    let suspicionLevel: IntoleranceInsight['suspicionLevel'] = 'low'
    if (strongest.lift >= 2.0 && strongest.confidence === 'strong') {
      suspicionLevel = 'high'
    } else if (strongest.lift >= 1.5 && strongest.confidence !== 'weak') {
      suspicionLevel = 'moderate'
    }

    // Generate recommendations
    const recommendations = generateRecommendations(trigger, strongest, knowledge)

    insights.push({
      trigger,
      suspicionLevel,
      primaryWindow: strongest.window,
      windowDescription: strongest.windowDescription,
      evidenceStrength: knowledge?.evidenceLevel || 'limited',
      typicalOnset: knowledge ? `${knowledge.typicalOnsetHours} hours` : 'varies',
      mechanism: knowledge?.mechanism || 'Unknown mechanism',
      recommendations,
      statistics: {
        totalExposures: strongest.exposures,
        symptomEvents: strongest.symptomFollows,
        lift: Math.round(strongest.lift * 100) / 100,
        confidence: strongest.confidence
      }
    })
  })

  // Sort by suspicion level and lift
  return insights.sort((a, b) => {
    const levelOrder = { high: 3, moderate: 2, low: 1 }
    const levelDiff = levelOrder[b.suspicionLevel] - levelOrder[a.suspicionLevel]
    if (levelDiff !== 0) return levelDiff
    return b.statistics.lift - a.statistics.lift
  })
}

function generateRecommendations(
  trigger: string,
  correlation: WindowCorrelation,
  knowledge?: typeof TRIGGER_KNOWLEDGE[0]
): string[] {
  const recommendations: string[] = []

  if (correlation.lift >= 2.0 && correlation.confidence === 'strong') {
    recommendations.push(`Consider eliminating ${trigger} for 2-3 weeks to test`)
    recommendations.push(`Track symptoms carefully during elimination period`)
  } else {
    recommendations.push(`Monitor ${trigger} consumption more closely`)
    recommendations.push(`Try reducing portion sizes first`)
  }

  if (knowledge) {
    if (trigger === 'lactose') {
      recommendations.push('Try lactose-free alternatives or lactase supplements')
    } else if (trigger === 'gluten') {
      recommendations.push('Consult with a doctor about celiac testing before eliminating')
    } else if (trigger === 'high-FODMAP') {
      recommendations.push('Consider following a low-FODMAP diet under dietitian guidance')
    } else if (trigger === 'high-fat') {
      recommendations.push('Eat smaller, more frequent meals')
      recommendations.push('Avoid eating high-fat foods on an empty stomach')
    }
  }

  recommendations.push('Discuss findings with your healthcare provider')

  return recommendations
}

function assessDataQuality(
  mealCount: number,
  checkInCount: number,
  daysTracked: number
): 'excellent' | 'good' | 'fair' | 'insufficient' {
  const mealsPerDay = mealCount / daysTracked
  const checkInsPerDay = checkInCount / daysTracked

  if (daysTracked < 7) return 'insufficient'
  if (mealsPerDay >= 2.5 && checkInsPerDay >= 0.8 && daysTracked >= 21) return 'excellent'
  if (mealsPerDay >= 2 && checkInsPerDay >= 0.6 && daysTracked >= 14) return 'good'
  if (mealsPerDay >= 1.5 && checkInsPerDay >= 0.4 && daysTracked >= 7) return 'fair'
  return 'insufficient'
}

// Made with Bob