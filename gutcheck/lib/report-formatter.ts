import { CorrelationAnalysis } from './correlation-engine'

export function generateDoctorReport(
  analysis: CorrelationAnalysis,
  userName: string,
  startDate: string,
  endDate: string
): string {
  const bristolTable = analysis.aggregate_stats.bristol_distribution.length > 0
    ? analysis.aggregate_stats.bristol_distribution
        .map(b => `<tr><td>Type ${b.scale}</td><td>${b.count}</td></tr>`)
        .join('')
    : '<tr><td colspan="2">No bowel movement data logged</td></tr>'

  const correlationsTable = analysis.correlations.length > 0
    ? analysis.correlations.slice(0, 10).map(c => `
        <tr>
          <td>${c.ingredient}</td>
          <td>${c.total_exposures}</td>
          <td>${c.symptom_events_after}</td>
          <td>${(c.conditional_rate * 100).toFixed(1)}%</td>
          <td>${c.lift.toFixed(2)}x</td>
          <td><span class="confidence-${c.confidence}">${c.confidence}</span></td>
        </tr>
      `).join('')
    : '<tr><td colspan="6">Insufficient data for correlation analysis</td></tr>'

  const acuteSymptomsSection = analysis.aggregate_stats.acute_symptom_count > 0
    ? `
      <p><strong>Acute symptoms logged:</strong> ${analysis.aggregate_stats.acute_symptom_count}</p>
      <ul>
        ${analysis.aggregate_stats.acute_symptom_types.map(t => 
          `<li>${t.type.replace(/_/g, ' ')}: ${t.count} occurrence(s)</li>`
        ).join('')}
      </ul>
    `
    : '<p>No acute symptoms logged during this period.</p>'

  const irritantsSection = analysis.aggregate_stats.most_frequent_irritants.length > 0
    ? `
      <p><strong>Most frequently consumed potential irritants:</strong></p>
      <ul>
        ${analysis.aggregate_stats.most_frequent_irritants.slice(0, 5).map(i => 
          `<li>${i.tag}: ${i.count} meal(s)</li>`
        ).join('')}
      </ul>
    `
    : '<p>No common irritants identified in logged meals.</p>'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digestive Health Tracking Report - ${userName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #2D2A26;
      background: #fff;
    }
    h1 {
      color: #2D2A26;
      border-bottom: 3px solid #7B9B7E;
      padding-bottom: 12px;
      margin-bottom: 20px;
      font-size: 28px;
    }
    h2 {
      color: #7B9B7E;
      margin-top: 35px;
      margin-bottom: 15px;
      font-size: 20px;
      border-left: 4px solid #7B9B7E;
      padding-left: 12px;
    }
    .header-info {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 25px;
    }
    .header-info p {
      margin: 5px 0;
    }
    .disclaimer {
      background: #FFF4E6;
      padding: 18px;
      border-left: 5px solid #D9954B;
      margin: 25px 0;
      border-radius: 4px;
    }
    .disclaimer strong {
      color: #D9954B;
      font-size: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background: #7B9B7E;
      color: white;
      font-weight: 600;
    }
    tr:hover {
      background: #f9f9f9;
    }
    ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 6px 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-box {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #7B9B7E;
    }
    .stat-box strong {
      display: block;
      color: #7B9B7E;
      font-size: 24px;
      margin-bottom: 5px;
    }
    .stat-box span {
      color: #6B6660;
      font-size: 14px;
    }
    .confidence-strong {
      color: #2D7A2D;
      font-weight: 600;
    }
    .confidence-moderate {
      color: #D9954B;
      font-weight: 600;
    }
    .confidence-weak {
      color: #9B5B4F;
    }
    .note {
      background: #f0f7f0;
      padding: 12px;
      border-radius: 4px;
      margin: 15px 0;
      font-style: italic;
    }
    @media print {
      body {
        margin: 0;
        padding: 20px;
      }
      .disclaimer {
        page-break-inside: avoid;
      }
      table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>Digestive Health Tracking Report</h1>
  
  <div class="header-info">
    <p><strong>Patient:</strong> ${userName}</p>
    <p><strong>Tracking Period:</strong> ${startDate} to ${endDate}</p>
    <p><strong>Duration:</strong> ${analysis.days_logged} days</p>
    <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
  </div>
  
  <div class="disclaimer">
    <strong>⚠️ Important Disclaimer</strong>
    <p>This report contains patient-reported data collected over a ${analysis.days_logged}-day tracking window. The statistical correlations presented are observational patterns, not diagnostic conclusions. This information should be used to facilitate discussion with a qualified healthcare provider and does not constitute medical advice or diagnosis.</p>
  </div>

  <h2>1. Tracking Overview</h2>
  <div class="stats-grid">
    <div class="stat-box">
      <strong>${analysis.days_logged}</strong>
      <span>Days Tracked</span>
    </div>
    <div class="stat-box">
      <strong>${analysis.symptom_event_days}</strong>
      <span>Days with Symptoms</span>
    </div>
    <div class="stat-box">
      <strong>${(analysis.baseline_symptom_rate * 100).toFixed(0)}%</strong>
      <span>Baseline Symptom Rate</span>
    </div>
    <div class="stat-box">
      <strong>${analysis.aggregate_stats.total_meals}</strong>
      <span>Total Meals Logged</span>
    </div>
    <div class="stat-box">
      <strong>${analysis.aggregate_stats.days_fully_tracked}</strong>
      <span>Days Fully Tracked</span>
    </div>
    <div class="stat-box">
      <strong>${analysis.aggregate_stats.days_with_bowel_movement}</strong>
      <span>Days with BM Logged</span>
    </div>
  </div>
  
  <p><strong>Data Completeness:</strong> ${analysis.aggregate_stats.days_fully_tracked} of ${analysis.days_logged} days (${((analysis.aggregate_stats.days_fully_tracked / analysis.days_logged) * 100).toFixed(0)}%) had both meal logs and daily check-ins recorded.</p>
  <p><strong>Average Meals Per Day:</strong> ${analysis.aggregate_stats.avg_meals_per_day.toFixed(1)}</p>

  <h2>2. Symptom Summary</h2>
  <p>Symptom events (defined as bloating ≥6, pain ≥6, well-being ≤4, or acute symptom severity ≥5) occurred on <strong>${analysis.symptom_event_days} of ${analysis.days_logged} days</strong> tracked.</p>
  
  ${acuteSymptomsSection}

  <h2>3. Bowel Movement Patterns</h2>
  <p>Bristol Stool Scale distribution over ${analysis.aggregate_stats.days_with_bowel_movement} logged days:</p>
  <table>
    <thead>
      <tr>
        <th>Bristol Type</th>
        <th>Frequency</th>
      </tr>
    </thead>
    <tbody>
      ${bristolTable}
    </tbody>
  </table>
  <p class="note"><em>Bristol Scale Reference: Type 1-2 (constipation), Type 3-5 (normal), Type 6-7 (diarrhea)</em></p>

  <h2>4. Eating Patterns</h2>
  ${irritantsSection}

  <h2>5. Statistical Correlations</h2>
  <p>The following ingredients/irritants showed elevated symptom rates compared to the patient's baseline symptom rate of ${(analysis.baseline_symptom_rate * 100).toFixed(1)}%:</p>
  
  <table>
    <thead>
      <tr>
        <th>Ingredient/Irritant</th>
        <th>Exposures</th>
        <th>Symptoms After</th>
        <th>Conditional Rate</th>
        <th>Lift Ratio</th>
        <th>Confidence</th>
      </tr>
    </thead>
    <tbody>
      ${correlationsTable}
    </tbody>
  </table>
  
  <p class="note">
    <strong>Interpretation Guide:</strong><br>
    • <strong>Lift Ratio:</strong> How much more likely symptoms were after consuming this ingredient compared to baseline. A lift of 2.0x means symptoms were twice as likely.<br>
    • <strong>Confidence Levels:</strong> Strong (≥5 exposures, lift ≥1.8), Moderate (≥4 exposures, lift ≥1.4), Weak (≥3 exposures, lift ≥1.2)<br>
    • <strong>Conditional Rate:</strong> Percentage of times symptoms occurred within 24 hours of consuming this ingredient.
  </p>

  <h2>6. Clinical Recommendations</h2>
  <ul>
    <li>Patterns with "strong" or "moderate" confidence may warrant further investigation through supervised elimination diet or formal allergy/intolerance testing.</li>
    <li>The ${analysis.days_logged}-day tracking period provides ${analysis.days_logged >= 14 ? 'good' : 'preliminary'} data for pattern identification. ${analysis.days_logged < 14 ? 'Extended tracking (14+ days) would strengthen confidence in these findings.' : ''}</li>
    <li>Consider correlation patterns in context of patient's medical history, current medications, and other health factors.</li>
    <li>Patient-reported symptom severity is subjective and should be evaluated alongside clinical assessment.</li>
  </ul>

  <h2>7. Data Limitations</h2>
  <ul>
    <li>Self-reported data subject to recall bias and subjective interpretation</li>
    <li>Correlation does not imply causation - other factors may contribute to symptoms</li>
    <li>Limited tracking period (${analysis.days_logged} days) - longer-term patterns may differ</li>
    <li>No control for confounding variables (stress, sleep, exercise, medications, etc.)</li>
    <li>Ingredient categorization based on patient input and automated tagging</li>
  </ul>

  <div class="disclaimer" style="margin-top: 40px;">
    <strong>End of Report</strong>
    <p>This report was generated from data collected using GutCheck, a patient self-tracking tool. It is intended to facilitate clinical discussion and should not be used as a sole basis for diagnosis or treatment decisions.</p>
  </div>
</body>
</html>`
}

// Made with Bob
