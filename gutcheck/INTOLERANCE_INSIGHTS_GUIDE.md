# Intolerance Insights Feature Guide

## Overview
The Intolerance Insights feature uses multi-window time correlation analysis to identify potential food intolerances and triggers based on your meal and symptom data.

## How It Works

### Time-Window Analysis
The system analyzes your data across four different time windows:

1. **Immediate (0-2 hours)**: Fast reactions
   - Typical triggers: FODMAPs, fatty foods, spicy foods, caffeine
   - Examples: Cramping after eating onions, diarrhea after coffee

2. **Medium (2-8 hours)**: Medium reactions
   - Typical triggers: Lactose, sugar alcohols, fermentable fibers
   - Examples: Bloating 4 hours after milk, gas after beans

3. **Delayed (8-24 hours)**: Slow reactions
   - Typical triggers: Gluten sensitivity, soy
   - Examples: Fatigue next morning after pasta, bloating the next day

4. **Cumulative (24-72 hours)**: Long-term reactions
   - Typical triggers: Gluten (in some people), cumulative FODMAP load
   - Examples: Symptoms appearing 2 days after repeated gluten consumption

### Statistical Analysis
For each food/ingredient:
- Counts how often you consumed it
- Tracks how often symptoms followed in each time window
- Compares to your baseline symptom rate
- Calculates a "lift" score (risk increase)
- Assigns confidence levels based on data quality

### Confidence Levels
- **Strong**: High lift (2x+), 5+ exposures
- **Moderate**: Medium lift (1.5x+), 4+ exposures
- **Weak**: Low lift (1.2x+), 3+ exposures
- **Insufficient Data**: Not enough data to draw conclusions

## Features

### Symptom Onset Time Tracking
When logging symptoms in your evening check-in:
1. Check "Yes, I had symptoms I didn't log in real-time"
2. Rate the severity
3. **NEW**: Enter the time when symptoms started
   - This helps identify which meal triggered the symptoms
   - Important for foods that affect you differently on empty vs. full stomach

### Intolerance Insights Page
Access from the home screen (available after 7 days of tracking):
- **Summary**: Days analyzed, meals logged, data quality
- **Insights Tab**: Personalized intolerance suspicions with:
  - Suspicion level (high/moderate/low)
  - Time window when symptoms typically occur
  - Scientific mechanism explanation
  - Evidence-based recommendations
  - Statistics (exposures, symptom events, risk increase)
- **Correlations Tab**: Detailed view of all food-symptom correlations

## Evidence-Based Knowledge

The system uses research-backed timing patterns:

### Lactose Intolerance
- **Onset**: 30 minutes to 2 hours
- **Peak**: 2-4 hours
- **Mechanism**: Undigested lactose fermented by gut bacteria
- **Evidence**: Strong (NIH, clinical studies)

### Gluten Sensitivity (Non-Celiac)
- **Onset**: 2-48 hours (highly variable)
- **Duration**: Up to 72 hours in some cases
- **Mechanism**: Immune response, increased gut permeability
- **Evidence**: Moderate (ongoing research)

### FODMAPs
- **Onset**: 0-4 hours (fast-acting)
- **Duration**: 4-8 hours
- **Mechanism**: Fermentation of poorly absorbed carbohydrates
- **Evidence**: Strong (Monash University research)

### High-Fat Foods
- **Onset**: 30 minutes to 2 hours
- **Duration**: 2-4 hours
- **Mechanism**: Delayed gastric emptying, increased colonic motility
- **Evidence**: Strong
- **Note**: Worse on empty stomach

## Data Quality Requirements

### Minimum Requirements
- **7 days** of tracking for basic insights
- **14 days** for good confidence
- **21+ days** for excellent confidence

### What Affects Quality
- Meal logging frequency (aim for 2+ meals/day)
- Check-in consistency (daily is best)
- Symptom timing accuracy (use the onset time feature!)
- Variety in foods consumed

## Important Notes

### This is NOT a Diagnosis
- Insights are statistical correlations, not medical diagnoses
- Always consult a healthcare provider before:
  - Eliminating major food groups
  - Suspecting celiac disease (get tested BEFORE eliminating gluten)
  - Making significant dietary changes

### Context Matters
- Some foods cause issues only when:
  - Eaten on an empty stomach
  - Combined with other triggers
  - Consumed in large quantities
  - Eaten during stress
- The system accounts for timing but not all contextual factors

### False Positives/Negatives
- Small sample sizes can show spurious correlations
- Some true triggers may not show up if:
  - You don't eat them often enough
  - Effects are too delayed
  - You always eat them with other foods
- Use the confidence levels as a guide

## Recommendations

### For Best Results
1. **Log meals consistently** - especially ingredients
2. **Use symptom onset time** - helps identify true triggers
3. **Track for at least 2-3 weeks** - more data = better insights
4. **Note context** - empty stomach, stress, etc.
5. **Test suspicions systematically**:
   - Eliminate suspected trigger for 2-3 weeks
   - Reintroduce and observe
   - Document results

### When to See a Doctor
- High suspicion of gluten sensitivity (test for celiac first!)
- Severe or worsening symptoms
- Unexplained weight loss
- Blood in stool
- Persistent symptoms despite dietary changes
- Before eliminating major food groups

## Technical Details

### Algorithm
1. Builds symptom event timeline with precise timestamps
2. For each meal, checks all time windows
3. Counts ingredient exposures in each window
4. Compares symptom rates: after exposure vs. baseline
5. Calculates lift scores and confidence levels
6. Filters by evidence-based trigger timing patterns
7. Generates personalized recommendations

### Privacy
- All analysis happens on your device/server
- No data shared with third parties
- You control who sees your insights

## Future Enhancements
- Machine learning for personalized timing patterns
- Interaction effects (food combinations)
- Portion size analysis
- Stress and sleep correlation
- Integration with wearable devices

---

**Remember**: GutCheck is a tracking and analysis tool, not a medical device. Always work with healthcare professionals for diagnosis and treatment.

Made with Bob