// ── MEET MARIO — GENOMIC PROFILE ENGINE ──────────────────────────────────────
// MediBalans AB — Dr Mario Anthis PhD
//
// Three layers:
//   1. SUPPLEMENT SNPs     — actionable nutrient form/dose corrections
//   2. NUTRIGENETICS       — food response, macronutrient metabolism
//   3. LIFESTYLE GENOMICS  — training, sleep, alcohol, stress, injury
//
// All SNPs are clinically actionable — no annotation-only entries
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — SUPPLEMENT SNPs
// (feeds directly into buildWGSCorrections → VitaminLab formula)
// ══════════════════════════════════════════════════════════════════════════════

export const SUPPLEMENT_SNPS = {

  // ── ONE-CARBON METABOLISM ──────────────────────────────────────────────────
  rs1801133: {
    gene: 'MTHFR', name: 'C677T',
    het: 'MTHFR_C677T_het', hom: 'MTHFR_C677T_hom',
    action: 'L-5-Methylfolate + Riboflavin-5-phosphate. Remove folic acid.',
  },
  rs1801131: {
    gene: 'MTHFR', name: 'A1298C',
    het: 'MTHFR_A1298C_het', hom: 'MTHFR_A1298C_hom',
    action: 'L-5-Methylfolate. BH4 precursor support.',
  },
  rs1805087: {
    gene: 'MTR', name: 'A2756G',
    het: 'MTR_A2756G_het', hom: 'MTR_A2756G_hom',
    action: 'Hydroxycobalamin. Increase methylfolate.',
  },
  rs1801394: {
    gene: 'MTRR', name: 'A66G',
    het: 'MTRR_A66G_het', hom: 'MTRR_A66G_hom',
    action: 'Hydroxycobalamin only. Riboflavin-5-phosphate.',
  },
  rs3733890: {
    gene: 'BHMT',
    het: 'BHMT_het', hom: 'BHMT_hom',
    action: 'TMG 500mg. Choline Bitartrate.',
  },
  rs819147: {
    gene: 'AHCY',
    het: 'AHCY_het', hom: 'AHCY_hom',
    action: 'Adenosylcobalamin. Avoid excess methyl donors.',
  },
  rs1979277: {
    gene: 'SHMT1',
    het: 'SHMT1_het', hom: 'SHMT1_hom',
    action: 'P5P (active B6). Serine support.',
  },

  // ── TRANSSULFURATION ──────────────────────────────────────────────────────
  rs234706: {
    gene: 'CBS', name: 'A360A',
    het: 'CBS_upregulation', hom: 'CBS_upregulation',
    action: 'Reduce TMG 50%. Reduce methionine 50%. P5P + Molybdenum.',
  },
  rs4880: {
    gene: 'SOD2', name: 'A16V',
    het: 'SOD2_het', hom: 'SOD2_hom',
    action: 'Ubiquinol CoQ10. Manganese Bisglycinate.',
  },
  rs1050450: {
    gene: 'GPX1', name: 'Pro198Leu',
    het: 'GPX1_het', hom: 'GPX1_hom',
    action: 'Selenomethionine 100–200mcg.',
  },
  rs1695: {
    gene: 'GST P1', name: 'Ile105Val',
    het: 'GST_P1_het', hom: 'GST_P1_hom',
    action: 'NAC 300mg. R-ALA.',
  },
  // GST M1/T1 — deletions handled via parseCNVs()

  // ── NEUROTRANSMITTER & HORMONE ────────────────────────────────────────────
  rs4680: {
    gene: 'COMT', name: 'Val158Met',
    het: 'COMT_slow_het', hom: 'COMT_slow_hom', hom_ref: 'COMT_fast_hom',
    action: 'Slow: Hydroxycobalamin only. Cap methyl donors. Magnesium Bisglycinate.',
  },
  rs6323: {
    gene: 'MAOA', name: 'T941G',
    het: 'MAOA_het', hom: 'MAOA_hom',
    action: 'Riboflavin-5-phosphate. P5P.',
  },
  rs1799836: {
    gene: 'MAOB',
    het: 'MAOB_het', hom: 'MAOB_hom',
    action: 'Riboflavin-5-phosphate.',
  },
  rs2228570: {
    gene: 'VDR', name: 'FokI',
    het: 'VDR_het', hom: 'VDR_hom',
    action: 'D3 Cholecalciferol 2000–4000 IU. K2-MK7. Magnesium cofactor.',
  },
  rs1800497: {
    gene: 'DRD2', name: 'Taq1A',
    het: 'DRD2_het', hom: 'DRD2_hom',
    action: 'L-Tyrosine 500mg. Iron Bisglycinate. P5P.',
  },

  // ── DNA REPAIR ─────────────────────────────────────────────────────────────
  rs2228612: { gene: 'DNMT1', het: 'DNMT1_het', hom: 'DNMT1_hom', action: 'Methylfolate. Zinc Bisglycinate.' },
  rs749131:  { gene: 'DNMT3A', het: 'DNMT3A_het', hom: 'DNMT3A_hom', action: 'Methylfolate. Zinc.' },
  rs45445694:{ gene: 'TYMS', het: 'TYMS_het', hom: 'TYMS_hom', action: 'Methylfolate. Remove folic acid.' },
  rs25487:   { gene: 'XRCC1', name: 'Arg399Gln', het: 'XRCC1_het', hom: 'XRCC1_hom', action: 'Niacinamide 250mg. Magnesium.' },
}

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — NUTRIGENETICS
// (customises diet, macros, food choices — outputs to Mario AI dietary guidance)
// ══════════════════════════════════════════════════════════════════════════════

export const NUTRIGENETIC_SNPS = {

  // ── CAFFEINE ──────────────────────────────────────────────────────────────
  rs762551: {
    gene: 'CYP1A2', name: 'Caffeine metabolism',
    ref: 'A', alt: 'C',
    interpretations: {
      hom_ref: { // AA — fast metaboliser
        label: 'Fast caffeine metaboliser',
        guidance: 'Caffeine cleared efficiently. Up to 400mg/day generally safe. Coffee may offer cardiovascular benefit at moderate intake. No special restriction needed.',
        protocol_note: null,
      },
      het: { // AC — intermediate
        label: 'Intermediate caffeine metaboliser',
        guidance: 'Moderate caffeine sensitivity. Cap at 200mg/day. Avoid caffeine after 2pm to protect sleep architecture.',
        protocol_note: 'Note on ALCAT: if coffee is reactive, this is immune-driven, not metabolism-driven.',
      },
      hom_alt: { // CC — slow metaboliser
        label: 'Slow caffeine metaboliser',
        guidance: 'Caffeine accumulates. Significantly elevated cardiovascular risk with >1 cup/day. Recommend switching to green tea or decaf. Hard cap at 100mg/day. Avoid entirely during detox.',
        protocol_note: 'Slow CYP1A2: caffeine also competes with Phase I detox capacity. Reduce during protocol.',
        supplement_note: 'Check supplement formulas for caffeine-containing botanicals (guarana, green tea extract) — contraindicated.',
      },
    },
  },

  // ── LACTOSE ───────────────────────────────────────────────────────────────
  rs4988235: {
    gene: 'MCM6 / LCT', name: 'Lactase persistence',
    ref: 'A', alt: 'G',
    interpretations: {
      hom_ref: { // AA — lactase non-persistent (original human state)
        label: 'Lactase non-persistent — genomic dairy intolerance',
        guidance: 'Lactase gene not persistent. Dairy causes genuine genomic lactose malabsorption, distinct from ALCAT immune reactivity. Both mechanisms active simultaneously. No dairy at any point in protocol.',
        protocol_note: 'Reinforces 180-day dairy elimination. Not a lifestyle choice — genomic fact.',
      },
      het: { // AG — partial persistence
        label: 'Partial lactase persistence',
        guidance: 'Partial lactase activity. Some dairy tolerance possible after protocol, but ALCAT result supersedes. Proceed with standard dairy elimination.',
        protocol_note: null,
      },
      hom_alt: { // GG — full lactase persistence
        label: 'Full lactase persistence',
        guidance: 'Genomically lactase persistent. Any dairy reactions are ALCAT immune-driven, not lactose malabsorption. Confirms ALCAT result is the clinical guide.',
        protocol_note: null,
      },
    },
  },

  // ── OMEGA-3 CONVERSION ────────────────────────────────────────────────────
  rs174537: {
    gene: 'FADS1', name: 'Omega-3/6 desaturase efficiency',
    ref: 'G', alt: 'T',
    interpretations: {
      hom_ref: { // GG — efficient converter
        label: 'Efficient ALA→EPA→DHA converter',
        guidance: 'FADS1 functional. Plant-based omega-3 (ALA from flaxseed, chia) converts adequately. Marine omega-3 still preferred during healing phase.',
        protocol_note: null,
      },
      het: {
        label: 'Reduced ALA conversion efficiency',
        guidance: 'Partial FADS1 impairment. Dietary ALA conversion to EPA/DHA is reduced. Require pre-formed EPA+DHA from marine sources (Availom or equivalent TG-form fish oil). Minimum 2g EPA+DHA/day.',
        supplement_note: 'Add Availom omega-3 TG-form to formula. Dose: 2g EPA+DHA/day minimum.',
      },
      hom_alt: { // TT — poor converter
        label: 'Significantly impaired ALA→EPA/DHA conversion',
        guidance: 'FADS1 TT — plant omega-3 largely non-functional as therapeutic source. Pre-formed EPA+DHA essential. 3g/day therapeutic dose. Algae-based DHA acceptable alternative.',
        supplement_note: 'Availom TG omega-3 3g/day. Consider algae DHA if fish reactive on ALCAT.',
      },
    },
  },

  rs1535: {
    gene: 'FADS2', name: 'Delta-6 desaturase',
    ref: 'G', alt: 'A',
    interpretations: {
      hom_alt: {
        label: 'Reduced delta-6 desaturase activity',
        guidance: 'Impaired conversion of LA to GLA and ALA to SDA. Compounds FADS1 variants. Marine EPA+DHA essential. Evening primrose oil (GLA) may be indicated if inflammatory pattern present.',
        supplement_note: 'If FADS1 + FADS2 both impaired: Availom 3g/day + GLA 240mg from borage if not ALCAT reactive.',
      },
      het: { label: 'Mildly reduced delta-6 activity', guidance: 'Monitor omega-3 status. Marine sources preferred.' },
      hom_ref: { label: 'Normal delta-6 desaturase', guidance: null },
    },
  },

  // ── FAT METABOLISM ────────────────────────────────────────────────────────
  rs429358: {
    gene: 'APOE', name: 'APOE ε4 allele (rs429358)',
    ref: 'T', alt: 'C',
    interpretations: {
      het: {
        label: 'APOE ε3/ε4 — moderate cardiovascular and neurological risk',
        guidance: 'One ε4 allele. Saturated fat raises LDL more than in ε3/ε3. In the context of the MediBalans protocol: tallow and duck fat remain the correct cooking fats — seed oil avoidance is paramount. Monitor lipid panel at 3 months. Mediterranean-style fat profile preferred long-term.',
        protocol_note: 'APOE ε4: prioritise omega-3 (Availom), polyphenols, and reduced saturated fat after healing phase. Not a protocol contraindication — seed oils remain worse.',
        flag: 'APOE ε4 present — flag for cardiovascular risk monitoring. Discuss with patient.',
      },
      hom_alt: {
        label: 'APOE ε4/ε4 — elevated cardiovascular and Alzheimer\'s risk',
        guidance: 'Homozygous ε4. Highest LDL response to saturated fat. Strict monitoring required. Marine omega-3 at therapeutic dose essential. After healing phase, transition cooking fats to avocado oil. Avoid red meat more than 3x/week.',
        flag: 'APOE ε4/ε4 — HIGH PRIORITY: cardiovascular and dementia risk counselling required.',
        supplement_note: 'Availom 3g EPA+DHA/day. Add Phosphatidylserine 200mg for neurological protection.',
      },
      hom_ref: { label: 'APOE ε3/ε3 — standard risk', guidance: 'No APOE-specific dietary modification required.' },
    },
  },

  rs7412: {
    gene: 'APOE', name: 'APOE ε2 allele (rs7412)',
    ref: 'C', alt: 'T',
    interpretations: {
      het: {
        label: 'APOE ε2/ε3 — reduced cardiovascular risk, elevated triglycerides',
        guidance: 'ε2 allele associated with lower LDL but potential triglyceride elevation. Reduce refined carbohydrate and sugar exposure — already addressed by protocol. Monitor triglycerides.',
        protocol_note: null,
      },
      hom_alt: {
        label: 'APOE ε2/ε2 — risk of Type III hyperlipoproteinaemia',
        guidance: 'Rare but clinically significant. High triglyceride risk. Strict carbohydrate and fat restriction in post-protocol phase. Requires lipid monitoring.',
        flag: 'APOE ε2/ε2 — check fasting lipids. Type III hyperlipoproteinaemia risk.',
      },
      hom_ref: { label: 'No ε2 allele', guidance: null },
    },
  },

  // ── CARBOHYDRATE METABOLISM ───────────────────────────────────────────────
  rs7903146: {
    gene: 'TCF7L2', name: 'Type 2 diabetes risk',
    ref: 'C', alt: 'T',
    interpretations: {
      het: {
        label: 'Elevated T2D risk — moderate carbohydrate sensitivity',
        guidance: 'TCF7L2 risk variant. Reduced insulin secretion in response to glucose. Strict carbohydrate quality matters more than quantity. Prioritise low-GI foods in rotation. Avoid rice, potatoes, and fruit juices even on safe days.',
        protocol_note: 'Glucose response monitoring recommended. Wearable CGM (Dexcom/Libre) highly indicated.',
      },
      hom_alt: {
        label: 'High T2D risk — significant carbohydrate sensitivity',
        guidance: 'Homozygous TCF7L2 risk — near 2x T2D risk versus wild type. Post-protocol: low-carbohydrate dietary pattern strongly indicated. Continuous glucose monitoring essential. Prioritise protein and fat at all meals.',
        flag: 'TCF7L2 T/T — recommend CGM integration and formal carbohydrate restriction discussion.',
        supplement_note: 'Berberine 500mg (if not ALCAT reactive) post-detox. Chromium Picolinate 200mcg.',
      },
      hom_ref: { label: 'No elevated T2D risk from TCF7L2', guidance: null },
    },
  },

  rs9939609: {
    gene: 'FTO', name: 'Appetite regulation / obesity risk',
    ref: 'T', alt: 'A',
    interpretations: {
      het: {
        label: 'Moderate FTO risk — reduced satiety signalling',
        guidance: 'FTO variant associated with reduced GLP-1 satiety response. Protein at every meal is essential — not optional. Meal frequency every 3 hours (already protocol standard) is genomically supported. Avoid ultra-processed food triggers.',
        protocol_note: null,
      },
      hom_alt: {
        label: 'High FTO risk — significantly blunted satiety',
        guidance: 'Homozygous FTO — up to 3kg higher average body weight, stronger hunger drive. High-protein, high-fibre meals essential. Structured eating times mandatory. No snacking outside the 3-hour rotation. Consider protein-first eating strategy.',
        protocol_note: 'FTO AA: document meal compliance carefully. Hunger complaints likely genomic, not willpower.',
        supplement_note: 'Protein intake target: minimum 1.8g/kg bodyweight/day.',
      },
      hom_ref: { label: 'No FTO-driven appetite dysregulation', guidance: null },
    },
  },

  rs1801282: {
    gene: 'PPARG', name: 'Fat storage / insulin sensitivity',
    ref: 'C', alt: 'G',
    interpretations: {
      het: {
        label: 'PPARG Pro12Ala — improved insulin sensitivity',
        guidance: 'Ala allele associated with reduced fat cell size and improved insulin sensitivity. Responds well to healthy fat intake (olive oil, omega-3). Lower T2D risk than Pro/Pro.',
        protocol_note: null,
      },
      hom_ref: { // Pro/Pro — most common, slightly higher T2D risk
        label: 'PPARG Pro/Pro — standard fat metabolism',
        guidance: 'Standard PPARG activity. Moderate fat intake, quality over quantity. Saturated fat from clean sources (tallow, duck fat) appropriate during protocol.',
        protocol_note: null,
      },
    },
  },

  // ── VITAMIN ABSORPTION ────────────────────────────────────────────────────
  rs2282679: {
    gene: 'GC', name: 'Vitamin D binding protein',
    ref: 'A', alt: 'C',
    interpretations: {
      het: {
        label: 'Reduced Vitamin D transport efficiency',
        guidance: 'GC variant reduces Vitamin D binding protein capacity — lower circulating 25(OH)D even with adequate sun. Increase D3 supplementation. Target 25(OH)D >100 nmol/L.',
        supplement_note: 'Increase D3 by 1000 IU above VDR-based recommendation.',
      },
      hom_alt: {
        label: 'Significantly impaired Vitamin D binding',
        guidance: 'Double GC hit. D3 supplementation at therapeutic dose essential regardless of sun exposure. Target >120 nmol/L serum 25(OH)D.',
        supplement_note: 'D3 4000 IU minimum. Retest 25(OH)D at 3 months.',
      },
      hom_ref: { label: 'Normal D binding protein', guidance: null },
    },
  },

  rs12934922: {
    gene: 'BCMO1', name: 'Beta-carotene to Vitamin A conversion',
    ref: 'A', alt: 'T',
    interpretations: {
      het: {
        label: 'Reduced beta-carotene conversion',
        guidance: 'BCMO1 variant reduces conversion of beta-carotene (plant) to retinol (active Vitamin A) by ~30-40%. Plant-based Vitamin A from carrots, sweet potato inadequate. Pre-formed retinol from animal sources needed (liver, egg yolk if not ALCAT reactive).',
        supplement_note: 'Replace beta-carotene in formula with pre-formed Retinyl Palmitate if Vitamin A deficiency indicated.',
      },
      hom_alt: {
        label: 'Severely impaired beta-carotene conversion',
        guidance: 'Up to 70% reduced conversion efficiency. High-dose beta-carotene supplementation is counterproductive — converts poorly and may compete with retinol absorption. Pre-formed retinol only.',
        supplement_note: 'Remove beta-carotene. Add Retinyl Palmitate 700mcg RAE. Do NOT supplement beta-carotene.',
      },
      hom_ref: { label: 'Normal beta-carotene conversion', guidance: null },
    },
  },

  rs1800562: {
    gene: 'HFE', name: 'C282Y — hereditary haemochromatosis',
    ref: 'G', alt: 'A',
    interpretations: {
      het: {
        label: 'HFE C282Y carrier',
        guidance: 'Carrier for hereditary haemochromatosis. Monitor serum ferritin and transferrin saturation before iron supplementation. Do not add iron beyond CSS deficiency amount without confirmed low ferritin.',
        supplement_note: 'Verify iron status before supplementing. Do NOT add iron prophylactically.',
        flag: 'HFE C282Y carrier — check ferritin and transferrin saturation before iron prescription.',
      },
      hom_alt: {
        label: 'HFE C282Y homozygous — haemochromatosis risk',
        guidance: 'High risk of iron overload. Iron supplementation contraindicated unless documented severe deficiency with medical oversight. Remove iron from CSS formula unless ferritin confirmed low.',
        supplement_note: 'REMOVE iron from formula. Confirm with ferritin/transferrin before any iron prescription.',
        flag: 'CRITICAL: HFE C282Y/C282Y — iron overload risk. Iron contraindicated without documented deficiency.',
      },
      hom_ref: { label: 'No HFE C282Y', guidance: null },
    },
  },

  rs1799945: {
    gene: 'HFE', name: 'H63D',
    ref: 'C', alt: 'G',
    interpretations: {
      het: { label: 'HFE H63D carrier', guidance: 'Minor iron overload risk. Monitor ferritin.', supplement_note: 'Check ferritin before iron supplementation.' },
      hom_alt: { label: 'HFE H63D homozygous', guidance: 'Moderate haemochromatosis risk, especially if C282Y also present.', flag: 'HFE H63D/H63D — check iron panel.', supplement_note: 'Iron supplementation requires confirmed deficiency.' },
      hom_ref: { label: 'No HFE H63D', guidance: null },
    },
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — LIFESTYLE GENOMICS
// (training, sleep, alcohol, stress, injury — outputs to Mario AI lifestyle guidance)
// ══════════════════════════════════════════════════════════════════════════════

export const LIFESTYLE_SNPS = {

  // ── TRAINING & PHYSICAL PERFORMANCE ──────────────────────────────────────
  rs1815739: {
    gene: 'ACTN3', name: 'Alpha-actinin-3 — power vs endurance',
    ref: 'C', alt: 'T',  // R577X
    interpretations: {
      hom_ref: { // RR — both copies functional
        label: 'Power athlete genotype (RR)',
        guidance: 'Full alpha-actinin-3 expression in fast-twitch fibres. Genetically suited to explosive power, sprint, resistance training. Responds well to HIIT and heavy lifting. Muscle gain is efficient.',
        training: 'Prioritise resistance training and HIIT. 3–4x/week strength. Shorter rest periods tolerated. Higher protein intake (2g/kg) supports genetic potential.',
        recovery: 'Fast-twitch dominance — full recovery in 48h. Can train same muscle group twice weekly.',
      },
      het: { // RX
        label: 'Mixed power/endurance genotype (RX)',
        guidance: 'Heterozygous — functional in both power and endurance domains. Highly trainable across modalities. Most versatile genotype.',
        training: 'Balanced training: 2–3x resistance + 2x endurance/week. Responds well to periodisation.',
        recovery: 'Standard 48–72h between sessions for worked muscle groups.',
      },
      hom_alt: { // XX — no functional alpha-actinin-3
        label: 'Endurance athlete genotype (XX)',
        guidance: 'No functional ACTN3. Reduced explosive power ceiling but superior endurance capacity. Slow-twitch muscle fibre optimisation. Over 80% of elite marathon runners are XX.',
        training: 'Prioritise aerobic endurance, zone 2 cardio, and long-duration steady-state training. Resistance training still important for health but expect slower strength gains.',
        recovery: 'Slow-twitch recovery — can tolerate higher training frequency. 24–36h recovery sufficient for moderate sessions.',
        supplement_note: 'Creatine Monohydrate 3g/day — particularly beneficial in XX to partially compensate power deficit.',
      },
    },
  },

  rs4646994: {
    gene: 'ACE', name: 'Insertion/Deletion — endurance vs power',
    ref: null, // I/D polymorphism
    interpretations: {
      hom_ref: { // II — insertion homozygous
        label: 'ACE II — endurance optimised',
        guidance: 'Low ACE activity. Lower blood pressure response, superior endurance performance. Cardiovascular system adapts efficiently to aerobic training.',
        training: 'Endurance-dominant. Aerobic base building highly efficient. Zone 2 training yields rapid VO2max gains.',
        recovery: 'Cardiovascular recovery fast. Aerobic sessions can be frequent (5–6x/week).',
      },
      het: { // ID
        label: 'ACE ID — balanced',
        guidance: 'Intermediate ACE activity. Benefits from both power and endurance training.',
        training: 'Mixed modality training. Periodisation recommended.',
        recovery: 'Standard recovery protocols.',
      },
      hom_alt: { // DD — deletion homozygous
        label: 'ACE DD — power and strength optimised',
        guidance: 'High ACE activity. Higher blood pressure response to exercise (monitor). Superior muscle strength and power development. Responds very well to resistance training.',
        training: 'Resistance training priority. HIIT effective. Endurance training less efficient — use for cardiovascular health, not performance.',
        supplement_note: 'ACE DD: CoQ10 Ubiquinol 200mg supports cardiac efficiency under high-intensity load.',
        flag: 'Monitor blood pressure. ACE DD individuals show higher hypertension risk with age.',
      },
    },
  },

  rs8192678: {
    gene: 'PPARGC1A', name: 'PGC-1α — mitochondrial biogenesis',
    ref: 'G', alt: 'A',  // Gly482Ser
    interpretations: {
      hom_ref: { // GG — optimal
        label: 'High mitochondrial biogenesis response (GG)',
        guidance: 'PGC-1α functions optimally. Mitochondrial density increases efficiently with aerobic training. VO2max highly trainable. Cold exposure and intermittent fasting activate PGC-1α strongly.',
        training: 'Aerobic base training yields exceptional results. Zone 2 cardio 150+ min/week is genomically indicated.',
        lifestyle: 'Cold showers, early morning exercise, and overnight fasting all activate PGC-1α — layered hormetic benefit.',
      },
      het: { label: 'Moderate mitochondrial biogenesis', guidance: 'Responds well to aerobic training but gains are slower than GG. Consistency over intensity.', training: 'Prioritise consistent zone 2 training over sporadic high intensity.' },
      hom_alt: { // AA — Ser/Ser
        label: 'Reduced mitochondrial biogenesis (AA)',
        guidance: 'Reduced PGC-1α activity. Mitochondrial adaptation to training is slower. Higher insulin resistance risk. Exercise becomes even more critical as a metabolic intervention.',
        training: 'Must train regularly to compensate reduced baseline mitochondrial capacity. HIIT is particularly effective at stimulating PGC-1α even in AA genotype.',
        supplement_note: 'NMN + Resveratrol: PGC-1α activators. Directly compensates Ser/Ser functional reduction. This is the SIRT1→PGC-1α axis from the Adaptive Human framework.',
        lifestyle: 'Cold exposure and caloric restriction more important in AA — these are the strongest PGC-1α activators beyond exercise.',
      },
    },
  },

  rs6265: {
    gene: 'BDNF', name: 'Val66Met — brain plasticity and exercise response',
    ref: 'G', alt: 'A',
    interpretations: {
      hom_ref: { // Val/Val
        label: 'BDNF Val/Val — normal neuroplasticity',
        guidance: 'Standard BDNF secretion in response to exercise. Normal cognitive benefit from physical activity.',
        training: 'Any exercise modality stimulates BDNF. Aerobic exercise most potent for brain health.',
      },
      het: { // Val/Met
        label: 'BDNF Val/Met — moderately reduced activity-dependent BDNF',
        guidance: 'Reduced BDNF secretion with exercise compared to Val/Val. Exercise-induced cognitive benefits are present but attenuated. Consistency is more important.',
        training: 'Aerobic exercise 5x/week rather than 3x to achieve equivalent BDNF stimulus.',
        supplement_note: 'Omega-3 DHA 1g/day supports BDNF expression. Magnesium L-Threonate if cognitive goals are primary.',
      },
      hom_alt: { // Met/Met
        label: 'BDNF Met/Met — significantly reduced neuroplasticity',
        guidance: 'Significantly impaired activity-dependent BDNF secretion. Higher risk of depression, anxiety, and cognitive decline. Exercise is most potent intervention available. Diet quality is neuroprotective.',
        training: 'Daily aerobic exercise is therapeutic — not optional. 30 min minimum, 5–7 days/week.',
        supplement_note: 'DHA 2g/day. Lion\'s Mane Mushroom extract 500mg (if not ALCAT reactive) — NGF stimulation. Magnesium L-Threonate.',
        lifestyle: 'Cognitive stimulation (learning, reading, social engagement) compounds exercise-driven BDNF in Met/Met.',
        flag: 'BDNF Met/Met — screen for mood disorders. Exercise prescription is clinical.',
      },
    },
  },

  rs12722: {
    gene: 'COL5A1', name: 'Tendon/ligament injury risk',
    ref: 'C', alt: 'T',
    interpretations: {
      hom_ref: { label: 'Normal collagen-5 structure', guidance: null, training: null },
      het: {
        label: 'Elevated tendon/ligament injury risk',
        guidance: 'COL5A1 CT — collagen type V variant associated with increased Achilles tendon and ACL injury risk. Connective tissue is less robust under high load.',
        training: 'Mandatory warm-up and cool-down. Avoid sudden training load increases (>10%/week rule). Eccentric loading exercises for tendon prehab.',
        supplement_note: 'Collagen peptides (Type I/III) 10g/day with Vitamin C — supports tendon matrix synthesis. Vitamin C must be co-administered for hydroxylation.',
        lifestyle: 'Barefoot/minimalist training cautiously. Prioritise mobility work.',
      },
      hom_alt: {
        label: 'High tendon/ligament injury risk',
        guidance: 'Homozygous COL5A1 TT. Significantly elevated connective tissue fragility. Several studies show 3–5x elevated injury incidence in impact sports.',
        training: 'High-impact sports (basketball, football, tennis) carry significant risk. Swimming and cycling preferred. If impact sports undertaken, extensive prehabilitation mandatory.',
        supplement_note: 'Collagen peptides 15g/day with Vitamin C. Boswellia Serrata for joint inflammation. Silica (horsetail extract) for connective tissue support.',
        flag: 'COL5A1 TT — discuss injury risk honestly. Training modification is clinical advice.',
      },
    },
  },

  // ── SLEEP ─────────────────────────────────────────────────────────────────
  rs1801260: {
    gene: 'CLOCK', name: 'Circadian rhythm / chronotype',
    ref: 'T', alt: 'C',
    interpretations: {
      hom_ref: { // TT
        label: 'Morning chronotype tendency',
        guidance: 'CLOCK TT associated with morning preference. Natural cortisol peak earlier. Peak cognitive and physical performance in the morning.',
        lifestyle: 'Align training, demanding work, and meals to morning hours. Strict sleep onset before 10:30pm to honour natural rhythm.',
        protocol_note: 'Early morning exercise maximises cortisol-AMPK interaction for fat metabolism.',
      },
      het: {
        label: 'Intermediate chronotype',
        guidance: 'Flexible chronotype. Can adapt to morning or evening schedule with habit formation. Consistency is the key variable.',
        lifestyle: 'Set consistent sleep and wake times. Light exposure in the morning anchors the clock gene rhythm.',
      },
      hom_alt: { // CC
        label: 'Evening chronotype (night owl)',
        guidance: 'CLOCK CC associated with delayed circadian phase. Natural peak performance in the evening. Morning function is genuinely impaired — not a character trait.',
        lifestyle: 'Do not force early training if sleep was poor. Evening exercise is genomically appropriate. Bright light exposure on waking is the most effective chronotype correction tool.',
        protocol_note: 'Evening chronotype: avoid eating after 8pm — circadian misalignment of meals impairs glucose tolerance and gut repair in CC genotype.',
        flag: 'CLOCK CC — discuss shift work, jet lag, and social jet lag as genuine health risks.',
      },
    },
  },

  rs5751876: {
    gene: 'ADORA2A', name: 'Caffeine sensitivity and sleep',
    ref: 'C', alt: 'T',
    interpretations: {
      hom_ref: { label: 'Low adenosine receptor caffeine sensitivity', guidance: 'Caffeine has less impact on sleep architecture. Standard CYP1A2-based guidance applies.', lifestyle: null },
      het: {
        label: 'Moderate caffeine/sleep sensitivity',
        guidance: 'ADORA2A variant increases adenosine receptor sensitivity. Caffeine competes with adenosine for sleep pressure — caffeine after noon will measurably impair sleep quality.',
        lifestyle: 'Hard cutoff: no caffeine after 12pm. Even if sleep feels normal, deep sleep architecture is disrupted.',
      },
      hom_alt: {
        label: 'High caffeine sensitivity — significant sleep impairment risk',
        guidance: 'Homozygous ADORA2A — even small caffeine doses cause significant sleep disruption. Caffeine causes anxiety, jitteriness, and insomnia at doses others tolerate well. Half-life of caffeine effectively doubled in subjective impact.',
        lifestyle: 'Recommend complete caffeine elimination or limit to one small coffee before 9am. This variant combined with slow CYP1A2 is a strong case for full elimination.',
        supplement_note: 'Remove any caffeinated botanicals from formula (green tea extract, guarana). Check pre-workout supplements.',
      },
    },
  },

  rs57875989: {
    gene: 'PER3', name: 'Sleep duration need',
    ref: null,
    interpretations: {
      long_allele: {
        label: 'High sleep need genotype',
        guidance: 'PER3 long allele — requires 8–9 hours for full cognitive recovery. Sleep debt accumulates faster and impacts performance more severely than short allele carriers.',
        lifestyle: 'This patient genuinely needs more sleep than average. 7 hours is insufficient. Sleep hygiene is a clinical priority, not a lifestyle preference.',
        protocol_note: 'Sleep is when gut repair and immune recalibration occur. PER3 long allele patients on detox protocol must prioritise 8–9h.',
      },
      short_allele: {
        label: 'Standard sleep need',
        guidance: '7–8 hours sufficient for most short allele carriers. Standard sleep guidance applies.',
        lifestyle: null,
      },
    },
  },

  // ── ALCOHOL METABOLISM ────────────────────────────────────────────────────
  rs1229984: {
    gene: 'ADH1B', name: 'Alcohol dehydrogenase — metabolism speed',
    ref: 'A', alt: 'G',  // His48Arg — Arg/Arg = fast
    interpretations: {
      hom_alt: { // fast metaboliser
        label: 'Fast alcohol metaboliser',
        guidance: 'ADH1B Arg/Arg — rapid ethanol to acetaldehyde conversion. Acetaldehyde accumulates faster than ALDH2 can clear it, potentially causing flushing even in Europeans. Paradoxically associated with lower alcoholism risk due to aversive acetaldehyde effect.',
        lifestyle: 'Fast ADH1B: lower alcohol tolerance, higher acute sensitivity. During protocol: alcohol is contraindicated regardless — cytokine burden, gut permeability, yeast substrate.',
        protocol_note: 'All alcohol eliminated during protocol. Candida: zero tolerance permanently during restriction window.',
      },
      hom_ref: { // slow metaboliser — most common in Europeans
        label: 'Standard alcohol metabolism',
        guidance: 'Standard ADH1B activity. Alcohol metabolised at normal rate.',
        lifestyle: 'Standard alcohol guidance. During protocol: eliminated completely.',
        protocol_note: 'Post-protocol: maximum 1–2 units/week if ALCAT allows. Grapes and yeast-derived alcohol remain excluded for Candida patients.',
      },
      het: { label: 'Intermediate alcohol metabolism', guidance: 'Intermediate sensitivity. Standard protocol restriction applies.', lifestyle: null },
    },
  },

  rs671: {
    gene: 'ALDH2', name: 'Acetaldehyde clearance (Asian flush / ALDH2*2)',
    ref: 'G', alt: 'A',
    interpretations: {
      het: {
        label: 'ALDH2*1/*2 — impaired acetaldehyde clearance',
        guidance: 'One non-functional ALDH2 allele. Acetaldehyde (carcinogen) accumulates significantly with alcohol consumption. Flushing, nausea, tachycardia are the acute signs. More importantly: significantly elevated oesophageal cancer risk with any regular alcohol intake.',
        lifestyle: 'Strong clinical recommendation: alcohol avoidance. This is not aesthetic preference — acetaldehyde is a Group 1 carcinogen at concentrations produced in ALDH2*2 carriers.',
        flag: 'ALDH2*2 — elevated cancer risk with alcohol. Clinical recommendation: abstinence. Document in patient record.',
        supplement_note: 'NAC 500mg on days of any alcohol exposure — supports aldehyde detox. But abstinence is the correct intervention.',
      },
      hom_alt: {
        label: 'ALDH2*2/*2 — severely impaired acetaldehyde clearance',
        guidance: 'Homozygous ALDH2*2. Alcohol is genuinely toxic. Any alcohol consumption causes severe acetaldehyde accumulation. Oesophageal cancer risk multiplied many-fold. Complete abstinence mandatory.',
        flag: 'CRITICAL: ALDH2*2/*2 — alcohol is contraindicated. Document and counsel.',
        lifestyle: 'Zero alcohol. No exceptions.',
      },
      hom_ref: { label: 'Normal ALDH2 function', guidance: 'Standard alcohol guidance. Protocol elimination applies.', lifestyle: null },
    },
  },

  // ── STRESS RESPONSE ───────────────────────────────────────────────────────
  rs25531: {
    gene: 'SLC6A4', name: '5-HTTLPR — serotonin transporter',
    ref: null,  // promoter length variant
    interpretations: {
      short_short: { // s/s — low expression
        label: 'Low serotonin transporter expression (s/s)',
        guidance: 'Significantly increased stress reactivity. Higher risk of depression and anxiety in response to adverse life events. The gut-brain axis makes ALCAT-driven serotonin precursor availability (tryptophan) particularly important.',
        lifestyle: 'Stress management is a clinical priority. Regular aerobic exercise, sleep, and consistent meal timing all directly modulate serotonin production. Social connection is protective.',
        supplement_note: 'L-Tryptophan (from CSS/CMA if deficient) is particularly important for s/s — 5-HT synthesis depends on it. Ensure adequate intake. Consider 5-HTP post-detox if sleep/mood not restored.',
        protocol_note: 'Gut healing is directly relevant — 90% of serotonin is produced in the gut. ALCAT compliance restores gut serotonin production capacity.',
        flag: 'SLC6A4 s/s — screen for mood and anxiety. Gut-brain axis framing is clinically appropriate.',
      },
      short_long: { // s/l
        label: 'Intermediate serotonin transporter expression (s/l)',
        guidance: 'Moderately elevated stress sensitivity. Good response to lifestyle interventions.',
        lifestyle: 'Exercise and sleep are primary interventions. Consistent routine reduces baseline stress reactivity.',
        supplement_note: 'Monitor tryptophan status in CMA.',
      },
      long_long: { // l/l
        label: 'High serotonin transporter expression (l/l)',
        guidance: 'Resilient serotonin reuptake function. Lower stress reactivity. Standard guidance.',
        lifestyle: null,
        supplement_note: null,
      },
    },
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// PARSER — maps VCF genotypes to genomic profile
// ══════════════════════════════════════════════════════════════════════════════

/**
 * buildGenomicProfile
 * Takes VCF parsed variants and returns the full genomic profile:
 *   - supplement corrections (for wgsCorrections.js)
 *   - nutrigenetic guidance
 *   - lifestyle guidance
 *
 * @param {string} vcfText - raw VCF content
 * @returns {object} { supplementVariantKeys, nutrigenetics, lifestyle, flags, marioContext }
 */
export function buildGenomicProfile(vcfText) {
  const lines = vcfText.split('\n')
  const allSnpMaps = { ...SUPPLEMENT_SNPS, ...NUTRIGENETIC_SNPS, ...LIFESTYLE_SNPS }

  const supplementVariantKeys = []
  const nutrigeneticResults = {}
  const lifestyleResults = {}
  const flags = []

  // Build rsid lookup across all layers
  const rsidLookup = {}
  for (const [rsid, data] of Object.entries(allSnpMaps)) {
    rsidLookup[rsid] = { ...data, rsid, layer: SUPPLEMENT_SNPS[rsid] ? 'supplement' : NUTRIGENETIC_SNPS[rsid] ? 'nutrigenetic' : 'lifestyle' }
  }

  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue
    const fields = line.split('\t')
    if (fields.length < 10) continue

    const [, , id, , , , , , format, ...samples] = fields
    const rsids = (id || '').split(';').filter(s => s.startsWith('rs'))

    for (const rsid of rsids) {
      const target = rsidLookup[rsid]
      if (!target) continue

      const sampleData = samples[0] || ''
      const formatFields = (format || '').split(':')
      const sampleFields = sampleData.split(':')
      const gtIndex = formatFields.indexOf('GT')
      if (gtIndex === -1) continue

      const gt = sampleFields[gtIndex] || ''
      const alleles = gt.replace('|', '/').split('/')
      const [a1, a2] = alleles.map(a => parseInt(a))
      if (isNaN(a1) || isNaN(a2)) continue

      let zygosity = 'hom_ref'
      if ((a1 === 0 && a2 === 1) || (a1 === 1 && a2 === 0)) zygosity = 'het'
      else if (a1 === 1 && a2 === 1) zygosity = 'hom_alt'

      // Supplement layer
      if (target.layer === 'supplement') {
        let key = null
        if (rsid === 'rs4680') {
          if (zygosity === 'hom_ref') key = target.hom_ref
          else if (zygosity === 'het') key = target.het
          else if (zygosity === 'hom_alt') key = target.hom
        } else {
          if (zygosity === 'het') key = target.het
          else if (zygosity === 'hom_alt') key = target.hom
        }
        if (key) supplementVariantKeys.push(key)
      }

      // Nutrigenetic layer
      if (target.layer === 'nutrigenetic') {
        const interpretation = target.interpretations?.[zygosity]
        if (interpretation) {
          nutrigeneticResults[target.gene] = {
            rsid, gene: target.gene, name: target.name,
            zygosity, ...interpretation,
          }
          if (interpretation.flag) flags.push(interpretation.flag)
        }
      }

      // Lifestyle layer
      if (target.layer === 'lifestyle') {
        const interpretation = target.interpretations?.[zygosity]
        if (interpretation) {
          lifestyleResults[target.gene] = {
            rsid, gene: target.gene, name: target.name,
            zygosity, ...interpretation,
          }
          if (interpretation.flag) flags.push(interpretation.flag)
        }
      }
    }
  }

  // Build Mario AI context string
  const marioContext = buildMarioContext(nutrigeneticResults, lifestyleResults, flags)

  return {
    supplementVariantKeys: [...new Set(supplementVariantKeys)],
    nutrigenetics: nutrigeneticResults,
    lifestyle: lifestyleResults,
    flags,
    marioContext,
  }
}

/**
 * buildMarioContext
 * Generates a concise genomic context string for injection into Mario AI system prompt
 */
function buildMarioContext(nutrigenetics, lifestyle, flags) {
  const lines = ['GENOMIC PROFILE — LIFESTYLE & NUTRIGENETICS:']

  for (const result of Object.values(nutrigenetics)) {
    if (result.guidance) lines.push(`[${result.gene}] ${result.label}: ${result.guidance}`)
  }
  for (const result of Object.values(lifestyle)) {
    if (result.guidance) lines.push(`[${result.gene}] ${result.label}: ${result.guidance}`)
    if (result.training) lines.push(`  → Training: ${result.training}`)
    if (result.lifestyle) lines.push(`  → Lifestyle: ${result.lifestyle}`)
  }
  if (flags.length > 0) {
    lines.push('\nCLINICAL FLAGS:')
    flags.forEach(f => lines.push(`  ⚠️ ${f}`))
  }

  return lines.join('\n')
}
