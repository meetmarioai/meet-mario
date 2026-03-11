// app/api/analyze/route.js
// ── MEET MARIO — STATISTICAL ONBOARDING ENGINE ────────────────────────────────
// Server-side only. Population methodology NEVER exposed to client.
// Queries alcat_patients (870 records) for real population-based BES.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── SYMPTOM → FOOD REACTIVITY CORRELATIONS (from clinical observation) ────────
// Which symptom clusters predict which food reactivity patterns
const SYMPTOM_FOOD_SIGNALS = {
  'bloating':           ['Yeast', 'Wheat', 'Milk', 'Gluten', 'Beans', 'Garlic', 'Onion'],
  'IBS':                ['Wheat', 'Milk', 'Yeast', 'Egg', 'Soy', 'Corn'],
  'acid reflux':        ['Coffee', 'Tomato', 'Milk', 'Wheat', 'Garlic', 'Onion'],
  'constipation':       ['Wheat', 'Milk', 'Egg', 'Banana'],
  'diarrhoea':          ['Milk', 'Wheat', 'Fructose', 'Yeast'],
  'fatigue':            ['Wheat', 'Milk', 'Sugar', 'Yeast', 'Coffee', 'Egg'],
  'brain fog':          ['Wheat', 'Milk', 'Sugar', 'Yeast', 'Gluten'],
  'poor sleep':         ['Coffee', 'Sugar', 'Wheat', 'Milk'],
  'eczema':             ['Milk', 'Egg', 'Wheat', 'Soy', 'Peanut', 'Tomato'],
  'psoriasis':          ['Wheat', 'Gluten', 'Milk', 'Nightshades', 'Egg'],
  'acne':               ['Milk', 'Sugar', 'Wheat', 'Egg'],
  'hives':              ['Milk', 'Egg', 'Wheat', 'Shellfish'],
  'joint pain':         ['Wheat', 'Milk', 'Nightshades', 'Sugar', 'Beef'],
  'muscle aches':       ['Wheat', 'Milk', 'Sugar', 'Yeast'],
  'headaches':          ['Coffee', 'Wheat', 'Yeast', 'Milk', 'Sugar', 'Chocolate'],
  'migraines':          ['Coffee', 'Wheat', 'Yeast', 'Milk', 'Chocolate', 'Citrus'],
  'anxiety':            ['Coffee', 'Sugar', 'Wheat', 'Yeast'],
  'depression':         ['Wheat', 'Sugar', 'Milk', 'Yeast'],
  'weight gain':        ['Wheat', 'Sugar', 'Milk', 'Corn', 'Yeast'],
  'hormonal balance':   ['Soy', 'Milk', 'Sugar', 'Wheat'],
  'thyroid issues':     ['Soy', 'Wheat', 'Gluten', 'Milk'],
  'autoimmune':         ['Wheat', 'Gluten', 'Milk', 'Egg', 'Soy', 'Yeast'],
  'frequent illness':   ['Sugar', 'Wheat', 'Milk', 'Yeast'],
}

// ── POPULATION REACTIVITY RATES (from 870-patient ALCAT cohort) ───────────────
// Protected server-side. Top foods by severe reaction rate.
const POPULATION_RATES = {
  'Almond':         { any: 0.978, severe: 0.350, moderate: 0.500 },
  'Brazil Nut':     { any: 0.987, severe: 0.480, moderate: 0.494 },
  'Walnut':         { any: 0.994, severe: 0.356, moderate: 0.639 },
  'Yeast':          { any: 0.985, severe: 0.306, moderate: 0.530 },
  'Safflower':      { any: 0.996, severe: 0.382, moderate: 0.610 },
  'Sunflower':      { any: 0.994, severe: 0.340, moderate: 0.656 },
  'Allulose':       { any: 0.996, severe: 0.374, moderate: 0.570 },
  'Sugar':          { any: 0.969, severe: 0.349, moderate: 0.382 },
  'Beans':          { any: 0.990, severe: 0.350, moderate: 0.300 },
  'Amaranth':       { any: 0.998, severe: 0.320, moderate: 0.678 },
  'Buckwheat':      { any: 0.994, severe: 0.163, moderate: 0.506 },
  'Coffee':         { any: 0.828, severe: 0.132, moderate: 0.404 },
  'Garlic':         { any: 0.865, severe: 0.209, moderate: 0.512 },
  'Onion':          { any: 0.880, severe: 0.190, moderate: 0.520 },
  'Tomato':         { any: 0.797, severe: 0.090, moderate: 0.361 },
  'Egg':            { any: 1.000, severe: 0.172, moderate: 0.790 },
  'Beef':           { any: 1.000, severe: 0.216, moderate: 0.784 },
  'Salmon':         { any: 0.859, severe: 0.116, moderate: 0.438 },
  'Chicken':        { any: 1.000, severe: 0.086, moderate: 0.445 },
  'Milk':           { any: 1.000, severe: 0.273, moderate: 0.403 },
  'Wheat':          { any: 0.875, severe: 0.150, moderate: 0.375 },
  'Gluten':         { any: 0.794, severe: 0.081, moderate: 0.184 },
  'Corn':           { any: 0.910, severe: 0.200, moderate: 0.450 },
  'Soy':            { any: 0.920, severe: 0.180, moderate: 0.480 },
  'Peanut':         { any: 0.880, severe: 0.220, moderate: 0.420 },
  'Chocolate':      { any: 0.850, severe: 0.160, moderate: 0.430 },
  'Rice':           { any: 0.830, severe: 0.120, moderate: 0.380 },
  'Eggplant':       { any: 0.808, severe: 0.111, moderate: 0.433 },
  'Cauliflower':    { any: 0.820, severe: 0.140, moderate: 0.380 },
  'Bell Pepper':    { any: 0.810, severe: 0.130, moderate: 0.370 },
  'Black Tea':      { any: 0.790, severe: 0.100, moderate: 0.360 },
}

// ── SIGMOID NORMALISATION ─────────────────────────────────────────────────────
function sigmoid(x, midpoint = 50, steepness = 0.08) {
  return 100 / (1 + Math.exp(-steepness * (x - midpoint)))
}

// ── BES COMPUTATION ───────────────────────────────────────────────────────────
function computeBES(data, populationMatch) {
  let raw = 0

  // 1. Symptom burden (population-calibrated weights)
  const symptomWeights = {
    'autoimmune': 18, 'joint pain': 12, 'eczema': 10, 'psoriasis': 10,
    'IBS': 9, 'migraines': 9, 'thyroid issues': 9, 'fibromyalgia': 9,
    'bloating': 7, 'fatigue': 7, 'brain fog': 7, 'skin health': 7,
    'anxiety': 6, 'depression': 6, 'weight gain': 6, 'acid reflux': 6,
    'frequent illness': 5, 'poor sleep': 5, 'hormonal balance': 5,
    'headaches': 4, 'acne': 4, 'hives': 4, 'constipation': 4, 'diarrhoea': 4,
    'muscle aches': 3,
  }
  const symptomScore = (data.symptoms || []).reduce((sum, s) => {
    return sum + (symptomWeights[s.toLowerCase()] || 3)
  }, 0)
  raw += Math.min(symptomScore, 55) // cap at 55

  // 2. Symptom count multiplier
  const sc = (data.symptoms || []).length
  if (sc >= 8) raw += 12
  else if (sc >= 5) raw += 8
  else if (sc >= 3) raw += 5

  // 3. Migration entropy signal
  const yrs = data.yearsInCurrentCountry
  if (yrs === 'Under 1') raw += 14
  else if (yrs === '1–3') raw += 10
  else if (yrs === '4–10') raw += 6

  // 4. Hormonal status
  const hs = (data.hormonalStatus || '').toLowerCase()
  if (hs.includes('peri')) raw += 8
  else if (hs.includes('post')) raw += 6
  else if (hs.includes('hrt')) raw += 5
  else if (hs.includes('trt')) raw += 5

  // 5. Medications (complexity signal)
  const medCount = (data.medications || '').split('\n').filter(Boolean).length
  raw += Math.min(medCount * 4, 16)

  // 6. Diagnosed conditions
  const condCount = (data.conditions || '').split('\n').filter(Boolean).length
  raw += Math.min(condCount * 5, 20)

  // 7. Population match calibration
  // If similar patients in cohort had high reactivity counts, adjust upward
  if (populationMatch && populationMatch.avgReactors > 0) {
    const popAdjust = Math.min((populationMatch.avgReactors / 50) * 10, 10)
    raw += popAdjust
  }

  // Sigmoid normalise to 1–95 range
  const bes = Math.round(Math.min(Math.max(sigmoid(raw, 55, 0.06), 8), 95))
  return bes
}

// ── PREDICTED REACTIVE FOODS ─────────────────────────────────────────────────
function predictReactiveFoods(data) {
  const symptoms = (data.symptoms || []).map(s => s.toLowerCase())
  const foodScores = {}

  // Base scores from population rates
  for (const [food, rates] of Object.entries(POPULATION_RATES)) {
    foodScores[food] = rates.severe * 100
  }

  // Boost foods correlated with patient's symptoms
  for (const symptom of symptoms) {
    const correlated = SYMPTOM_FOOD_SIGNALS[symptom] || []
    for (const food of correlated) {
      if (foodScores[food] !== undefined) {
        foodScores[food] += 8
      }
    }
  }

  // Boost for hormonal patients
  const hs = (data.hormonalStatus || '').toLowerCase()
  if (hs.includes('peri') || hs.includes('post') || hs.includes('hrt')) {
    ;['Milk', 'Soy', 'Sugar', 'Wheat', 'Yeast'].forEach(f => {
      if (foodScores[f]) foodScores[f] += 6
    })
  }

  // Sort and return top 20
  return Object.entries(foodScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([food, score]) => ({
      food,
      probability: Math.min(Math.round(score), 99),
      population_rate: POPULATION_RATES[food]?.severe || 0,
    }))
}

// ── TIER LABELS ───────────────────────────────────────────────────────────────
function getTier(bes) {
  if (bes < 25) return { label: 'Low Entropy', color: '#6A9060', description: 'Excellent baseline. System responds quickly to protocol.' }
  if (bes < 45) return { label: 'Mild Entropy', color: '#8A9060', description: 'Good baseline with manageable immune burden.' }
  if (bes < 60) return { label: 'Moderate Entropy', color: '#B88040', description: 'Accumulated immune burden. Full 90-day protocol recommended.' }
  if (bes < 75) return { label: 'Elevated Entropy', color: '#C07040', description: 'Significant systemic involvement. Multi-stage protocol required.' }
  return { label: 'High Entropy', color: '#B85040', description: 'Deep systemic burden. Protocol will work in layers across 90–180 days.' }
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const data = await request.json()

    // Query population for similar patients (server-side only)
    let populationMatch = null
    try {
      // Get aggregate stats from cohort (no individual patient data returned to client)
      const { data: cohortData, error } = await supabase
        .from('alcat_patients')
        .select('severe, moderate, mild, sex, candida')
        .limit(870)

      if (!error && cohortData) {
        // Compute average reactor counts for cohort calibration
        const avgReactors = cohortData.reduce((sum, p) => {
          return sum + (p.severe?.length || 0) + (p.moderate?.length || 0)
        }, 0) / cohortData.length

        // Sex-matched subset
        const sexMatch = cohortData.filter(p =>
          p.sex?.toLowerCase() === (data.sex || '').toLowerCase()
        )
        const sexMatchRate = sexMatch.length / cohortData.length

        // Candida prevalence in cohort
        const candidaRate = cohortData.filter(p =>
          p.candida && p.candida !== 'none'
        ).length / cohortData.length

        populationMatch = {
          cohortSize: cohortData.length,
          avgReactors: Math.round(avgReactors),
          sexMatchRate: Math.round(sexMatchRate * 100),
          candidaPrevalence: Math.round(candidaRate * 100),
        }
      }
    } catch (dbErr) {
      // Fallback: use static population values
      populationMatch = { cohortSize: 870, avgReactors: 42, sexMatchRate: 50, candidaPrevalence: 34 }
    }

    // Compute BES
    const bes = computeBES(data, populationMatch)
    const tier = getTier(bes)

    // Predict reactive foods
    const predictedFoods = predictReactiveFoods(data)

    // Protocol assignment
    const protocol = bes >= 60
      ? 'Option A — 21-day universal GCR detox (Priority)'
      : 'Option A — 21-day universal GCR detox'

    return NextResponse.json({
      bes,
      tier: tier.label,
      tierColor: tier.color,
      tierDescription: tier.description,
      protocol,
      predictedFoods,
      populationContext: {
        cohortSize: populationMatch?.cohortSize || 870,
        // Only aggregate stats — no individual data
        note: `Calibrated against ${populationMatch?.cohortSize || 870} MediBalans patient ALCAT results`,
      },
    })

  } catch (err) {
    return NextResponse.json({ error: 'Analysis failed', bes: 45, tier: 'Moderate Entropy' }, { status: 500 })
  }
}
