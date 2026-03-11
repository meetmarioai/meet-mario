// ═══════════════════════════════════════════════════════════════════════════════
// MEET MARIO — GUIDANCE ENGINE v1.0
// Three-Tier Clinical Intelligence Layer
// Extends marioSystemPrompt for patients without full ALCAT testing
//
// AUTHOR: Dr Mario Anthis PhD, MediBalans AB, Stockholm
// CLASSIFICATION: Proprietary — Do not expose to client
//
// PURPOSE:
// This module enables Mario to deliver clinically meaningful, personalised
// dietary and supplementation guidance to patients who have:
//   Tier A — Full panel: ALCAT + CMA + WGS (existing logic in marioSystemPrompt)
//   Tier B — Partial panel: CMA + WGS (no ALCAT) — THIS MODULE
//   Tier C — Minimal panel: CMA only or WGS only — THIS MODULE
//   Tier D — No tests yet — Statistical population guidance only — THIS MODULE
//
// CLINICAL LOGIC:
// The three-layer architecture restores gut integrity and corrects cellular
// deficiencies even without individual ALCAT confirmation:
//
//   Layer 1 — Statistical ALCAT (population data, 1,042 patients)
//             → Remove highest-probability immune triggers
//             → Begin gut mucosal recovery
//             → This is the precondition for Layer 2 to work
//
//   Layer 2 — CMA (cellular micronutrient status)
//             → Identify precise deficiencies at the cellular level
//             → Correct with targeted repletion
//             → Only effective AFTER Layer 1 reduces mucosal inflammation
//
//   Layer 3 — WGS (nutrigenomics)
//             → Explain WHY deficiencies are structural and persistent
//             → Determine which nutrient FORMS are metabolically active
//             → Prevent wasted intervention on wrong forms
//
// ═══════════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — PATIENT TIER DETECTION
// ─────────────────────────────────────────────────────────────────────────────

export function detectPatientTier(patient = {}) {
  const hasALCAT = (
    (patient.severe?.length > 0) ||
    (patient.moderate?.length > 0) ||
    (patient.mild?.length > 0) ||
    (patient.severeReactors?.length > 0) ||
    (patient.moderateReactors?.length > 0) ||
    (patient.mildReactors?.length > 0)
  )
  const hasCMA = (patient.cmaDeficiencies?.length > 0) || (patient.cmaNutrients?.length > 0)
  const hasWGS = (patient.genomicSnps?.length > 0) || (patient.wgsVariants?.length > 0)
  const hasMethylation = patient.methylationVariants?.length > 0

  if (hasALCAT && hasCMA && (hasWGS || hasMethylation)) return 'A'
  if (!hasALCAT && hasCMA && hasWGS) return 'B'
  if (hasALCAT && hasCMA && !hasWGS) return 'A' // ALCAT + CMA is still Tier A without genomics
  if (hasALCAT && !hasCMA && !hasWGS) return 'A' // ALCAT alone is still primary
  if (!hasALCAT && hasCMA && !hasWGS) return 'C'
  if (!hasALCAT && !hasCMA && hasWGS) return 'C'
  return 'D'
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — STATISTICAL ALCAT POPULATION GUIDANCE
// Based on 1,042-patient MediBalans ALCAT dataset
// THIS DATA IS SERVER-SIDE ONLY — NEVER EXPOSE RAW RATES TO CLIENT
// ─────────────────────────────────────────────────────────────────────────────

const STATISTICAL_HIGH_RISK = [
  'brazil nuts',
  'dairy (all forms)',
  "baker's yeast",
  "brewer's yeast",
  'egg white',
  'cane sugar',
  'coffee',
  'cashews',
  'pistachios',
  'lobster',
  'shrimp',
]

const STATISTICAL_MODERATE_RISK = [
  'wheat / gluten',
  'oats',
  'corn',
  'soy',
  'peanuts',
  'oranges',
  'bananas',
  'mango',
  'pineapple',
  'tomatoes',
  'bell peppers',
  'pork',
  'tuna',
  'salmon',
  'rice',
  'quinoa',
]

const UNIVERSAL_AVOIDANCE = [
  'all seed oils',
  'margarine',
  'oats',
  'legumes',
  'processed foods',
  'added sugars',
  'artificial additives',
  'alcohol',
  'ultra-processed grains',
]

const STATISTICAL_SAFE_ANCHORS = [
  'lamb', 'turkey', 'venison', 'duck',
  'sardines', 'mackerel', 'herring', 'trout',
  'courgette / zucchini', 'sweet potato', 'parsnip', 'beetroot',
  'asparagus', 'broccoli', 'cucumber', 'lettuce', 'rocket / arugula',
  'blueberries', 'raspberries', 'pears', 'pomegranate',
  'olive oil', 'coconut oil', 'tallow', 'ghee',
  'fresh herbs', 'lemon / lime', 'garlic', 'ginger', 'turmeric', 'black pepper',
]

function buildStatisticalGuidanceBlock() {
  return `
════════════════════════════════════════════════════════════════
STATISTICAL DIETARY GUIDANCE — NO INDIVIDUAL ALCAT ON FILE
════════════════════════════════════════════════════════════════

This patient has not yet completed individual ALCAT testing.
Mario uses population-level intelligence from the MediBalans clinical
dataset to identify the highest-probability immune triggers and begin
gut integrity restoration.

DO NOT mention population statistics, database size, or methodology.
Present guidance as clinically reasoned dietary protocol, not as
probability estimates.

WHAT MARIO SAYS TO EXPLAIN THIS (adapt naturally):
"Before your individual food reactivity results are available, we work
with what the clinical picture tells us. Certain foods create immune
load in the vast majority of patients — not because of allergy, but
because of delayed cellular immune reactivity that standard testing
misses entirely. Removing these first allows your gut lining to begin
recovering, which is the precondition for everything else working.
When you complete ALCAT testing, we will have your precise picture and
can refine the protocol exactly."

HIGHEST-PRIORITY REMOVALS (statistical — do not frame as confirmed):
${STATISTICAL_HIGH_RISK.map(f => `— ${f}`).join('\n')}

MODERATE-PRIORITY REDUCTIONS:
${STATISTICAL_MODERATE_RISK.map(f => `— ${f}`).join('\n')}

UNIVERSAL REMOVALS (all patients, regardless of test results):
${UNIVERSAL_AVOIDANCE.map(f => `— ${f}`).join('\n')}

SAFE DIETARY ANCHORS — build meals around these:
${STATISTICAL_SAFE_ANCHORS.map(f => `— ${f}`).join('\n')}

GUT INTEGRITY MECHANISM — explain to patient when relevant:
Each exposure to a reactive food triggers a cytokine cascade from
activated white blood cells. This sustains mucosal inflammation in
the small intestine and impairs tight junction integrity. The absorptive
surface becomes progressively less capable of transporting nutrients
into the bloodstream. This is why cellular deficiencies accumulate
even in patients eating what appears to be a healthy diet. Removing
the reactive load allows tight junctions to reseal, mucosal inflammation
to reduce, and absorptive capacity to restore. This is the precondition
for CMA repletion to work. You cannot correct intracellular deficiencies
through an inflamed, permeable gut wall regardless of supplementation.

ALCAT UPSELL — use naturally when appropriate, never push:
"The statistical protocol gives us a strong starting point based on
population patterns. What ALCAT testing adds is your individual
picture — the specific foods triggering your immune system precisely,
so we can confirm what is already improving and identify anything
the statistical protocol may have missed."
`
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — CMA INTERPRETATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const CMA_DIETARY_MAP = {
  'B12': {
    dietary: ['sardines', 'mackerel', 'lamb', 'turkey', 'duck', 'ghee'],
    supplementNote: 'Methylcobalamin or Hydroxy/Adenosylcobalamin — never cyanocobalamin',
    mechanismNote: 'Serum B12 can appear normal while cellular stores are depleted. Intracellular measurement is the only accurate assessment.',
    wgsModifiers: ['FUT2', 'MTRR', 'MTR'],
  },
  'folate': {
    dietary: ['liver', 'leafy greens', 'asparagus', 'beetroot'],
    supplementNote: 'L-5-methylfolate only — never folic acid (especially critical with MTHFR variants)',
    mechanismNote: 'Synthetic folic acid in fortified foods competes with active folate at the receptor level. Paradoxically, high folic acid intake can worsen folate function in MTHFR variants.',
    wgsModifiers: ['MTHFR', 'MTHFD1', 'DHFR'],
  },
  'B6': {
    dietary: ['turkey', 'sardines', 'sweet potato', 'banana (limit — moderate reactivity)'],
    supplementNote: 'Pyridoxal-5-phosphate (P5P) — active form only',
    mechanismNote: 'B6 depletion impairs over 150 enzymatic reactions including neurotransmitter synthesis and transsulfuration.',
    wgsModifiers: ['NBPF3'],
  },
  'B2': {
    dietary: ['lamb', 'sardines', 'mackerel', 'leafy greens'],
    supplementNote: 'Riboflavin-5-phosphate — active form; critical MTHFR cofactor',
    wgsModifiers: ['MTHFR'],
  },
  'riboflavin': {
    dietary: ['lamb', 'sardines', 'mackerel', 'leafy greens'],
    supplementNote: 'Riboflavin-5-phosphate — active form; critical MTHFR cofactor',
    wgsModifiers: ['MTHFR'],
  },
  'magnesium': {
    dietary: ['dark leafy greens', 'pumpkin seeds (check ALCAT)', 'sardines', 'dark chocolate (70%+ if tolerated)'],
    supplementNote: 'Magnesium glycinate or malate — avoid oxide (minimal absorption). Transdermal magnesium as adjunct.',
    mechanismNote: 'Magnesium is cofactor for 300+ enzymatic reactions including ATP synthesis, DNA repair, and methylation. Intracellular depletion is common even with normal serum levels.',
    wgsModifiers: ['TRPM6', 'TRPM7'],
  },
  'zinc': {
    dietary: ['lamb', 'venison', 'turkey', 'pumpkin seeds (check ALCAT)'],
    supplementNote: 'Zinc picolinate or bisglycinate. Take away from iron and calcium. Do not exceed 40mg without monitoring.',
    mechanismNote: 'Zinc depletion impairs mucosal repair, immune regulation, and metallothionein function. Critical for gut lining recovery.',
    wgsModifiers: ['SLC30A8'],
  },
  'vitamin D': {
    dietary: ['sardines', 'mackerel', 'herring', 'trout', 'ghee', 'tallow'],
    supplementNote: 'D3 (cholecalciferol) with K2 (MK-7 form). Fat-soluble — take with largest meal. Co-factors: magnesium, zinc, vitamin A.',
    mechanismNote: 'Vitamin D functions as a hormone, not a vitamin. Receptor activation requires adequate magnesium as cofactor. Supplementing D without correcting magnesium depletion produces suboptimal receptor response.',
    wgsModifiers: ['VDR', 'GC', 'CYP2R1', 'CYP27B1'],
  },
  'vitamin E': {
    dietary: ['olive oil', 'sunflower seeds (check ALCAT)', 'almonds (check ALCAT)'],
    supplementNote: 'Mixed tocopherols and tocotrienols — not alpha-tocopherol alone',
    wgsModifiers: [],
  },
  'vitamin A': {
    dietary: ['liver (highest source)', 'lamb', 'duck', 'ghee'],
    supplementNote: 'Retinol (preformed) — not beta-carotene in patients with poor conversion. Monitor with D supplementation.',
    wgsModifiers: ['BCMO1'],
  },
  'CoQ10': {
    dietary: ['sardines', 'mackerel', 'lamb heart (if tolerated)', 'venison'],
    supplementNote: 'Ubiquinol form (not ubiquinone) for patients over 40 or with mitochondrial dysfunction markers. Take with fat.',
    mechanismNote: 'CoQ10 depletion is accelerated by statin medications. Essential for mitochondrial electron transport chain.',
    wgsModifiers: [],
  },
  'glutathione': {
    dietary: ['broccoli', 'garlic', 'onion (check ALCAT)', 'asparagus'],
    supplementNote: 'Liposomal glutathione or N-acetylcysteine (NAC) as precursor. S-acetyl glutathione for oral bioavailability.',
    mechanismNote: 'Master antioxidant. Depletion indicates high oxidative burden — typically correlates with mucosal inflammation and reactive food load.',
    wgsModifiers: ['GSTP1', 'GSTM1', 'GPX1'],
  },
  'selenium': {
    dietary: ['sardines', 'mackerel', 'turkey', 'lamb'],
    supplementNote: 'Selenomethionine — 100-200mcg range. Do not exceed 400mcg. Essential GPX enzyme cofactor.',
    wgsModifiers: ['GPX1'],
  },
  'iron': {
    dietary: ['lamb', 'venison', 'duck — haem iron only (high bioavailability)', 'sardines'],
    supplementNote: 'Iron bisglycinate — gentlest on gut. Take away from calcium, coffee, tea. Only supplement with confirmed intracellular deficiency — excess iron is pro-inflammatory.',
    mechanismNote: 'Iron deficiency without anaemia is common and significantly impairs mitochondrial function, cognitive performance, and immune regulation.',
    wgsModifiers: ['HFE', 'TMPRSS6'],
  },
  'chromium': {
    dietary: ['broccoli', 'turkey', 'lamb'],
    supplementNote: 'Chromium picolinate or GTF chromium. Particularly relevant for glucose regulation.',
    wgsModifiers: [],
  },
  'calcium': {
    dietary: ['sardines with bones', 'leafy greens', 'ghee'],
    supplementNote: 'Calcium citrate — not carbonate. Co-administer K2 and D3 to direct calcium to bone rather than soft tissue.',
    wgsModifiers: ['VDR'],
  },
  'copper': {
    dietary: ['shellfish', 'liver', 'dark chocolate (post-detox)', 'nuts'],
    supplementNote: 'Only supplement if confirmed deficient. Zinc:copper ratio matters — do not supplement zinc without monitoring copper.',
    wgsModifiers: [],
  },
  'manganese': {
    dietary: ['nuts', 'seeds (check ALCAT)', 'dark leafy greens', 'whole grains (check ALCAT)'],
    supplementNote: 'Manganese bisglycinate. Third SOD cofactor.',
    wgsModifiers: ['SOD2'],
  },
  'vitamin C': {
    dietary: ['bell peppers', 'broccoli', 'kiwi', 'citrus', 'berries', 'dark leafy greens'],
    supplementNote: 'Liposomal vitamin C for higher bioavailability. Regenerates vitamin E and supports collagen synthesis.',
    wgsModifiers: [],
  },
  'alpha-lipoic acid': {
    dietary: ['spinach', 'broccoli', 'organ meats'],
    supplementNote: 'R-alpha-lipoic acid (R-ALA) — active form. Both water and fat-soluble, regenerates vitamins C and E, and recycles glutathione.',
    wgsModifiers: [],
  },
}

function buildCMAGuidanceBlock(patient = {}) {
  const cmaDeficiencies = patient.cmaDeficiencies || []
  const cmaNutrients = patient.cmaNutrients || []
  if (cmaDeficiencies.length === 0 && cmaNutrients.length === 0) return ''

  // Match deficiencies to the dietary map
  const allDeficient = [...cmaDeficiencies]
  cmaNutrients.filter(n => n.status === 'deficient' || n.status === 'low').forEach(n => {
    if (!allDeficient.some(d => d.toLowerCase() === n.name.toLowerCase())) {
      allDeficient.push(n.name)
    }
  })

  const relevantEntries = allDeficient
    .map(d => {
      const key = Object.keys(CMA_DIETARY_MAP).find(k =>
        d.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(d.toLowerCase())
      )
      return key ? { nutrient: d, guidance: CMA_DIETARY_MAP[key] } : null
    })
    .filter(Boolean)

  // Check which WGS modifiers are present
  const genomicGenes = (patient.genomicSnps || []).map(s => s.gene?.toUpperCase())

  return `
════════════════════════════════════════════════════════════════
CMA DEFICIENCY INTERPRETATION — DIETARY & SUPPLEMENTATION GUIDANCE
════════════════════════════════════════════════════════════════

Intracellular deficiencies on file: ${allDeficient.join(', ')}

NOTE: Repletion is only fully effective AFTER mucosal inflammation
from reactive food exposure has been reduced. You cannot correct
intracellular deficiencies through an inflamed, permeable gut wall.

REPLETION SEQUENCE — correct in this order:
1. Magnesium — cofactor for all methylation reactions; correct first
2. B2/Riboflavin — MTHFR cofactor; without it other B-vitamins cannot function
3. B12 and Folate — methylation cycle; must be active forms
4. Zinc — mucosal repair and immune regulation
5. Vitamin D with K2 — hormone system; only after magnesium is corrected
6. All others — based on individual CMA severity scores

${relevantEntries.map(({ nutrient, guidance }) => {
  const hasWgsContext = guidance.wgsModifiers?.some(g => genomicGenes.includes(g.toUpperCase()))
  return `── ${nutrient.toUpperCase()} — DEFICIENT
Dietary priority: ${guidance.dietary.join(', ')}
Supplement form: ${guidance.supplementNote}
${guidance.mechanismNote ? `Mechanism: ${guidance.mechanismNote}` : ''}
${hasWgsContext ? `⚠ WGS MODIFIER ACTIVE: Patient has variant in ${guidance.wgsModifiers.filter(g => genomicGenes.includes(g.toUpperCase())).join(', ')} — deficiency may be structural. See genomic layer for form and dosing modifications.` : ''}`
}).join('\n\n')}
`
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — WGS NUTRIGENOMIC ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const WGS_NUTRIGENOMIC_RULES = [
  {
    gene: 'MTHFR', rsid: 'rs1801133', name: 'C677T',
    clinicalImpact: 'Reduced methylenetetrahydrofolate reductase activity. Homozygous: ~70% reduction. Heterozygous: ~35% reduction.',
    dietaryImplications: [
      'Eliminate all folic acid (synthetic) — fortified foods, most supplements',
      'Prioritise dietary folate: liver, asparagus, leafy greens, beetroot',
      'Riboflavin (B2) is a critical MTHFR cofactor — ensure adequate dietary and supplemental sources',
    ],
    supplementationImplications: [
      'L-5-methylfolate ONLY — never folic acid',
      'Riboflavin-5-phosphate (active B2)',
      'Methylcobalamin or Hydroxy/Adenosylcobalamin',
      'TMG (trimethylglycine) as additional methyl donor',
    ],
    patientExplanation: 'Your MTHFR variant means your cells cannot efficiently convert standard folate into the active form your methylation cycle needs. This affects energy production, detoxification, DNA repair, and neurotransmitter balance. The solution is straightforward — use only the active form directly, which bypasses the conversion step entirely.',
  },
  {
    gene: 'MTHFR', rsid: 'rs1801131', name: 'A1298C',
    clinicalImpact: 'Affects BH4 (tetrahydrobiopterin) production. Impacts neurotransmitter synthesis more than folate metabolism. Compound heterozygous with C677T is clinically significant.',
    dietaryImplications: [
      'Tyrosine-rich foods for dopamine support: turkey, sardines, lean meats',
      'Tryptophan-rich foods for serotonin: turkey, sardines',
      'Antioxidants to protect BH4: blueberries, raspberries, pomegranate',
    ],
    supplementationImplications: [
      'L-5-methylfolate (lower dose range than C677T)',
      'Magnesium for BH4 cofactor support',
      'B6 (P5P) for neurotransmitter synthesis pathway',
    ],
    patientExplanation: 'This variant affects how your brain produces its signalling molecules. Supporting the pathway with the right nutritional building blocks makes a measurable difference to mood, focus, and stress resilience.',
  },
  {
    gene: 'MTRR', rsid: 'rs1801394', name: 'A66G',
    clinicalImpact: 'Impairs B12 recycling. Compounds B12 deficiency significantly.',
    dietaryImplications: [
      'Highest dietary B12 sources critical: lamb, sardines, mackerel, duck',
      'Avoid B12-depleting factors: alcohol, metformin (if prescribed), PPIs',
    ],
    supplementationImplications: [
      'Higher B12 supplementation needed — methylcobalamin or hydroxocobalamin',
      'Consider sublingual or injectable forms if absorption compromised',
      'Riboflavin required as cofactor for MTRR enzyme function',
    ],
    patientExplanation: 'Your body uses B12 in a cycle — after it donates its methyl group, it needs to be recharged. This variant slows that recharging process, meaning you need more B12 input than most people to maintain the same cellular function.',
  },
  {
    gene: 'MTR', rsid: 'rs1805087', name: 'A2756G',
    clinicalImpact: 'Methionine synthase — uses B12 to regenerate methionine. Variant increases need for B12 and folate.',
    dietaryImplications: [
      'B12-rich animal foods priority',
      'Choline-rich foods to support alternative methylation pathway: eggs (if tolerated), liver',
    ],
    supplementationImplications: ['Methylcobalamin', 'L-5-methylfolate', 'Betaine (TMG)'],
    patientExplanation: 'This gene is the engine that converts B12 into an active signal your cells use. The variant means the engine runs at lower efficiency — correctible with the right fuel.',
  },
  {
    gene: 'COMT', rsid: 'rs4680', name: 'Val158Met',
    clinicalImpact: 'Slow COMT (Met/Met) = slower catecholamine and oestrogen clearance = stress sensitivity, oestrogen dominance risk.',
    dietaryImplications: [
      'Cruciferous vegetables support oestrogen metabolism via DIM',
      'Magnesium supports COMT enzyme activity directly',
      'Limit caffeine, alcohol, processed sugars — all elevate catecholamines',
    ],
    supplementationImplications: [
      'Magnesium (COMT requires Mg2+ as cofactor)',
      'Moderate methylation support — not aggressive methyl pushing in slow COMT',
      'B6 (P5P) for transsulfuration support',
    ],
    patientExplanation: 'This variant affects how quickly your brain clears its stimulant signals after stress. Slow COMT means you feel stress more intensely and for longer. The dietary approach supports clearance without overwhelming the system.',
  },
  {
    gene: 'FUT2', rsid: 'rs601338', name: 'Secretor status',
    clinicalImpact: 'Non-secretor = impaired B12 absorption via intrinsic factor. Reduced Bifidobacterium colonisation.',
    dietaryImplications: [
      'B12 from animal sources critical',
      'Prebiotic foods: asparagus, garlic, chicory',
    ],
    supplementationImplications: [
      'Sublingual or intranasal B12 to bypass gut absorption deficit',
      'Probiotic strains targeting Bifidobacterium longum',
    ],
    patientExplanation: 'A gene variant changes how your gut absorbs B12. Standard oral B12 supplements are significantly less effective for you. Sublingual forms go directly into the bloodstream.',
  },
  {
    gene: 'VDR', rsid: 'rs2228570', name: 'Fok1',
    clinicalImpact: 'Vitamin D receptor sensitivity variant. May require higher circulating levels.',
    dietaryImplications: [
      'Dietary D3 sources critical: oily fish, ghee, tallow',
      'Magnesium essential as VDR cofactor',
      'Vitamin A and K2 to support D receptor synergy',
    ],
    supplementationImplications: [
      'Higher D3 target levels may be required',
      'MK-7 form K2 for calcium routing',
      'Magnesium must be corrected first',
    ],
    patientExplanation: 'Your vitamin D receptor works at lower efficiency, meaning you need more vitamin D to achieve the same cellular effect. This is correctable with calibrated dosing.',
  },
  {
    gene: 'GSTP1', rsid: 'rs1695', name: 'Ile105Val',
    clinicalImpact: 'Reduced glutathione S-transferase activity. Impairs Phase II detoxification.',
    dietaryImplications: [
      'Cruciferous vegetables mandatory: broccoli, kale, cauliflower, cabbage',
      'Sulphur-rich foods: garlic, onion (check ALCAT)',
      'Limit environmental toxin exposure',
    ],
    supplementationImplications: [
      'N-acetylcysteine (NAC) as glutathione precursor',
      'Liposomal glutathione',
      'Alpha-lipoic acid',
      'Selenium for GPX enzyme support',
    ],
    patientExplanation: 'Your Phase II detox pathway runs at reduced capacity. Your liver needs extra nutritional support to clear toxins and reactive compounds efficiently.',
  },
  {
    gene: 'SOD2', rsid: 'rs4880', name: 'Val16Ala',
    clinicalImpact: 'Impaired mitochondrial superoxide dismutase transport. Increases mitochondrial oxidative stress.',
    dietaryImplications: [
      'Antioxidant-dense foods: blueberries, raspberries, pomegranate',
      'Manganese sources: leafy greens, hazelnuts (check ALCAT)',
      'Avoid seed oils — increase oxidative load at mitochondrial membrane',
    ],
    supplementationImplications: [
      'CoQ10 (ubiquinol form) — mitochondrial membrane protection',
      'Manganese bisglycinate',
      'Magnesium for mitochondrial membrane function',
    ],
    patientExplanation: 'Inside every cell, your mitochondria need antioxidant protection. This variant reduces that protection, meaning higher susceptibility to oxidative fatigue.',
  },
  {
    gene: 'BCMO1', rsid: 'rs12934922', name: 'Beta-carotene conversion',
    clinicalImpact: 'Impairs conversion of plant beta-carotene to active retinol (vitamin A) by up to 70%.',
    dietaryImplications: [
      'Preformed retinol sources essential: liver, duck, lamb, ghee',
      'Do NOT rely on carrots, sweet potato, peppers for vitamin A',
    ],
    supplementationImplications: [
      'Retinol (preformed vitamin A) — not beta-carotene supplements',
      'Coordinate with vitamin D — D and A interact at the receptor level',
    ],
    patientExplanation: 'You carry a variant that severely limits your ability to convert the orange/yellow plant pigment into vitamin A. Your vitamin A can only come reliably from animal sources.',
  },
  {
    gene: 'FADS1', rsid: 'rs174547', name: 'Fatty acid desaturase',
    clinicalImpact: 'Impairs conversion of ALA (plant omega-3) to EPA/DHA. Plant omega-3 sources are insufficient.',
    dietaryImplications: [
      'Direct EPA/DHA mandatory: fatty fish 3-4x/week minimum',
      'Plant omega-3 (flax, chia, walnuts) will NOT convert adequately',
    ],
    supplementationImplications: [
      'Fish oil or algal DHA supplement',
      'Direct EPA/DHA — not ALA-based omega-3',
    ],
    patientExplanation: 'Your body cannot efficiently convert plant-based omega-3 into the forms your brain and immune system actually use. You need direct EPA and DHA from fish or marine sources.',
  },
  {
    gene: 'ACTN3', rsid: 'rs1815739', name: 'R577X',
    clinicalImpact: 'Alpha-actinin-3 — fast-twitch muscle protein. XX = no alpha-actinin-3 = endurance advantage, reduced power/sprint capacity.',
    dietaryImplications: [
      'XX: higher carbohydrate tolerance for endurance fuel',
      'RR: higher protein needs for muscle recovery from power training',
    ],
    supplementationImplications: [
      'XX: magnesium and electrolytes for endurance recovery',
      'RR: creatine monohydrate, higher protein intake post-training',
    ],
    patientExplanation: 'This gene determines whether your muscles are wired for endurance or power. It tells us which type of training your body responds to best and how to fuel it.',
  },
  {
    gene: 'HFE', rsid: 'rs1800562', name: 'C282Y',
    clinicalImpact: 'Hereditary hemochromatosis. Iron overload damages gut mucosa and feeds pathogenic bacteria.',
    dietaryImplications: [
      'REDUCE iron-rich food frequency (red meat 2x/week max)',
      'No iron supplementation without ferritin testing',
      'Avoid vitamin C with iron-rich meals (enhances absorption)',
    ],
    supplementationImplications: [
      'No iron supplements',
      'Curcumin and green tea (iron chelation properties)',
      'Monitor ferritin regularly',
    ],
    patientExplanation: 'Your body absorbs iron too efficiently. Excess iron generates free radicals and feeds harmful gut bacteria. We manage this by controlling iron intake precisely.',
  },
]

function buildWGSNutrigenomicBlock(patient = {}) {
  const variants = patient.genomicSnps || patient.wgsVariants || []
  if (variants.length === 0) return ''

  const matchedRules = WGS_NUTRIGENOMIC_RULES.filter(rule =>
    variants.some(v => {
      const gene = (v.gene || '').toUpperCase()
      const rsid = (v.rsid || '').toLowerCase()
      return gene === rule.gene.toUpperCase() ||
             rsid === rule.rsid.toLowerCase()
    })
  )

  if (matchedRules.length === 0) return ''

  // Get actual genotypes for matched variants
  const getGenotype = (rule) => {
    const v = variants.find(v =>
      (v.gene || '').toUpperCase() === rule.gene.toUpperCase() ||
      (v.rsid || '').toLowerCase() === rule.rsid.toLowerCase()
    )
    return v ? `${v.genotype} [${v.status}]` : ''
  }

  return `
════════════════════════════════════════════════════════════════
WGS NUTRIGENOMIC INTERPRETATION — STRUCTURAL BIOLOGY CONTEXT
════════════════════════════════════════════════════════════════

The following genomic variants are clinically relevant. These are
PERMANENT genetic architecture factors — they do not change.

Mario uses this layer to explain WHY certain deficiencies persist
and to specify which FORMS of nutrients are metabolically active
for this patient's specific genome.

${matchedRules.map(rule => `
── ${rule.gene} — ${rule.name} (${rule.rsid}) ${getGenotype(rule)}
Clinical: ${rule.clinicalImpact}

Dietary:
${rule.dietaryImplications.map(d => `  → ${d}`).join('\n')}

Supplementation:
${rule.supplementationImplications.map(s => `  → ${s}`).join('\n')}

Patient explanation template:
"${rule.patientExplanation}"
`).join('\n')}

NUTRIGENOMIC INTEGRATION PRINCIPLE:
CMA tells you WHAT is deficient. WGS tells you WHY and HOW to correct it.
Example: CMA shows low B12 → WGS shows FUT2 non-secretor → Mario
recommends sublingual methylcobalamin specifically, not standard oral.
This is the precision that population-level guidance cannot replicate.
`
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — MAIN GUIDANCE BLOCK BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function buildGuidanceEngineBlock(patient = {}) {
  const tier = detectPatientTier(patient)

  const statisticalBlock = (tier === 'B' || tier === 'C' || tier === 'D')
    ? buildStatisticalGuidanceBlock()
    : ''

  const cmaBlock = buildCMAGuidanceBlock(patient)
  const wgsBlock = buildWGSNutrigenomicBlock(patient)

  const tierLabel = {
    'A': 'TIER A — Full panel (ALCAT + CMA + WGS): Individual reactivity data drives all guidance',
    'B': 'TIER B — CMA + WGS (no ALCAT): Statistical immune guidance + cellular + nutrigenomic precision',
    'C': 'TIER C — Partial data: Statistical immune guidance + available test data',
    'D': 'TIER D — No tests yet: Statistical population guidance only — natural ALCAT upsell pathway',
  }[tier]

  return `
════════════════════════════════════════════════════════════════
GUIDANCE ENGINE — PATIENT DIAGNOSTIC TIER: ${tier}
════════════════════════════════════════════════════════════════
${tierLabel}
${statisticalBlock}
${cmaBlock}
${wgsBlock}
${tier === 'D' ? `
SUBSCRIPTION CONTEXT:
This patient is on the statistical guidance pathway. The natural upsell:
  Step 1 — Statistical removal begins gut integrity restoration (now)
  Step 2 — CMA confirms what needs replenishing at cellular level
  Step 3 — ALCAT confirms individual reactive foods precisely
  Step 4 — WGS explains structural reasons for persistent deficiencies
Frame positively: "We are working with excellent clinical intelligence
right now. Testing will give us your precise individual map."
` : ''}
${tier === 'C' ? `
PARTIAL DATA: Mario integrates what is available. Natural upsell:
"To complete the picture, [missing test] would allow us to [specific
clinical benefit]. Your current protocol already has strong foundations."
` : ''}
${tier === 'B' ? `
CMA + WGS available — precision cellular and genomic intelligence.
Statistical ALCAT data fills the immune reactivity layer. Natural ALCAT
upsell: "ALCAT would confirm your individual reactive foods precisely."
` : ''}
`
}
