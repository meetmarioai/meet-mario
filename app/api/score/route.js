// app/api/score/route.js
// BES + CCS scoring — formula and thresholds never reach the client

export async function POST(req) {
  try {
    const {
      symptoms, yearsInCurrentCountry, hormonalStatus, medications, conditions,
      // New CCS inputs
      symptomCategoryCount = 0,
      symptomDuration = '',
      practitionerCount = '',
      priorApproaches = [],
      testingStatus = '',
      impactSeverity = '',
    } = await req.json();

    // ── BES (Biological Entropy Score) ──────────────────────────────────
    let score = 20;
    if (symptoms?.length >= 5) score += 25;
    else if (symptoms?.length >= 3) score += 15;
    else if (symptoms?.length >= 1) score += 8;
    if (yearsInCurrentCountry && +yearsInCurrentCountry < 5) score += 12;
    if (hormonalStatus && hormonalStatus !== 'Not applicable') score += 8;
    if (medications?.trim()) score += 10;
    if (conditions?.trim()) score += 10;
    score = Math.min(score, 92);

    const band = score < 35 ? 'Low' : score < 60 ? 'Moderate' : 'Elevated';
    const interpretation = score < 35
      ? 'Your biological signals suggest a relatively low entropic burden. Your system has strong repair capacity and is likely to respond quickly to the protocol.'
      : score < 60
      ? 'Your biological signals suggest a moderate entropic burden accumulated over time. Your system has good repair capacity but will benefit from the full 90-day protocol.'
      : 'Your biological signals suggest an elevated entropic burden with deeper systemic involvement. Your system will respond — but in layers. The full multi-stage protocol is what your biology needs.';

    // ── CCS (Clinical Complexity Score) ─────────────────────────────────
    // Multi-system stacking (max 25 pts)
    const catPts = Math.min(symptomCategoryCount * 5, 25);

    // Symptom chronicity (max 20 pts)
    const chronicityMap = {
      'Less than 6 months': 0,
      '6 months – 2 years': 5,
      '2–5 years': 10,
      '5–10 years': 15,
      'More than 10 years': 20,
    };
    const chronicityPts = chronicityMap[symptomDuration] ?? 0;

    // Failed interventions (max 20 pts)
    const practMap = { 'None yet': 0, '1–2': 5, '3–5': 12, '6 or more': 18 };
    let interventionPts = practMap[practitionerCount] ?? 0;
    const triedElim = priorApproaches.includes('Elimination diet') || priorApproaches.includes('Low-FODMAP');
    if (triedElim && interventionPts > 0) interventionPts = Math.min(interventionPts + 2, 20);

    // Previous testing (max 15 pts) — pick highest applicable
    let testingPts = 0;
    if (testingStatus === "I've been tested but didn't get clear answers") testingPts = Math.max(testingPts, 15);
    if (testingStatus === 'Yes, older results (more than 6 months ago)') testingPts = Math.max(testingPts, 8);
    if (priorApproaches.some(a => ['ALCAT','MRT','IgG food sensitivity test'].includes(a))) testingPts = Math.max(testingPts, 10);
    testingPts = Math.min(testingPts, 15);

    // Diagnosed conditions (max 15 pts)
    const condText = ((conditions || '') + ' ' + (medications || '')).toLowerCase();
    const condKeywords = ['autoimmune','hashimoto','ibs','ibd','crohn','celiac','fibromyalgia',' cfs ','chronic fatigue',' me ','long covid','chronic migraine'];
    let condPts = 0;
    for (const kw of condKeywords) {
      if (condText.includes(kw)) condPts += 5;
      if (condPts >= 15) break;
    }
    condPts = Math.min(condPts, 15);

    // Impact severity (max 15 pts)
    const impactMap = {
      'Minimal — occasional inconvenience': 0,
      'Moderate — I manage but it limits me': 5,
      'Significant — it affects my work and relationships': 10,
      "Severe — I've had to stop working or drastically change my life": 15,
    };
    const impactPts = impactMap[impactSeverity] ?? 0;

    const ccsScore = catPts + chronicityPts + interventionPts + testingPts + condPts + impactPts;

    return Response.json({ score, band, interpretation, ccsScore });
  } catch (err) {
    console.error('[/api/score]', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
