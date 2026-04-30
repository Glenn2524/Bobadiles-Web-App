# GutCheck — IBS & Digestive Health Companion

A web application that helps people with IBS and digestive issues track meals and symptoms, identify food triggers via statistical pattern analysis, and generate reports to share with their doctor.

**⚠️ IMPORTANT:** This app does NOT provide medical advice. It is a data collection and pattern-surfacing tool that aids diagnosis and patient-doctor conversations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Install dependencies:**
```bash
cd gutcheck
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

The `.env.local` file only needs the database URL (already set):
```
DATABASE_URL="file:./dev.db"
```

3. **Initialize the database:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Seed demo data:**
```bash
npm run seed
```

This creates a demo user "Alex" with 14 days of realistic tracking data, including:
- 30+ meals with engineered dairy/wheat correlations
- Daily evening check-ins with symptom patterns
- 4 acute symptom logs
- 12 bowel movement records
- Next doctor appointment set to 8 days from now

5. **Start the development server:**
```bash
npm run dev
```

6. **Open the app:**
Navigate to [http://localhost:3000](http://localhost:3000)

The app will automatically detect the seeded user and load the dashboard.

## 🎯 Demo Walkthrough (90 seconds)

Follow this script to demonstrate all key features:

### 1. Dashboard Overview (10s)
- Show Alex's dashboard with progress strip ("Tracking for 14 days")
- Point out "8 days until your appointment" reminder
- Highlight observation cards showing patterns

### 2. Log a Meal - Barcode Scan (15s)
- Click "Log a Meal"
- Click "Scan Barcode" tab
- Use manual entry fallback: enter `3017620422003` (Nutella)
- Show auto-populated ingredients and allergen tags (gluten, lactose, nuts)
- Save the meal

### 3. Acute Symptom Logger (10s)
- Click the floating "Acute Symptom" button (top-right, always visible)
- Select "Severe pain"
- Set severity to 7
- Add note: "Sharp pain after lunch"
- Click "Log it" — show how fast it is (<10 seconds)

### 4. Daily Check-in (20s)
- Click "Daily Check-in"
- Show the "Today was a good day" shortcut button
- Instead, fill out the full form:
  - Well-being: 6/10
  - Energy: 7/10
  - Stress: 4/10
  - Bloating: 3/10
  - Pain: 2/10
- Show Bristol Stool Scale selector with friendly icons
- Select Type 4 (smooth log)
- Answer retrospective question: "No unlogged symptoms"
- Submit

### 5. Timeline View (10s)
- Click "Timeline" (if implemented) or navigate to insights
- Show visual correlation between meals (dots) and symptom spikes (lines)
- Hover over a dairy meal → highlight symptoms in next 24h

### 6. Insights - Statistical Analysis (15s)
- Click "Insights"
- Click "Analyze my last 14 days"
- Show Claude's structured output:
  - **Noticed patterns:** "Dairy appeared more often before symptoms (strong confidence)"
  - **Evidence:** "Out of 7 times you ate dairy, 5 were followed by symptoms within 24h"
  - Show lift ratios and confidence levels
- Expand "How we computed this" to show transparent statistics

### 7. Doctor Report (10s)
- Click "My Report"
- Click "Generate Report for My Doctor"
- Show the clinical-style summary with sections:
  - Tracking Overview
  - Symptom Summary
  - Eating Patterns
  - Statistical Correlations
  - Disclaimer
- Click "Print / Save as PDF"

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API routes
- **Database:** SQLite via Prisma
- **Insights:** Pure TypeScript template-based formatters (zero external API costs)
- **Food Data:** Open Food Facts API (free, no key required)
- **Barcode Scanning:** html5-qrcode
- **Charts:** Recharts

### Key Design Decisions

1. **Zero-Cost Insights Architecture:**
   - Tier 1: Deterministic correlation engine (`lib/correlation-engine.ts`) computes lift ratios
   - Tier 2: Template-based formatters (`lib/insights-formatter.ts`, `lib/report-formatter.ts`) generate readable output
   - No AI/LLM costs - everything runs locally with pure TypeScript
   - Instant results with no network latency

2. **No Real Auth:**
   - Single hardcoded user stored in localStorage
   - Name field on first visit
   - Perfect for hackathon demo, not production

3. **Engagement Principles:**
   - Progress bar shows "X/7 days until insights unlock"
   - Doctor appointment as goal anchor
   - Passive observations (not gamification)
   - Companion tone (warm, not patronizing)
   - Low friction logging (<10 seconds for acute symptoms)

## 📁 Project Structure

```
gutcheck/
├── app/
│   ├── api/              # API routes
│   │   ├── user/         # User CRUD + progress + observations
│   │   ├── meals/        # Meal logging
│   │   ├── check-ins/    # Daily check-ins
│   │   ├── insights/     # Correlation analysis + Claude
│   │   └── report/       # Doctor report generation
│   ├── meal/             # Meal logging UI (barcode/search/manual)
│   ├── check-in/         # Check-in UI
│   ├── insights/         # Insights dashboard
│   ├── report/           # Report generation
│   ├── timeline/         # Visual timeline
│   ├── settings/         # User settings
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard + onboarding
├── components/ui/        # shadcn/ui components
├── lib/
│   ├── correlation-engine.ts  # Statistical analysis (pure TypeScript)
│   ├── insights-formatter.ts  # Template-based insights generator
│   ├── report-formatter.ts    # Template-based report generator
│   ├── observations.ts        # Dashboard observation generator
│   ├── openfoodfacts.ts       # Food database API
│   ├── ingredient-taxonomy.ts # Irritant tag detection
│   ├── prisma.ts              # Prisma client
│   └── utils.ts               # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Demo data seeder
└── public/               # Static assets
```

## 🧪 Testing the Correlation Engine

The seeded data includes engineered patterns:

- **Dairy:** 7 exposures, 5 followed by symptoms → Lift ratio ~1.8 (strong)
- **Wheat:** 8 exposures, 6 followed by symptoms → Lift ratio ~1.5 (moderate)
- **Other ingredients:** No correlation (lift ~1.0)

Run insights to verify the engine correctly identifies these patterns.

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Generate Prisma client
npx prisma generate

# Create database migration
npx prisma migrate dev --name migration_name

# Seed database
npm run seed

# Reset database (warning: deletes all data)
npx prisma migrate reset

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Schema

See `prisma/schema.prisma` for the complete schema. Key models:

- **User:** Name, preferences, appointment date
- **Meal:** Timestamp, source (barcode/search/manual), ingredients, irritant tags
- **CheckIn:** Morning/evening, well-being, energy, stress, bloating, pain
- **AcuteSymptom:** Timestamp, type, severity
- **BowelMovement:** Timestamp, Bristol scale

## 🎨 Design System

**Color Palette:**
- Background: Warm white (#FAF9F6)
- Primary: Soft sage green (#7B9B7E)
- Secondary: Muted terracotta (#C4886B)
- Accent: Warm amber (#D9954B) — for acute symptom button
- Text: Warm charcoal (#2D2A26)

**Typography:**
- Font: Inter
- Line height: 1.6 (generous for readability)
- Headings: Medium weight (not bold)

**Tone:**
- Calm, clinical-but-warm
- "We've been tracking together" not "You have a streak"
- "Worth discussing" not "You should"
- No exclamation marks except errors

## 🚨 Disclaimers

Mandatory placement:
1. Dashboard footer (always visible)
2. Insights page header
3. Doctor report header

Standard text:
> "GutCheck is not a medical device and does not provide medical advice. Always consult a healthcare professional."

## 🔮 Future Enhancements (Out of Scope for Hackathon)

- Real authentication (OAuth, JWT)
- Smartwatch / Apple Health integration
- Real push notifications
- Multi-user support
- Image recognition for food photos
- Restaurant menu integration
- Internationalization
- Dark mode

## 📝 License

This is a hackathon MVP. Not licensed for production use.

## 🤝 Contributing

This was built for a 4-hour hackathon. Contributions welcome but expect rough edges!

---

**Built with ❤️ for people managing IBS and digestive health challenges.**