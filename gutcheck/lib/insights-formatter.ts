import { CorrelationAnalysis } from './correlation-engine'

export interface InsightResponse {
  noticed_patterns: Array<{
    finding: string
    evidence: string
    confidence: string
  }>
  unclear_patterns: string[]
  eating_observations: string[]
  discuss_with_doctor: string[]
  data_quality_note: string
  disclaimer: string
}

export function formatInsights(
  analysis: CorrelationAnalysis,
  userName: string
): InsightResponse {
  // Filter meaningful patterns
  const strongPatterns = analysis.correlations.filter(c => c.confidence === 'strong')
  const moderatePatterns = analysis.correlations.filter(c => c.confidence === 'moderate')
  const weakPatterns = analysis.correlations.filter(c => c.confidence === 'weak')

  // Build noticed patterns (strong + moderate)
  const noticed_patterns = [...strongPatterns, ...moderatePatterns]
    .slice(0, 5)
    .map(corr => {
      const percentage = (corr.conditional_rate * 100).toFixed(0)
      return {
        finding: `${corr.ingredient} appeared more often before symptoms`,
        evidence: `Out of ${corr.total_exposures} times you ate ${corr.ingredient}, ${corr.symptom_events_after} were followed by symptoms within 24 hours (${percentage}% of the time)`,
        confidence: corr.confidence
      }
    })

  // Build unclear patterns (weak confidence)
  const unclear_patterns = weakPatterns
    .slice(0, 3)
    .map(c => `${c.ingredient} shows a weak pattern with only ${c.total_exposures} exposures - more data needed`)

  // Build eating observations
  const eating_observations: string[] = []
  
  eating_observations.push(
    `You logged ${analysis.aggregate_stats.total_meals} meals over ${analysis.days_logged} days (${analysis.aggregate_stats.avg_meals_per_day.toFixed(1)} meals per day on average)`
  )

  if (analysis.aggregate_stats.most_frequent_irritants.length > 0) {
    const topIrritants = analysis.aggregate_stats.most_frequent_irritants
      .slice(0, 3)
      .map(i => `${i.tag} (${i.count} meals)`)
      .join(', ')
    eating_observations.push(`Most common potential irritants: ${topIrritants}`)
  }

  if (analysis.aggregate_stats.days_fully_tracked > 0) {
    const completeness = ((analysis.aggregate_stats.days_fully_tracked / analysis.days_logged) * 100).toFixed(0)
    eating_observations.push(
      `${analysis.aggregate_stats.days_fully_tracked} days had both meals and check-ins logged (${completeness}% completeness)`
    )
  }

  // Build doctor discussion points
  const discuss_with_doctor: string[] = []
  
  if (strongPatterns.length > 0) {
    discuss_with_doctor.push(
      `Strong correlation patterns: ${strongPatterns.map(p => p.ingredient).join(', ')}`
    )
  }

  if (moderatePatterns.length > 0) {
    discuss_with_doctor.push(
      `Moderate correlation patterns worth investigating: ${moderatePatterns.map(p => p.ingredient).join(', ')}`
    )
  }

  if (analysis.aggregate_stats.acute_symptom_count > 0) {
    discuss_with_doctor.push(
      `${analysis.aggregate_stats.acute_symptom_count} acute symptom events logged during this period`
    )
  }

  if (analysis.aggregate_stats.bristol_distribution.length > 0) {
    const abnormalBristol = analysis.aggregate_stats.bristol_distribution
      .filter(b => b.scale <= 2 || b.scale >= 6)
      .reduce((sum, b) => sum + b.count, 0)
    
    if (abnormalBristol > 0) {
      discuss_with_doctor.push(
        `${abnormalBristol} bowel movements outside normal range (Bristol 1-2 or 6-7)`
      )
    }
  }

  // Ensure we have at least 2 discussion points
  if (discuss_with_doctor.length === 0) {
    discuss_with_doctor.push('Overall symptom frequency and patterns')
    discuss_with_doctor.push('Baseline digestive health assessment')
  }

  // Data quality note
  let data_quality_note = ''
  if (analysis.days_logged < 7) {
    data_quality_note = `This analysis is based on only ${analysis.days_logged} days of data. At least 7 days are recommended for meaningful patterns. Continue tracking to improve confidence.`
  } else if (analysis.days_logged < 14) {
    data_quality_note = `This analysis is based on ${analysis.days_logged} days of data. This is a preliminary view - 14+ days would strengthen pattern confidence.`
  } else {
    data_quality_note = `This analysis is based on ${analysis.days_logged} days of comprehensive tracking, providing good confidence in the identified patterns.`
  }

  return {
    noticed_patterns,
    unclear_patterns,
    eating_observations,
    discuss_with_doctor: discuss_with_doctor.slice(0, 4),
    data_quality_note,
    disclaimer: 'This is statistical pattern analysis from your self-reported data, not medical advice. These correlations do not prove causation. Always consult a healthcare professional before making dietary changes.'
  }
}

// Made with Bob
