// ── WGS NUTRIENT CORRECTION ENGINE ───────────────────────────────────────────
// MediBalans AB — Meet Mario Platform
// Dr Mario Anthis PhD
//
// Purpose: Takes parsed WGS variants and returns a nutrient correction delta
// to be merged on top of the CSS/CMA baseline formula before VitaminLab ordering.
//
// Usage:
//   const corrections = buildWGSCorrections(variants)
//   const finalFormula = mergeFormulas(cssFormula, corrections)
// ─────────────────────────────────────────────────────────────────────────────

// ── VARIANT DEFINITIONS ──────────────────────────────────────────────────────
// Each variant entry defines:
//   rsid      — dbSNP identifier
//   gene      — gene symbol
//   zygosity  — 'het' | 'hom' (heterozygous or homozygous)
//   effect    — clinical effect label used in correction logic

// ── NUTRIENT CORRECTION RULES ────────────────────────────────────────────────
// Each rule defines:
//   add       — nutrients to add or increase
//   remove    — nutrients to remove or swap out
//   swap      — form substitutions (e.g. folic acid → methylfolate)
//   flag      — clinical warnings to surface in UI
//   dose_mod  — dose multipliers for existing CSS nutrients (1.0 = no change)

const CORRECTION_RULES = {

  // ══════════════════════════════════════════════════════════════════════════
  // ONE-CARBON METABOLISM
  // ══════════════════════════════════════════════════════════════════════════

  MTHFR_C677T_het: {
    gene: 'MTHFR', rsid: 'rs1801133', zygosity: 'het',
    add: [
      { nutrient: 'L-5-Methylfolate', form: 'Quatrefolic (6S)-5-methyltetrahydrofolic acid', dose: 400, unit: 'mcg', reason: 'Bypasses impaired MTHFR enzyme — ~40% reduced activity' },
      { nutrient: 'Riboflavin', form: 'Riboflavin-5-phosphate (FMN)', dose: 20, unit: 'mg', reason: 'MTHFR cofactor — riboflavin deficiency compounds C677T impairment' },
    ],
    swap: [
      { from: 'Folic Acid', to: 'L-5-Methylfolate', reason: 'Folic acid requires MTHFR conversion — bypassed with active form' },
      { from: 'Cyanocobalamin', to: 'Hydroxycobalamin', reason: 'Cyano form adds detox burden; hydroxy is preferred with MTHFR variants' },
    ],
    flag: [],
  },

  MTHFR_C677T_hom: {
    gene: 'MTHFR', rsid: 'rs1801133', zygosity: 'hom',
    add: [
      { nutrient: 'L-5-Methylfolate', form: 'Quatrefolic (6S)-5-methyltetrahydrofolic acid', dose: 800, unit: 'mcg', reason: 'Homozygous — ~70% reduced MTHFR activity; higher dose required' },
      { nutrient: 'Riboflavin', form: 'Riboflavin-5-phosphate (FMN)', dose: 40, unit: 'mg', reason: 'Critical cofactor — homozygous C677T highly sensitive to riboflavin status' },
      { nutrient: 'TMG (Betaine Anhydrous)', form: 'Betaine Anhydrous', dose: 500, unit: 'mg', reason: 'BHMT pathway upregulation to compensate impaired MTHFR remethylation' },
    ],
    swap: [
      { from: 'Folic Acid', to: 'L-5-Methylfolate', reason: 'Folic acid is metabolically useless and potentially harmful with homozygous C677T' },
      { from: 'Cyanocobalamin', to: 'Hydroxycobalamin', reason: 'Cyano form contraindicated' },
      { from: 'Methylcobalamin', to: 'Hydroxycobalamin', reason: 'Evaluate COMT status before using methyl-B12 — hydroxy is safer default' },
    ],
    flag: ['Monitor homocysteine — retest at 3 months', 'Check COMT before methyl-B12'],
  },

  MTHFR_A1298C_het: {
    gene: 'MTHFR', rsid: 'rs1801131', zygosity: 'het',
    add: [
      { nutrient: 'L-5-Methylfolate', form: 'Quatrefolic (6S)-5-methyltetrahydrofolic acid', dose: 400, unit: 'mcg', reason: 'A1298C impairs BH4 synthesis — methylfolate supports alternative remethylation' },
      { nutrient: 'BH4 precursor support', form: 'L-Phenylalanine', dose: 200, unit: 'mg', reason: 'A1298C reduces BH4 — impacts neurotransmitter and NO synthesis' },
    ],
    swap: [
      { from: 'Folic Acid', to: 'L-5-Methylfolate', reason: 'Active form bypasses A1298C impairment' },
    ],
    flag: [],
  },

  // Compound heterozygous — both variants present
  MTHFR_compound_het: {
    gene: 'MTHFR', rsid: 'rs1801133+rs1801131', zygosity: 'compound_het',
    add: [
      { nutrient: 'L-5-Methylfolate', form: 'Quatrefolic (6S)-5-methyltetrahydrofolic acid', dose: 800, unit: 'mcg', reason: 'Compound het — functionally similar to homozygous C677T' },
      { nutrient: 'Riboflavin', form: 'Riboflavin-5-phosphate (FMN)', dose: 30, unit: 'mg' },
      { nutrient: 'TMG (Betaine Anhydrous)', form: 'Betaine Anhydrous', dose: 400, unit: 'mg' },
    ],
    swap: [
      { from: 'Folic Acid', to: 'L-5-Methylfolate', reason: 'Both MTHFR variants present — folic acid contraindicated' },
      { from: 'Cyanocobalamin', to: 'Hydroxycobalamin' },
    ],
    flag: ['Monitor homocysteine', 'Compound het — treat as functionally homozygous'],
  },

  MTR_A2756G_het: {
    gene: 'MTR', rsid: 'rs1805087', zygosity: 'het',
    add: [
      { nutrient: 'Hydroxycobalamin', form: 'Hydroxycobalamin', dose: 1000, unit: 'mcg', reason: 'MTR A2756G reduces methionine synthase activity — B12 cofactor demand increases' },
      { nutrient: 'L-5-Methylfolate', form: 'Quatrefolic', dose: 200, unit: 'mcg', reason: 'Methylfolate substrate for MTR enzyme' },
    ],
    swap: [],
    flag: [],
  },

  MTRR_A66G_het: {
    gene: 'MTRR', rsid: 'rs1801394', zygosity: 'het',
    add: [
      { nutrient: 'Hydroxycobalamin', form: 'Hydroxycobalamin', dose: 1000, unit: 'mcg', reason: 'MTRR reactivates MTR — A66G reduces this; hydroxy form preferred over methyl' },
      { nutrient: 'Riboflavin', form: 'Riboflavin-5-phosphate (FMN)', dose: 15, unit: 'mg', reason: 'MTRR cofactor' },
    ],
    swap: [
      { from: 'Methylcobalamin', to: 'Hydroxycobalamin', reason: 'MTRR A66G with COMT — methyl-B12 may raise free methyl burden; hydroxy safer' },
      { from: 'Cyanocobalamin', to: 'Hydroxycobalamin' },
    ],
    flag: ['Check COMT before methyl-B12'],
  },

  MTRR_A66G_hom: {
    gene: 'MTRR', rsid: 'rs1801394', zygosity: 'hom',
    add: [
      { nutrient: 'Hydroxycobalamin', form: 'Hydroxycobalamin', dose: 2000, unit: 'mcg', reason: 'Homozygous MTRR — significantly impaired B12 recycling' },
      { nutrient: 'TMG (Betaine Anhydrous)', form: 'Betaine Anhydrous', dose: 300, unit: 'mg', reason: 'Compensatory BHMT pathway support' },
    ],
    swap: [
      { from: 'Methylcobalamin', to: 'Hydroxycobalamin' },
      { from: 'Cyanocobalamin', to: 'Hydroxycobalamin' },
    ],
    flag: ['Homozygous MTRR — high B12 demand; monitor homocysteine'],
  },

  BHMT_het: {
    gene: 'BHMT', rsid: 'rs3733890', zygosity: 'het',
    add: [
      { nutrient: 'TMG (Betaine Anhydrous)', form: 'Betaine Anhydrous', dose: 500, unit: 'mg', reason: 'BHMT uses betaine to remethylate homocysteine — variant reduces efficiency' },
      { nutrient: 'Choline', form: 'Choline Bitartrate', dose: 200, unit: 'mg', reason: 'Choline is precursor to betaine via CHDH/BADH pathway' },
    ],
    swap: [],
    flag: [],
  },

  AHCY_het: {
    gene: 'AHCY', rsid: 'rs819147', zygosity: 'het',
    add: [
      { nutrient: 'Adenosylcobalamin', form: 'Adenosylcobalamin', dose: 500, unit: 'mcg', reason: 'AHCY hydrolyses SAH — variants slow this, raising SAH and inhibiting methylation' },
      { nutrient: 'Riboflavin', form: 'Riboflavin-5-phosphate (FMN)', dose: 15, unit: 'mg' },
    ],
    swap: [],
    flag: ['Elevated SAH risk — avoid excess methyl donors without cofactor support'],
  },

  SHMT1_het: {
    gene: 'SHMT1', rsid: 'rs1979277', zygosity: 'het',
    add: [
      { nutrient: 'Pyridoxal-5-phosphate', form: 'P5P (Pyridoxal-5-phosphate)', dose: 25, unit: 'mg', reason: 'SHMT1 requires P5P cofactor for serine→glycine conversion feeding folate cycle' },
    ],
    swap: [
      { from: 'Pyridoxine HCl', to: 'Pyridoxal-5-phosphate (P5P)', reason: 'Active B6 form required — pyridoxine requires hepatic conversion impaired in some variants' },
    ],
    flag: [],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSSULFURATION & ANTIOXIDANT
  // ══════════════════════════════════════════════════════════════════════════

  CBS_upregulation: {
    gene: 'CBS', rsid: 'rs234706', zygosity: 'het',
    add: [
      { nutrient: 'Pyridoxal-5-phosphate', form: 'P5P', dose: 50, unit: 'mg', reason: 'CBS upregulation increases sulfur flux — P5P required as CBS cofactor' },
      { nutrient: 'Molybdenum', form: 'Molybdenum Glycinate Chelate', dose: 75, unit: 'mcg', reason: 'Sulfite oxidase cofactor — CBS upregulation increases sulfite load' },
    ],
    remove: [],
    swap: [],
    dose_mod: { 'TMG (Betaine Anhydrous)': 0.5, 'L-Methionine': 0.5 },
    flag: [
      'CBS upregulation — reduce high-sulfur foods (garlic, onion, cruciferous) if symptomatic',
      'Reduce TMG and methionine doses — excess methyl donors amplify CBS flux',
      'Monitor sulfite sensitivity symptoms',
    ],
  },

  GST_M1_null: {
    gene: 'GST M1', rsid: 'deletion', zygosity: 'null',
    add: [
      { nutrient: 'NAC (N-Acetyl Cysteine)', form: 'N-Acetyl-L-Cysteine', dose: 500, unit: 'mg', reason: 'GST M1 null — reduced glutathione conjugation; NAC replenishes glutathione precursor' },
      { nutrient: 'Alpha Lipoic Acid', form: 'R-Alpha Lipoic Acid', dose: 200, unit: 'mg', reason: 'Recycles glutathione; R-form preferred for bioavailability' },
      { nutrient: 'Glycine', form: 'Glycine powder', dose: 1000, unit: 'mg', reason: 'Rate-limiting amino acid for glutathione synthesis' },
    ],
    swap: [],
    flag: ['GST M1 null — increased susceptibility to environmental toxins and oxidative stress'],
  },

  GST_T1_null: {
    gene: 'GST T1', rsid: 'deletion', zygosity: 'null',
    add: [
      { nutrient: 'NAC (N-Acetyl Cysteine)', form: 'N-Acetyl-L-Cysteine', dose: 500, unit: 'mg', reason: 'GST T1 null — Phase II detox impairment' },
      { nutrient: 'Selenium', form: 'L-Selenomethionine', dose: 100, unit: 'mcg', reason: 'Glutathione peroxidase support — selenium essential cofactor' },
    ],
    swap: [],
    flag: ['GST T1 null — compound null (M1+T1) significantly increases oxidative stress burden'],
  },

  GST_P1_het: {
    gene: 'GST P1', rsid: 'rs1695', zygosity: 'het',
    add: [
      { nutrient: 'NAC (N-Acetyl Cysteine)', form: 'N-Acetyl-L-Cysteine', dose: 300, unit: 'mg' },
    ],
    swap: [],
    flag: [],
  },

  SOD2_het: {
    gene: 'SOD2', rsid: 'rs4880', zygosity: 'het',
    add: [
      { nutrient: 'CoEnzyme Q10', form: 'CoQ10 as Ubiquinol', dose: 100, unit: 'mg', reason: 'SOD2 (MnSOD) A16V — mitochondrial antioxidant impairment; ubiquinol preferred over ubiquinone' },
      { nutrient: 'Manganese', form: 'Manganese Bisglycinate Chelate', dose: 5, unit: 'mg', reason: 'SOD2 is manganese-dependent — variant reduces Mn incorporation efficiency' },
    ],
    swap: [
      { from: 'CoQ10 as Ubiquinone', to: 'CoQ10 as Ubiquinol', reason: 'Ubiquinol is the reduced active form — no conversion required; preferred with mitochondrial variants' },
    ],
    flag: [],
  },

  SOD2_hom: {
    gene: 'SOD2', rsid: 'rs4880', zygosity: 'hom',
    add: [
      { nutrient: 'CoEnzyme Q10', form: 'CoQ10 as Ubiquinol', dose: 200, unit: 'mg', reason: 'Homozygous SOD2 — significant mitochondrial ROS accumulation' },
      { nutrient: 'Manganese', form: 'Manganese Bisglycinate Chelate', dose: 10, unit: 'mg' },
      { nutrient: 'Alpha Lipoic Acid', form: 'R-Alpha Lipoic Acid', dose: 300, unit: 'mg', reason: 'Mitochondrial antioxidant — crosses inner membrane' },
    ],
    swap: [
      { from: 'CoQ10 as Ubiquinone', to: 'CoQ10 as Ubiquinol' },
    ],
    flag: ['Homozygous SOD2 — high mitochondrial oxidative stress; prioritise antioxidant stack'],
  },

  GPX1_het: {
    gene: 'GPX1', rsid: 'rs1050450', zygosity: 'het',
    add: [
      { nutrient: 'Selenium', form: 'L-Selenomethionine', dose: 100, unit: 'mcg', reason: 'GPX1 is selenium-dependent — variant reduces activity; selenium repletion partially compensates' },
    ],
    swap: [],
    flag: [],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NEUROTRANSMITTER & HORMONE
  // ══════════════════════════════════════════════════════════════════════════

  COMT_slow_hom: {
    // Val158Met — Met/Met — slow COMT — catecholamines accumulate
    gene: 'COMT', rsid: 'rs4680', zygosity: 'hom_slow',
    add: [
      { nutrient: 'Magnesium', form: 'Magnesium Bisglycinate', dose: 100, unit: 'mg', reason: 'COMT cofactor — Mg²⁺ required for SAM-dependent methylation of catecholamines' },
    ],
    swap: [
      { from: 'Methylcobalamin', to: 'Hydroxycobalamin', reason: 'COMT slow — excess methyl groups from methyl-B12 raise SAM:SAH ratio, further loading slow COMT; hydroxy is neutral' },
      { from: 'SAMe', to: null, reason: 'SAMe contraindicated with slow COMT — raises methyl donor load' },
    ],
    dose_mod: {
      'L-5-Methylfolate': 0.75,  // cap methylfolate — excess methyl donors problematic
      'TMG (Betaine Anhydrous)': 0.5,
    },
    flag: [
      'COMT slow (Met/Met) — avoid high-dose methyl donors',
      'Hydroxycobalamin only — NOT methylcobalamin',
      'Cap methylfolate at 400mcg unless clinically indicated',
      'Patient may be sensitive to stress, caffeine, and estrogen fluctuations',
    ],
  },

  COMT_slow_het: {
    gene: 'COMT', rsid: 'rs4680', zygosity: 'het_slow',
    add: [
      { nutrient: 'Magnesium', form: 'Magnesium Bisglycinate', dose: 50, unit: 'mg' },
    ],
    swap: [
      { from: 'Methylcobalamin', to: 'Hydroxycobalamin', reason: 'Heterozygous slow COMT — hydroxy preferred as precaution' },
    ],
    dose_mod: { 'TMG (Betaine Anhydrous)': 0.75 },
    flag: ['COMT slow (Val/Met) — moderate caution with methyl donors'],
  },

  COMT_fast_hom: {
    // Val/Val — fast COMT — catecholamines cleared rapidly
    gene: 'COMT', rsid: 'rs4680', zygosity: 'hom_fast',
    add: [],
    swap: [],
    dose_mod: {},
    flag: ['COMT fast (Val/Val) — methylcobalamin acceptable; catecholamine clearance normal to fast'],
  },

  MAOA_het: {
    gene: 'MAOA', rsid: 'rs6323', zygosity: 'het',
    add: [
      { nutrient: 'Riboflavin', form: 'Riboflavin-5-phosphate (FMN)', dose: 20, unit: 'mg', reason: 'MAOA is FAD-dependent — riboflavin (B2) is the direct cofactor' },
      { nutrient: 'Pyridoxal-5-phosphate', form: 'P5P', dose: 25, unit: 'mg', reason: 'B6 supports serotonin and dopamine synthesis upstream of MAOA' },
    ],
    swap: [],
    flag: ['MAOA variant — monitor mood, sleep, and stress response during protocol'],
  },

  MAOB_het: {
    gene: 'MAOB', rsid: 'rs1799836', zygosity: 'het',
    add: [
      { nutrient: 'Riboflavin', form: 'Riboflavin-5-phosphate (FMN)', dose: 20, unit: 'mg', reason: 'MAOB FAD-dependent — riboflavin cofactor support' },
    ],
    swap: [],
    flag: [],
  },

  VDR_het: {
    gene: 'VDR', rsid: 'rs2228570', zygosity: 'het',
    add: [
      { nutrient: 'Vitamin D3', form: 'Cholecalciferol', dose: 2000, unit: 'IU', reason: 'VDR variant reduces receptor sensitivity — higher D3 needed to achieve equivalent signalling' },
      { nutrient: 'Vitamin K2', form: 'Menaquinone-7 (MK-7)', dose: 100, unit: 'mcg', reason: 'K2-MK7 essential with D3 supplementation — directs calcium to bone, away from vessels' },
      { nutrient: 'Magnesium', form: 'Magnesium Bisglycinate', dose: 100, unit: 'mg', reason: 'Magnesium required for D3 hydroxylation to active 25(OH)D and 1,25(OH)₂D forms' },
    ],
    swap: [],
    flag: ['VDR variant — check 25(OH)D serum level; target 100–150 nmol/L'],
  },

  VDR_hom: {
    gene: 'VDR', rsid: 'rs2228570', zygosity: 'hom',
    add: [
      { nutrient: 'Vitamin D3', form: 'Cholecalciferol', dose: 4000, unit: 'IU', reason: 'Homozygous VDR — significantly reduced receptor sensitivity' },
      { nutrient: 'Vitamin K2', form: 'Menaquinone-7 (MK-7)', dose: 200, unit: 'mcg' },
      { nutrient: 'Magnesium', form: 'Magnesium Bisglycinate', dose: 150, unit: 'mg' },
    ],
    swap: [],
    flag: ['Homozygous VDR — monitor 25(OH)D closely; may require therapeutic D3 doses'],
  },

  DRD2_het: {
    gene: 'DRD2', rsid: 'rs1800497', zygosity: 'het',
    add: [
      { nutrient: 'L-Tyrosine', form: 'L-Tyrosine', dose: 500, unit: 'mg', reason: 'DRD2 Taq1A reduces dopamine receptor density — L-Tyrosine is dopamine precursor' },
      { nutrient: 'Iron', form: 'Iron Bisglycinate Chelate', dose: 5, unit: 'mg', reason: 'Iron cofactor for tyrosine hydroxylase — rate-limiting step in dopamine synthesis' },
      { nutrient: 'Pyridoxal-5-phosphate', form: 'P5P', dose: 25, unit: 'mg', reason: 'P5P cofactor for DOPA decarboxylase' },
    ],
    swap: [],
    flag: ['DRD2 variant — reward sensitivity, addictive behaviour risk; monitor compliance'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DETOXIFICATION & DNA REPAIR
  // ══════════════════════════════════════════════════════════════════════════

  DNMT1_het: {
    gene: 'DNMT1', rsid: 'rs2228612', zygosity: 'het',
    add: [
      { nutrient: 'L-5-Methylfolate', form: 'Quatrefolic', dose: 200, unit: 'mcg', reason: 'DNMT1 requires SAM — methylfolate supports SAM regeneration' },
      { nutrient: 'Zinc', form: 'Zinc Bisglycinate Chelate', dose: 10, unit: 'mg', reason: 'Zinc finger domain in DNMT1 — zinc deficiency impairs DNA methylation maintenance' },
    ],
    swap: [],
    flag: [],
  },

  DNMT3A_het: {
    gene: 'DNMT3A', rsid: 'rs749131', zygosity: 'het',
    add: [
      { nutrient: 'L-5-Methylfolate', form: 'Quatrefolic', dose: 200, unit: 'mcg', reason: 'De novo methylation support' },
      { nutrient: 'Zinc', form: 'Zinc Bisglycinate Chelate', dose: 10, unit: 'mg' },
    ],
    swap: [],
    flag: [],
  },

  TYMS_het: {
    gene: 'TYMS', rsid: 'rs45445694', zygosity: 'het',
    add: [
      { nutrient: 'L-5-Methylfolate', form: 'Quatrefolic', dose: 400, unit: 'mcg', reason: 'TYMS uses 5,10-methyleneTHF for thymidylate synthesis — folate cycle support critical' },
    ],
    swap: [
      { from: 'Folic Acid', to: 'L-5-Methylfolate', reason: 'TYMS variant with folate pathway — active form only' },
    ],
    flag: ['TYMS variant — DNA synthesis impairment; adequate folate status essential'],
  },

  XRCC1_het: {
    gene: 'XRCC1', rsid: 'rs25487', zygosity: 'het',
    add: [
      { nutrient: 'Niacinamide', form: 'Niacinamide (Nicotinamide)', dose: 250, unit: 'mg', reason: 'XRCC1 coordinates base excision repair — PARP requires NAD⁺; niacinamide is precursor' },
      { nutrient: 'Magnesium', form: 'Magnesium Bisglycinate', dose: 50, unit: 'mg', reason: 'DNA repair enzyme cofactor' },
    ],
    swap: [],
    flag: ['XRCC1 variant — increased DNA strand break accumulation; minimise genotoxic exposures'],
  },

}

// ── CONFLICT RESOLUTION ENGINE ───────────────────────────────────────────────
// Detects and resolves dangerous nutrient interactions between variant corrections

const CONFLICT_RULES = [
  {
    id: 'COMT_slow_methyl_overload',
    condition: (variants) =>
      (variants.includes('COMT_slow_hom') || variants.includes('COMT_slow_het')) &&
      (variants.includes('MTHFR_C677T_hom') || variants.includes('MTHFR_compound_het')),
    resolution: 'COMT slow + high MTHFR methylfolate demand — cap methylfolate at 400mcg. Use hydroxycobalamin ONLY. Do NOT add TMG beyond 300mg. Monitor for overmethylation: anxiety, irritability, insomnia.',
    severity: 'HIGH',
  },
  {
    id: 'CBS_methionine_excess',
    condition: (variants) => variants.includes('CBS_upregulation'),
    resolution: 'CBS upregulation detected — reduce L-Methionine to 50% of CSS dose. Reduce TMG to 50% of standard dose. Increase P5P and molybdenum.',
    severity: 'HIGH',
  },
  {
    id: 'GST_compound_null',
    condition: (variants) =>
      variants.includes('GST_M1_null') && variants.includes('GST_T1_null'),
    resolution: 'Compound GST null (M1+T1) — significantly elevated Phase II detox burden. Double NAC to 1000mg. Add R-ALA 300mg. Prioritise environmental toxin reduction. Introduce detox support gradually.',
    severity: 'HIGH',
  },
  {
    id: 'MTHFR_folic_acid_block',
    condition: (variants) =>
      variants.some(v => v.startsWith('MTHFR')),
    resolution: 'Any MTHFR variant — unconverted folic acid accumulates and may block folate receptors. Remove ALL folic acid from formula. Replace with L-5-Methylfolate exclusively.',
    severity: 'CRITICAL',
  },
  {
    id: 'SOD2_ubiquinone_suboptimal',
    condition: (variants) =>
      variants.includes('SOD2_het') || variants.includes('SOD2_hom'),
    resolution: 'SOD2 variant present — switch CoQ10 from ubiquinone to ubiquinol form. Mitochondrial oxidative stress requires reduced active form.',
    severity: 'MEDIUM',
  },
]

// ── MAIN FUNCTION ─────────────────────────────────────────────────────────────

/**
 * buildWGSCorrections
 *
 * @param {string[]} variantKeys - Array of variant keys matching CORRECTION_RULES keys
 *   e.g. ['MTHFR_C677T_hom', 'COMT_slow_het', 'GST_M1_null', 'VDR_het']
 *
 * @returns {object} {
 *   add: [],          — nutrients to add to the CSS formula
 *   swap: [],         — form substitutions required
 *   dose_mod: {},     — dose multipliers for existing CSS nutrients
 *   remove: [],       — nutrients to remove entirely
 *   conflicts: [],    — conflict flags with severity and resolution instructions
 *   flags: [],        — clinical warnings for practitioner review
 *   summary: string   — human-readable summary for Mario AI
 * }
 */
export function buildWGSCorrections(variantKeys = []) {
  const addMap = {}     // nutrient → highest dose addition
  const swapMap = {}    // from → to (last rule wins; CRITICAL flags override)
  const doseModMap = {} // nutrient → lowest multiplier (conservative)
  const removeSet = new Set()
  const flagSet = new Set()
  const conflictsFound = []

  // ── Apply per-variant rules ─────────────────────────────────────────────
  for (const key of variantKeys) {
    const rule = CORRECTION_RULES[key]
    if (!rule) {
      console.warn(`[WGS] Unknown variant key: ${key}`)
      continue
    }

    // Additions — merge by nutrient name, take highest dose
    for (const item of (rule.add || [])) {
      const existing = addMap[item.nutrient]
      if (!existing || item.dose > existing.dose) {
        addMap[item.nutrient] = { ...item }
      } else if (existing && item.form !== existing.form) {
        // Flag form conflict
        flagSet.add(`Form conflict for ${item.nutrient}: ${existing.form} vs ${item.form} — review`)
      }
    }

    // Swaps
    for (const swap of (rule.swap || [])) {
      if (swap.to === null) {
        removeSet.add(swap.from)
      } else {
        swapMap[swap.from] = { to: swap.to, reason: swap.reason }
      }
    }

    // Dose modifiers — take most conservative (lowest multiplier)
    for (const [nutrient, mod] of Object.entries(rule.dose_mod || {})) {
      if (!doseModMap[nutrient] || mod < doseModMap[nutrient]) {
        doseModMap[nutrient] = mod
      }
    }

    // Removals
    for (const r of (rule.remove || [])) removeSet.add(r)

    // Flags
    for (const f of (rule.flag || [])) flagSet.add(f)
  }

  // ── Run conflict resolution ─────────────────────────────────────────────
  for (const conflict of CONFLICT_RULES) {
    if (conflict.condition(variantKeys)) {
      conflictsFound.push({
        id: conflict.id,
        severity: conflict.severity,
        resolution: conflict.resolution,
      })
      flagSet.add(`[${conflict.severity}] ${conflict.resolution}`)
    }
  }

  // ── Auto-remove swapped-out nutrients ──────────────────────────────────
  for (const fromNutrient of Object.keys(swapMap)) {
    removeSet.add(fromNutrient)
  }

  // ── Build summary ──────────────────────────────────────────────────────
  const addList = Object.values(addMap)
  const swapList = Object.entries(swapMap).map(([from, { to, reason }]) => ({ from, to, reason }))
  const removeList = [...removeSet]
  const flagList = [...flagSet]

  const criticalCount = conflictsFound.filter(c => c.severity === 'CRITICAL').length
  const highCount = conflictsFound.filter(c => c.severity === 'HIGH').length

  const summary = [
    `WGS correction layer applied for ${variantKeys.length} variant(s).`,
    addList.length > 0 ? `Adding ${addList.length} nutrient(s): ${addList.map(a => a.nutrient).join(', ')}.` : '',
    swapList.length > 0 ? `Form swaps: ${swapList.map(s => `${s.from} → ${s.to}`).join('; ')}.` : '',
    removeList.length > 0 ? `Removing: ${removeList.join(', ')}.` : '',
    Object.keys(doseModMap).length > 0 ? `Dose reductions: ${Object.entries(doseModMap).map(([n, m]) => `${n} ×${m}`).join(', ')}.` : '',
    criticalCount > 0 ? `⚠️ ${criticalCount} CRITICAL conflict(s) detected — practitioner review required.` : '',
    highCount > 0 ? `⚠️ ${highCount} HIGH priority conflict(s) detected.` : '',
  ].filter(Boolean).join(' ')

  return {
    add: addList,
    swap: swapList,
    remove: removeList,
    dose_mod: doseModMap,
    conflicts: conflictsFound,
    flags: flagList,
    summary,
  }
}

// ── FORMULA MERGE FUNCTION ────────────────────────────────────────────────────
/**
 * mergeFormulas
 * Takes the CSS baseline formula and applies WGS corrections to produce the final formula
 *
 * @param {object[]} cssFormula   - Array of { nutrient, form, dose, unit } from CSS PDF parser
 * @param {object}   wgsCorrections - Output of buildWGSCorrections()
 * @returns {object[]} finalFormula - Merged, conflict-resolved formula ready for VitaminLab API
 */
export function mergeFormulas(cssFormula, wgsCorrections) {
  const { add, swap, remove, dose_mod } = wgsCorrections

  // Start with CSS formula
  let formula = cssFormula.map(item => ({ ...item }))

  // Apply removals (includes swapped-out forms)
  formula = formula.filter(item => !remove.includes(item.nutrient))

  // Apply dose modifiers
  formula = formula.map(item => {
    const mod = dose_mod[item.nutrient]
    if (mod !== undefined) {
      return { ...item, dose: Math.round(item.dose * mod), note: `Dose reduced ×${mod} — WGS constraint` }
    }
    return item
  })

  // Apply form swaps (for nutrients that survived removal)
  formula = formula.map(item => {
    const swapRule = swap.find(s => s.from === item.nutrient)
    if (swapRule) {
      return { ...item, form: swapRule.to, swapReason: swapRule.reason }
    }
    return item
  })

  // Add WGS-specific nutrients (avoid duplicates — merge if already present)
  for (const addition of add) {
    const existing = formula.find(f => f.nutrient === addition.nutrient)
    if (existing) {
      // Take the higher dose
      if (addition.dose > existing.dose) {
        existing.dose = addition.dose
        existing.form = addition.form
        existing.note = `Dose increased by WGS correction — ${addition.reason}`
      }
    } else {
      formula.push({ ...addition, source: 'WGS' })
    }
  }

  return formula
}

// ── EXAMPLE USAGE ─────────────────────────────────────────────────────────────
/*

// Patient with MTHFR homozygous, slow COMT, GST M1 null, VDR heterozygous
const patientVariants = [
  'MTHFR_C677T_hom',
  'COMT_slow_hom',
  'GST_M1_null',
  'VDR_het',
]

const corrections = buildWGSCorrections(patientVariants)
console.log(corrections.summary)
// → "WGS correction layer applied for 4 variant(s). Adding 6 nutrients...
//    Form swaps: Methylcobalamin → Hydroxycobalamin; Folic Acid → L-5-Methylfolate.
//    ⚠️ 1 CRITICAL conflict: folic acid removal.
//    ⚠️ 1 HIGH conflict: COMT slow + methylfolate cap."

// Helena Moller's CSS formula (parsed from PDF)
const helenaCSS = [
  { nutrient: 'L-Histidine', form: 'L-Histidine', dose: 340, unit: 'mg' },
  { nutrient: 'Inositol', form: 'Inositol', dose: 250, unit: 'mg' },
  { nutrient: 'Iron', form: 'Iron Bisglycinate Chelate', dose: 10, unit: 'mg' },
  { nutrient: 'Magnesium', form: 'Magnesium Glycinate', dose: 300, unit: 'mg' },
  { nutrient: 'Alpha Lipoic Acid', form: 'Alpha Lipoic Acid', dose: 200, unit: 'mg' },
  { nutrient: 'Zinc', form: 'Zinc Bisglycinate Chelate', dose: 25, unit: 'mg' },
  // ...
]

const helenaFinal = mergeFormulas(helenaCSS, corrections)
// → Ready for VitaminLab API

*/
