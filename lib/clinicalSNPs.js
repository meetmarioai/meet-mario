// ── MEET MARIO — CLINICAL SNP DATABASE ───────────────────────────────────────
// ~100 clinically actionable nutrigenomic SNPs
// Seed: 16 Huss-validated variants from Mario's WGS (DRAGEN/Danteomics, GRCh37)
// Sources: SNPedia, ClinVar, SIFT, PolyPhen, dbSNP
//
// CHROM: GRCh37, no chr prefix (Danteomics format)
// POS:   GRCh37 / hg19 1-based coordinate
// REF/ALT: plus-strand orientation
// ─────────────────────────────────────────────────────────────────────────────

export const CLINICAL_SNPS = [

  // ══════════════════════════════════════════════════════
  // METHYLATION & FOLATE CYCLE
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs1801133', gene: 'MTHFR', chrom: '1', pos: 11856378, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'Methylation / Folate metabolism', domain: 'methylation',
    functional_impact: '65% reduction in folate processing efficiency (SNPedia)',
    het_interpretation: 'Moderately reduced MTHFR activity (~65% efficiency). Use L-5-methylfolate only — never folic acid. Monitor homocysteine annually.',
    hom_interpretation: 'Severely reduced MTHFR activity (~30% efficiency). L-5-methylfolate 800mcg essential. Homocysteine, B12 and folate status must be monitored.',
    protocol_action: 'Replace all folate with L-5-methylfolate 400-800mcg. Avoid folic acid in all supplements and fortified foods.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1801131', gene: 'MTHFR', chrom: '1', pos: 11854476, ref: 'T', alt: 'G',
    effect_allele: 'G', pathway: 'Methylation / BH4 synthesis', domain: 'methylation',
    functional_impact: 'Impairs BH4 cofactor production — affects dopamine, serotonin, norepinephrine synthesis',
    het_interpretation: 'Reduced BH4 synthesis. Supplement 5-MTHF, riboflavin (B2), and P5P (active B6). Mood and neurotransmitter support important.',
    hom_interpretation: 'Significant BH4 impairment. Combined with MTHFR C677T = compound heterozygous. Aggressive methylation support required.',
    protocol_action: 'Add riboflavin (B2) 25-50mg, P5P 25-50mg alongside methylfolate.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1801394', gene: 'MTRR', chrom: '5', pos: 7870973, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Cobalamin transport and metabolism', domain: 'methylation',
    functional_impact: 'A→G deleterious (SIFT, PolyPhen). 1.4× higher risk for meningiomas at GG genotype (SNPedia)',
    het_interpretation: 'B12 recycling mildly impaired. Methylcobalamin 1mg sublingual preferred over cyanocobalamin. Monitor serum B12.',
    hom_interpretation: 'B12 recycling significantly impaired. Methylcobalamin 2mg sublingual daily. Measure methylmalonic acid (MMA) — serum B12 may appear falsely normal.',
    protocol_action: 'Use methylcobalamin not cyanocobalamin. Sublingual delivery bypasses absorption issues. Test MMA not just serum B12.',
    risk_direction: 'risk', source: 'SNPedia/SIFT/PolyPhen',
  },
  {
    rsid: 'rs1805087', gene: 'MTR', chrom: '1', pos: 237048500, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Methylation / Methionine synthesis', domain: 'methylation',
    functional_impact: 'Methionine synthase activity reduced — impairs remethylation of homocysteine',
    het_interpretation: 'Methionine synthase mildly reduced. Stack methylcobalamin and methylfolate together for synergistic remethylation.',
    hom_interpretation: 'Significant methionine synthase impairment. High homocysteine risk. Combination methylcobalamin + methylfolate + B6 P5P essential.',
    protocol_action: 'Always combine methylcobalamin with methylfolate — they work synergistically on this pathway.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs4680', gene: 'COMT', chrom: '22', pos: 19951271, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'Catecholamine degradation / Methylation', domain: 'methylation',
    functional_impact: 'Val158Met substitution — 3-4× slower catecholamine clearance (dopamine, adrenaline, noradrenaline)',
    het_interpretation: 'Slower COMT — catecholamines linger. Limit caffeine after noon. Magnesium glycinate 300mg supports methylation. Avoid megadose polyphenol supplements.',
    hom_interpretation: 'Very slow COMT (AA genotype). Caffeine hard cutoff 10:00. High stress = prolonged adrenaline state. Prioritise parasympathetic recovery. B2 and Mg essential.',
    protocol_action: 'Hard caffeine cutoff 10:00-13:00 depending on genotype. Magnesium 300mg. No concentrated green tea extract or resveratrol supplements.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs234706', gene: 'CBS', chrom: '21', pos: 44474737, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'Biosynthesis of amino acids / Transsulfuration', domain: 'methylation',
    functional_impact: 'CBS 699C>T — affects transsulfuration pathway, homocysteine metabolism',
    het_interpretation: 'CBS variant may upregulate transsulfuration. Limit methionine-rich foods on high-symptom days. Molybdenum 100-150mcg supports sulfite clearance.',
    hom_interpretation: 'Significant CBS upregulation likely. Reduced sulfur foods protocol. Molybdenum supplementation important.',
    protocol_action: 'Limit methionine-rich foods (eggs, meat) on high-symptom days. Add molybdenum 75-150mcg.',
    risk_direction: 'benefit', source: 'SNPedia',
  },
  {
    rsid: 'rs1801181', gene: 'CBS', chrom: '21', pos: 44473798, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Biosynthesis of amino acids / Transsulfuration', domain: 'methylation',
    functional_impact: 'CBS variant — transsulfuration pathway regulation',
    het_interpretation: 'CBS regulatory variant. Monitor homocysteine. Supports sulfur amino acid pathway function.',
    hom_interpretation: 'Homozygous CBS variant. Homocysteine monitoring important. B6 P5P and betaine may help.',
    protocol_action: 'Monitor homocysteine levels. B6 P5P 25-50mg daily.',
    risk_direction: 'neutral', source: 'SNPedia',
  },
  {
    rsid: 'rs2993763', gene: 'MAT1A', chrom: '10', pos: 17793090, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'SAM synthesis / Methylation', domain: 'methylation',
    functional_impact: 'MAT1A variant — affects S-adenosylmethionine (SAM) synthesis (ClinVar: benign)',
    het_interpretation: 'MAT1A variant present. SAM synthesis may be mildly affected. Support with methionine, B12 and folate sufficiency.',
    hom_interpretation: 'Homozygous MAT1A variant. Ensure adequate dietary methionine (eggs, meat) and B-vitamin cofactors.',
    protocol_action: 'Ensure methionine intake from whole food sources. B12 and folate status important for SAM cycle.',
    risk_direction: 'neutral', source: 'ClinVar',
  },
  {
    rsid: 'rs2227956', gene: 'HSPA1L', chrom: '6', pos: 31783974, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Heat shock response / Stress regulation', domain: 'detox',
    functional_impact: 'Regulates HSF1-mediated heat shock response — affects protein quality control under stress',
    het_interpretation: 'HSPA1L variant — heat shock response altered. Sauna and cold exposure are important hormetic interventions for this patient.',
    hom_interpretation: 'Homozygous HSPA1L variant. Heat shock protein induction is a priority intervention — regular sauna 3×/week.',
    protocol_action: 'Prioritise sauna 3×/week (15-20 min) and cold exposure for HSP induction. Limit unnecessary heat stress.',
    risk_direction: 'neutral', source: 'SNPedia',
  },
  {
    rsid: 'rs819147', gene: 'AHCY', chrom: '20', pos: 33978538, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'SAH hydrolysis / Methylation cycle', domain: 'methylation',
    functional_impact: 'Adenosylhomocysteinase — regulates SAH/SAM ratio and global methylation potential',
    het_interpretation: 'AHCY variant — SAH may accumulate, inhibiting methyltransferases. Support with riboflavin B2 and adequate hydration.',
    hom_interpretation: 'AHCY variant — methylation inhibition risk via SAH buildup. B2, B12 and folate cofactors essential.',
    protocol_action: 'Support methylation cycle cofactors: B2 25mg, methylfolate, methylcobalamin.',
    risk_direction: 'risk', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // B12 / FOLATE ABSORPTION
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs601338', gene: 'FUT2', chrom: '19', pos: 49206986, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'B12 absorption / Gut microbiome', domain: 'nutrients',
    functional_impact: 'Non-secretor status — B12 absorption impaired, gut microbiome diversity altered (SNPedia)',
    het_interpretation: 'Reduced B12 absorption. Sublingual methylcobalamin preferred over oral tablets. Monitor serum B12 and MMA.',
    hom_interpretation: 'Non-secretor (AA) — lowest B12 absorption. Sublingual or injectable methylcobalamin essential. Prebiotic fibre to support gut flora.',
    protocol_action: 'Switch to sublingual methylcobalamin 1-2mg daily. Add prebiotic fibre. Test MMA not just serum B12.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs492602', gene: 'FUT2', chrom: '19', pos: 49189600, ref: 'C', alt: 'T',
    effect_allele: 'C', pathway: 'B12 / Secretor status', domain: 'nutrients',
    functional_impact: 'Women with CC have higher normal B12 levels (SNPedia)',
    het_interpretation: 'FUT2 secretor variant — normal to higher B12 levels in heterozygotes. Maintain good B12 intake.',
    hom_interpretation: 'FUT2 CC — associated with higher B12 levels. Maintain monitoring, not a risk variant.',
    protocol_action: 'Monitor B12 levels. This variant favours adequate absorption.',
    risk_direction: 'neutral', source: 'SNPedia',
  },
  {
    rsid: 'rs1801198', gene: 'TCN2', chrom: '22', pos: 30899826, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'B12 cellular transport', domain: 'nutrients',
    functional_impact: 'Transcobalamin II P259R — reduced B12 transport into cells',
    het_interpretation: 'B12 cellular delivery mildly impaired. Serum B12 may appear normal while intracellular B12 is low. Test MMA.',
    hom_interpretation: 'B12 transport significantly reduced. Sublingual B12 and high dietary B12 essential. MMA testing mandatory.',
    protocol_action: 'Use methylcobalamin sublingual. MMA is the definitive intracellular B12 marker — use this not serum B12.',
    risk_direction: 'risk', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // DETOX & GLUTATHIONE
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs4880', gene: 'SOD2', chrom: '6', pos: 160113872, ref: 'T', alt: 'C',
    effect_allele: 'C', pathway: 'Mitochondrial antioxidant defence', domain: 'detox',
    functional_impact: 'Val16Ala — reduced mitochondrial targeting of MnSOD, -30% antioxidant capacity (ClinVar: benign/likely risk)',
    het_interpretation: 'SOD2 reduced mitochondrial import (~15% capacity reduction). CoQ10 100-200mg, NAC 600mg, manganese-rich foods.',
    hom_interpretation: 'SOD2 significantly impaired (CC/AA genotype). CoQ10 200-400mg, R-lipoic acid 200mg, NAC 600mg, manganese essential.',
    protocol_action: 'CoQ10 200-400mg ubiquinol form. NAC 600mg. Manganese from nuts and seeds. Avoid excessive alcohol (SOD2 depleted).',
    risk_direction: 'risk', source: 'ClinVar/SNPedia',
  },
  {
    rsid: 'rs1695', gene: 'GSTP1', chrom: '11', pos: 67352689, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Glutathione conjugation / Phase II detox', domain: 'detox',
    functional_impact: 'GSTP1 Ile105Val — reduced glutathione S-transferase activity for detox conjugation',
    het_interpretation: 'Phase II detox mildly impaired. NAC 600mg, sulforaphane (broccoli sprouts daily), minimise environmental toxin exposure.',
    hom_interpretation: 'GSTP1 severely impaired. Aggressive glutathione support: NAC 1200mg, liposomal glutathione, sulforaphane protocol.',
    protocol_action: 'Broccoli sprouts daily (highest sulforaphane). NAC 600-1200mg. Minimise alcohol, paracetamol, fragranced products.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1138272', gene: 'GSTP1', chrom: '11', pos: 67353878, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Glutathione conjugation / Phase II detox', domain: 'detox',
    functional_impact: 'GSTP1 Ala114Val — second GSTP1 variant, compound effect with Ile105Val',
    het_interpretation: 'GSTP1 second variant — if combined with rs1695 (Ile105Val), detox burden is significantly compounded.',
    hom_interpretation: 'Homozygous GSTP1 variant. Aggressive Phase II support required. Glycine 3g/day to support conjugation.',
    protocol_action: 'Glycine 3g/day supports glutathione synthesis. Stack with NAC and sulforaphane.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1799929', gene: 'NAT2', chrom: '8', pos: 18248157, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'Phase II N-acetylation', domain: 'detox',
    functional_impact: 'NAT2 slow acetylator — reduces clearance of aromatic amines and certain drugs',
    het_interpretation: 'NAT2 intermediate acetylator. Avoid charred/grilled meats. Limit paracetamol use. Folate supports NAT2 substrate clearance.',
    hom_interpretation: 'NAT2 slow acetylator. Charred meat, nitrates, and certain drugs (isoniazid, sulfamethoxazole) have prolonged exposure. Diet modification important.',
    protocol_action: 'Avoid charred/grilled meats. Limit nitrate-cured meats. Report slow acetylator status to physicians for drug dosing.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs762551', gene: 'CYP1A2', chrom: '15', pos: 75041917, ref: 'A', alt: 'C',
    effect_allele: 'C', pathway: 'Phase I drug / caffeine metabolism', domain: 'detox',
    functional_impact: 'Slow caffeine metaboliser — prolonged caffeine half-life',
    het_interpretation: 'Intermediate CYP1A2 — caffeine half-life extended. Cutoff 13:00 for coffee. Limit to 1-2 cups maximum.',
    hom_interpretation: 'Slow CYP1A2 (CC) — caffeine half-life up to 10+ hours. Maximum 1 coffee before 10:00. Caffeine significantly disrupts sleep architecture.',
    protocol_action: 'Hard caffeine cutoff 10:00-13:00. Switch to half-strength or matcha. Never coffee after noon.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1799853', gene: 'CYP2C9', chrom: '10', pos: 96702047, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Phase I drug metabolism', domain: 'detox',
    functional_impact: 'CYP2C9 *2 — reduced clearance of NSAIDs, warfarin, ibuprofen',
    het_interpretation: 'CYP2C9 *2 carrier — reduced NSAID and warfarin clearance. Report to physicians. Prefer paracetamol for pain.',
    hom_interpretation: 'CYP2C9 *2/*2 — significantly reduced. Any warfarin or NSAID dosing must be reviewed by physician.',
    protocol_action: 'Report CYP2C9 *2 to all prescribing physicians. Avoid self-medication with NSAIDs.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1057910', gene: 'CYP2C9', chrom: '10', pos: 96741053, ref: 'A', alt: 'C',
    effect_allele: 'C', pathway: 'Phase I drug metabolism', domain: 'detox',
    functional_impact: 'CYP2C9 *3 — severely reduced enzyme activity for warfarin, NSAIDs, statins',
    het_interpretation: 'CYP2C9 *3 carrier — significant drug interaction risk. Physician review mandatory for any affected medications.',
    hom_interpretation: 'CYP2C9 *3/*3 — poor metaboliser. Standard doses of many drugs may cause toxicity. Pharmacogenomics review essential.',
    protocol_action: 'URGENT: Report to physician. CYP2C9 *3 affects warfarin (10-fold sensitivity), NSAIDs, some statins.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs4244285', gene: 'CYP2C19', chrom: '10', pos: 96522463, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'Phase I drug metabolism', domain: 'detox',
    functional_impact: 'CYP2C19 *2 — poor metaboliser of PPIs, clopidogrel, some antidepressants',
    het_interpretation: 'CYP2C19 intermediate metaboliser — PPIs may be more effective (reduced activation), clopidogrel may be less effective.',
    hom_interpretation: 'CYP2C19 poor metaboliser — clopidogrel antiplatelet effect severely reduced. Physician review for all cardiovascular medications.',
    protocol_action: 'Report to physician. Clopidogrel may be ineffective. PPI dose may need adjustment.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1056836', gene: 'CYP1B1', chrom: '2', pos: 38298604, ref: 'C', alt: 'G',
    effect_allele: 'G', pathway: 'Xenobiotic / oestrogen metabolism', domain: 'detox',
    functional_impact: 'CYP1B1 L432V — 0.3× decreased risk for prostate cancer; affects oestrogen catabolism (SNPedia/ClinVar: likely benign)',
    het_interpretation: 'CYP1B1 variant — oestrogen metabolism pathway. For female patients: monitor oestrogen metabolites. Cruciferous vegetables support CYP1B1.',
    hom_interpretation: 'CYP1B1 GG — homozygous variant. Broccoli and DIM supplementation may support oestrogen clearance pathway.',
    protocol_action: 'Cruciferous vegetables daily (broccoli, cauliflower). DIM 100mg if oestrogen dominance symptoms present.',
    risk_direction: 'benefit', source: 'SNPedia/ClinVar',
  },
  {
    rsid: 'rs1799983', gene: 'NOS3', chrom: '7', pos: 150696111, ref: 'G', alt: 'T',
    effect_allele: 'T', pathway: 'Nitric oxide / Cardiovascular', domain: 'detox',
    functional_impact: 'NOS3 Glu298Asp — endothelial nitric oxide synthase; ClinVar: benign/pathogenic/risk factor; preeclampsia risk',
    het_interpretation: 'NOS3 variant — endothelial NO production may be reduced. L-arginine or L-citrulline 3g/day, beetroot, aerobic exercise.',
    hom_interpretation: 'NOS3 rare in TT — if present, significant NO reduction risk. L-citrulline 6g/day, daily aerobic exercise essential.',
    protocol_action: 'L-citrulline 3g/day (better than L-arginine for sustained NO production). Beetroot juice pre-exercise.',
    risk_direction: 'risk', source: 'ClinVar/SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // VITAMIN D & MINERALS
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs2228570', gene: 'VDR', chrom: '12', pos: 47844974, ref: 'C', alt: 'T',
    effect_allele: 'C', pathway: 'Vitamin D receptor / Mineral absorption', domain: 'nutrients',
    functional_impact: 'VDR Fok1 — reduced receptor sensitivity; ClinVar: benign/conflicting evidence',
    het_interpretation: 'Reduced VDR sensitivity. Target serum 25-OH-D 80-100 nmol/L (not just 50). D3 2000-3000 IU + K2 MK-7 100mcg daily.',
    hom_interpretation: 'Significantly reduced VDR sensitivity. Target 100-120 nmol/L. D3 3000-5000 IU + K2 essential. Test every 6 months.',
    protocol_action: 'D3 3000-5000 IU with K2 MK-7 100mcg. Test 25-OH-D every 6 months. Target 80-100 nmol/L minimum.',
    risk_direction: 'risk', source: 'ClinVar/SNPedia',
  },
  {
    rsid: 'rs1544410', gene: 'VDR', chrom: '12', pos: 48238757, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Vitamin D receptor expression', domain: 'nutrients',
    functional_impact: 'VDR BsmI — reduced VDR expression, immune modulation',
    het_interpretation: 'VDR BsmI — mildly reduced receptor expression. Ensure D3 adequacy with cofactors (K2, Mg, boron).',
    hom_interpretation: 'VDR BsmI homozygous — significant reduction. D3 requirement increased. Test serum levels.',
    protocol_action: 'D3 cofactors: K2 MK-7 100mcg, magnesium glycinate 300mg, boron 3mg.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs7975232', gene: 'VDR', chrom: '12', pos: 48272895, ref: 'A', alt: 'C',
    effect_allele: 'C', pathway: 'Vitamin D receptor / Bone density', domain: 'nutrients',
    functional_impact: 'VDR ApaI — bone density and immune regulation',
    het_interpretation: 'VDR ApaI variant. Bone density monitoring recommended. Weight-bearing exercise essential.',
    hom_interpretation: 'VDR ApaI homozygous. Higher D3 requirement. DEXA scan after 40.',
    protocol_action: 'Weight-bearing exercise 3×/week. D3 + K2 for bone mineralisation.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs2282679', gene: 'GC', chrom: '4', pos: 72618528, ref: 'C', alt: 'A',
    effect_allele: 'A', pathway: 'Vitamin D binding protein', domain: 'nutrients',
    functional_impact: 'GC/VDBP — D3 transport protein variant; lower serum 25-OH-D levels',
    het_interpretation: 'Vitamin D binding protein variant — serum D3 levels run lower. Supplement D3 3000+ IU to compensate reduced transport.',
    hom_interpretation: 'VDBP significantly reduced. D3 supplementation essential regardless of serum levels. Higher free D fraction recommended.',
    protocol_action: 'D3 3000-5000 IU daily. VDBP variant means total 25-OH-D underestimates tissue levels — target higher.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs2274924', gene: 'TRPM6', chrom: '9', pos: 77404466, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Magnesium absorption', domain: 'nutrients',
    functional_impact: 'TRPM6 — reduced intestinal and renal magnesium transport',
    het_interpretation: 'Magnesium absorption reduced. Magnesium glycinate or malate 300mg/day. Monitor RBC magnesium (not serum).',
    hom_interpretation: 'Significant magnesium transport impairment. Mg glycinate 400mg/day. RBC Mg testing essential — serum Mg often falsely normal.',
    protocol_action: 'Magnesium glycinate 300-400mg at night. Test RBC magnesium not serum. Avoid PPI drugs (deplete Mg).',
    risk_direction: 'risk', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // NUTRIENT METABOLISM
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs7946', gene: 'PEMT', chrom: '17', pos: 17468873, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'Glycerophospholipid / Phosphatidylcholine synthesis', domain: 'nutrients',
    functional_impact: 'PEMT Gly523Asp — T;T carriers more likely to have non-alcoholic fatty liver (SNPedia)',
    het_interpretation: 'Choline synthesis mildly reduced. Eggs (yolks), liver, and lecithin are priority foods. Supplement choline 250-500mg.',
    hom_interpretation: 'Significant PEMT impairment — NAFLD risk elevated. Choline 500mg/day, phosphatidylcholine supplement. Avoid alcohol completely.',
    protocol_action: 'Choline 500mg daily (from eggs or supplement). Phosphatidylcholine for liver support. Avoid alcohol — direct NAFLD risk.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs12934922', gene: 'BCMO1', chrom: '16', pos: 81257926, ref: 'T', alt: 'C',
    effect_allele: 'C', pathway: 'Beta-carotene to Vitamin A conversion', domain: 'nutrients',
    functional_impact: 'BCMO1 R267S — beta-carotene to retinol conversion reduced ~57%',
    het_interpretation: 'Beta-carotene conversion reduced ~57%. Cannot rely on plant sources for vitamin A. Must eat preformed retinol: liver, eggs, oily fish.',
    hom_interpretation: 'BCMO1 severely impaired — near-zero conversion. Preformed vitamin A non-negotiable: liver weekly, cod liver oil, eggs daily.',
    protocol_action: 'Never rely on beta-carotene for vitamin A. Eat liver 1-2×/week or cod liver oil 1 tsp/day.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs7501331', gene: 'BCMO1', chrom: '16', pos: 81294249, ref: 'T', alt: 'C',
    effect_allele: 'C', pathway: 'Beta-carotene conversion', domain: 'nutrients',
    functional_impact: 'BCMO1 A379V — compound effect with R267S increases conversion impairment',
    het_interpretation: 'Second BCMO1 variant. Combined with rs12934922 may be near-zero conversion. Preformed vitamin A essential.',
    hom_interpretation: 'BCMO1 compound variant. Confirmed preformed vitamin A deficiency risk without supplementation.',
    protocol_action: 'Preformed vitamin A from food (liver) or supplement. Test serum retinol if unsure.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs174547', gene: 'FADS1', chrom: '11', pos: 61597212, ref: 'T', alt: 'C',
    effect_allele: 'C', pathway: 'Omega-3/6 fatty acid desaturation', domain: 'nutrients',
    functional_impact: 'FADS1 — reduced ALA→EPA→DHA conversion. Marine omega-3 essential.',
    het_interpretation: 'Omega-3 conversion mildly impaired. Direct EPA+DHA from fish or algae oil 1-2g/day. ALA from flax insufficient.',
    hom_interpretation: 'Omega-3 conversion significantly impaired. Marine DHA+EPA 2-3g/day mandatory. ALA (flax, chia) has essentially no conversion benefit.',
    protocol_action: 'Marine omega-3 (fish oil or algae oil) 2g/day DHA+EPA combined. Never rely on ALA sources for omega-3.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs174570', gene: 'FADS2', chrom: '11', pos: 61512718, ref: 'A', alt: 'T',
    effect_allele: 'T', pathway: 'Omega-3/6 fatty acid desaturation', domain: 'nutrients',
    functional_impact: 'FADS2 — delta-6 desaturase impairment, EFA metabolism',
    het_interpretation: 'FADS2 variant — EFA elongation pathway impaired. Marine omega-3 and GLA from evening primrose may help.',
    hom_interpretation: 'FADS2 compounded EFA impairment. Marine omega-3 essential. Avoid omega-6 competition from seed oils.',
    protocol_action: 'Eliminate seed oils completely (omega-6 competes with already-impaired FADS pathway). Marine omega-3 only.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs4588', gene: 'GC', chrom: '4', pos: 72618334, ref: 'C', alt: 'A',
    effect_allele: 'A', pathway: 'Vitamin D binding protein', domain: 'nutrients',
    functional_impact: 'VDBP Thr420Lys — altered vitamin D transport',
    het_interpretation: 'VDBP variant — may affect free vitamin D fraction. Monitor D3 levels to ensure adequate tissue delivery.',
    hom_interpretation: 'VDBP homozygous variant. D3 status may be underestimated by standard serum test.',
    protocol_action: 'Vitamin D supplementation with cofactors regardless of serum levels being "normal".',
    risk_direction: 'neutral', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // INFLAMMATION & IMMUNITY
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs2241880', gene: 'ATG16L1', chrom: '2', pos: 234183368, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Autophagy / NOD-like receptor signalling', domain: 'inflammation',
    functional_impact: '2-3× increased risk for Crohn\'s disease in Caucasians (SNPedia). Autophagy impaired.',
    het_interpretation: 'Autophagy pathway impaired. Intermittent fasting activates autophagy via AMPK. Spermidine (wheat germ, aged cheese) supports autophagy.',
    hom_interpretation: 'Significant autophagy impairment — Crohn\'s risk elevated. 16:8 fasting protocol important. Strict GCR elimination critical for gut healing.',
    protocol_action: 'Intermittent fasting 14:10+ to activate autophagy. Spermidine-rich foods. Gut healing protocol is highest priority.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1800795', gene: 'IL6', chrom: '7', pos: 22766645, ref: 'G', alt: 'C',
    effect_allele: 'C', pathway: 'Interleukin-6 / Systemic inflammation', domain: 'inflammation',
    functional_impact: 'IL6 -174G>C — elevated IL-6 baseline, higher inflammatory signalling',
    het_interpretation: 'Higher IL-6 inflammatory baseline. Anti-inflammatory diet critical. Omega-3 3g/day, curcumin, polyphenols daily.',
    hom_interpretation: 'CC genotype — highest IL-6 expression. Strict anti-inflammatory protocol. Eliminate seed oils, processed foods, sugar completely.',
    protocol_action: 'Omega-3 3g/day EPA+DHA. Curcumin with black pepper. Eliminate all seed oils and trans fats. Daily movement.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1800629', gene: 'TNF', chrom: '6', pos: 31543031, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'TNF-alpha / Systemic inflammation', domain: 'inflammation',
    functional_impact: 'TNF-α -308G>A — higher basal TNF-alpha expression, systemic pro-inflammatory state',
    het_interpretation: 'Elevated TNF-α baseline. GCR elimination protocol directly addresses this. Seed oil elimination is urgent — linoleic acid feeds TNF-α pathway.',
    hom_interpretation: 'AA genotype — very high TNF-α expression. Anti-inflammatory protocol is non-negotiable. Test hsCRP.',
    protocol_action: 'Eliminate seed oils completely. Omega-3 3g/day. Test hsCRP annually. Curcumin 500mg with piperine.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1205', gene: 'CRP', chrom: '1', pos: 159685936, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'C-reactive protein / Inflammation marker', domain: 'inflammation',
    functional_impact: 'CRP promoter variant — higher baseline CRP inflammatory marker',
    het_interpretation: 'CRP runs higher at baseline. Track trends not absolute values. Anti-inflammatory protocol.',
    hom_interpretation: 'CRP consistently elevated — use hsCRP trend over time, not single reading. Anti-inflammatory diet essential.',
    protocol_action: 'Use hsCRP trend as primary inflammatory biomarker. Target below 1 mg/L over 90-day protocol.',
    risk_direction: 'risk', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // LONGEVITY & APOE
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs429358', gene: 'APOE', chrom: '19', pos: 45411941, ref: 'T', alt: 'C',
    effect_allele: 'C', pathway: 'Alzheimer\'s / Lipid metabolism', domain: 'longevity',
    functional_impact: '>3× increased risk for Alzheimer\'s disease; 1.4× increased cardiovascular risk (SNPedia)',
    het_interpretation: 'One APOE4 allele — elevated Alzheimer\'s and cardiovascular risk. Strict Mediterranean diet. DHA 1g/day. No alcohol. Annual lipid panel.',
    hom_interpretation: 'Two APOE4 alleles (ε4/ε4) — highest risk. Mediterranean diet non-negotiable. DHA 2g/day. Minimize saturated fat. Cognitive monitoring from 50.',
    protocol_action: 'DHA 1-2g/day. Mediterranean eating pattern. Minimise saturated fat from processed sources. Annual cognitive + cardiovascular monitoring.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs7412', gene: 'APOE', chrom: '19', pos: 45412079, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Lipid metabolism / Longevity', domain: 'longevity',
    functional_impact: 'APOE ε2 allele — associated with longevity phenotype; lower Alzheimer\'s risk',
    het_interpretation: 'APOE ε2 — longevity-protective allele. Continue anti-inflammatory protocol. LDL may run lower than expected.',
    hom_interpretation: 'APOE ε2/ε2 — strong longevity association. Rare genotype. Monitor lipids as LDL can be paradoxically elevated.',
    protocol_action: 'Continue protocol. Monitor lipids — APOE ε2 can occasionally elevate triglycerides.',
    risk_direction: 'benefit', source: 'SNPedia',
  },
  {
    rsid: 'rs1800562', gene: 'HFE', chrom: '6', pos: 26093141, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'Iron metabolism / Oxidative stress', domain: 'longevity',
    functional_impact: 'HFE C282Y — hereditary haemochromatosis. Iron accumulation → Fenton reaction oxidative damage',
    het_interpretation: 'HFE C282Y carrier — mild iron accumulation risk. Test ferritin + transferrin saturation. Limit red meat to 2×/week. No iron supplements.',
    hom_interpretation: 'HFE C282Y homozygous — confirmed haemochromatosis risk. Physician referral for phlebotomy. No red meat or iron supplements.',
    protocol_action: 'URGENT: Test ferritin and transferrin saturation. Report to physician. No iron-containing supplements.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1799945', gene: 'HFE', chrom: '6', pos: 26091179, ref: 'C', alt: 'G',
    effect_allele: 'G', pathway: 'Iron metabolism', domain: 'longevity',
    functional_impact: 'HFE H63D — mild iron overload variant, compound risk with C282Y',
    het_interpretation: 'HFE H63D carrier — mild iron accumulation. Annual ferritin check. Max 2× red meat/week. No iron supplements.',
    hom_interpretation: 'HFE H63D homozygous — moderate iron accumulation risk. Ferritin monitoring essential. Physician aware.',
    protocol_action: 'Monitor ferritin annually. Limit red meat. No iron supplements unless deficient.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs9939609', gene: 'FTO', chrom: '16', pos: 53820527, ref: 'T', alt: 'A',
    effect_allele: 'A', pathway: 'Appetite regulation / Fat storage', domain: 'longevity',
    functional_impact: 'FTO — appetite dysregulation, obesity predisposition; exercise epigenetically silences FTO',
    het_interpretation: 'FTO risk allele — hunger signals unreliable. Protein at every meal suppresses ghrelin. Exercise is the genetic antidote — 30+ min daily.',
    hom_interpretation: 'FTO AA — strongest appetite dysregulation. Protein 30g+ at each meal. Never skip meals. Daily exercise is non-negotiable for this genotype.',
    protocol_action: '30+ min aerobic exercise daily — this epigenetically silences FTO. High protein diet. Never skip meals.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs7903146', gene: 'TCF7L2', chrom: '10', pos: 114758349, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Glucose metabolism / GLP-1 secretion', domain: 'longevity',
    functional_impact: 'Strongest common T2D genetic risk — impaired GLP-1 incretin secretion',
    het_interpretation: 'TCF7L2 risk allele — impaired glucose metabolism. Low glycaemic diet strictly. Time-restricted eating, berberine 500mg with meals.',
    hom_interpretation: 'TCF7L2 TT — highest T2D risk. Low glycaemic diet non-negotiable. Berberine 500mg 3×/day. Annual HbA1c monitoring.',
    protocol_action: 'Low glycaemic diet. Berberine 500mg with main meals. Annual HbA1c and fasting insulin. Time-restricted eating.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs2802292', gene: 'FOXO3', chrom: '6', pos: 108984436, ref: 'G', alt: 'T',
    effect_allele: 'T', pathway: 'Longevity / Stress resistance', domain: 'longevity',
    functional_impact: 'FOXO3 T allele — associated with exceptional longevity in centenarian studies',
    het_interpretation: 'FOXO3 longevity allele — caloric restriction and fasting activate FOXO3. Intermittent fasting is especially beneficial for this genotype.',
    hom_interpretation: 'FOXO3 TT — exceptional longevity association. Fasting and caloric restriction activate this pathway. Prioritise stress resilience.',
    protocol_action: 'Intermittent fasting 14:10+ activates FOXO3. Caloric moderation, not restriction. Stress management protocol.',
    risk_direction: 'benefit', source: 'SNPedia',
  },
  {
    rsid: 'rs12778366', gene: 'SIRT1', chrom: '10', pos: 69644960, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Longevity / NAD+ metabolism', domain: 'longevity',
    functional_impact: 'SIRT1 variant — longevity-associated deacetylase; affected by NAD+ availability',
    het_interpretation: 'SIRT1 variant — NAD+ precursors (NMN, NR) may be especially beneficial. Fasting and exercise activate SIRT1.',
    hom_interpretation: 'SIRT1 TT — NAD+ supplementation protocol. NMN 250-500mg or NR 300mg. Fasting and exercise essential.',
    protocol_action: 'NMN 250-500mg or NR 300mg morning. Intermittent fasting activates SIRT1. Exercise compounds the effect.',
    risk_direction: 'benefit', source: 'SNPedia',
  },
  {
    rsid: 'rs11591147', gene: 'PCSK9', chrom: '1', pos: 55505647, ref: 'G', alt: 'T',
    effect_allele: 'T', pathway: 'LDL clearance / Cardiovascular', domain: 'longevity',
    functional_impact: 'PCSK9 gain-of-function — reduced LDL receptor recycling, elevated LDL risk',
    het_interpretation: 'PCSK9 variant — LDL clearance affected. Annual lipid panel. Mediterranean diet. Omega-3 3g/day.',
    hom_interpretation: 'PCSK9 homozygous — significant LDL elevation risk. Physician review. Statin discussion if LDL elevated.',
    protocol_action: 'Annual lipid panel. Mediterranean diet. Report to cardiologist if LDL > 5 mmol/L.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs328', gene: 'LPL', chrom: '8', pos: 19840709, ref: 'C', alt: 'G',
    effect_allele: 'G', pathway: 'Triglyceride clearance / Lipid metabolism', domain: 'longevity',
    functional_impact: 'LPL S447X — protective variant associated with higher HDL, lower triglycerides',
    het_interpretation: 'LPL S447X — favourable lipid profile (lower TG, higher HDL). Continue protocol. Omega-3 compounds this benefit.',
    hom_interpretation: 'LPL S447X homozygous — strong protection against hypertriglyceridemia. Omega-3 supplementation beneficial.',
    protocol_action: 'Omega-3 EPA+DHA compounds the triglyceride-lowering benefit of this protective variant.',
    risk_direction: 'benefit', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // ANS & NEUROTRANSMITTER
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs6323', gene: 'MAOA', chrom: 'X', pos: 43515410, ref: 'G', alt: 'T',
    effect_allele: 'T', pathway: 'Monoamine catabolism / Neurotransmitter degradation', domain: 'ans',
    functional_impact: 'MAOA — T allele encodes lower-activity MAO-A; serotonin/dopamine/NE cleared more slowly (SNPedia)',
    het_interpretation: 'Lower MAOA activity — monoamines linger longer. Magnesium glycinate 300mg, P5P B6 25mg support degradation cofactors.',
    hom_interpretation: 'Low-activity MAOA — significant monoamine accumulation risk. Stress management priority. Avoid tyramine-rich foods on high-stress days.',
    protocol_action: 'Magnesium glycinate. P5P B6 25mg. Limit fermented foods (tyramine) during stress. Regular aerobic exercise for monoamine balance.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1800497', gene: 'DRD2', chrom: '11', pos: 113283459, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Dopamine D2 receptor / Reward system', domain: 'ans',
    functional_impact: 'DRD2 TaqIA — reduced D2 receptor density; lower dopaminergic signalling',
    het_interpretation: 'Reduced D2 receptor density — reward circuit less responsive. Exercise is the primary dopamine intervention. Avoid addictive compounds.',
    hom_interpretation: 'TT — significantly reduced D2 density. Very high addictive substance risk. Exercise essential for dopamine regulation.',
    protocol_action: 'Daily aerobic exercise for dopamine. Tyrosine-rich foods (eggs, turkey, beef). Avoid all addictive substances.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs25531', gene: 'SLC6A4', chrom: '17', pos: 28521337, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Serotonin transport / Stress resilience', domain: 'ans',
    functional_impact: '5-HTTLPR proxy — serotonin transporter; affects stress response and reuptake',
    het_interpretation: 'Serotonin transport variant — stress resilience may be lower. Tryptophan-rich dinner (turkey, pumpkin seeds). Mind-body practice.',
    hom_interpretation: 'Reduced serotonin transport — heightened stress reactivity. HRV coherence breathing, tryptophan diet, social connection priority.',
    protocol_action: 'Tryptophan at dinner (turkey, pumpkin seeds, eggs). HRV coherence breathing 10 min/day. Social connection is biological medicine.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs53576', gene: 'OXTR', chrom: '3', pos: 8775022, ref: 'A', alt: 'G',
    effect_allele: 'A', pathway: 'Oxytocin receptor / Parasympathetic tone', domain: 'ans',
    functional_impact: 'OXTR rs53576 — oxytocin receptor variant; social bonding and parasympathetic response',
    het_interpretation: 'OXTR AA — social engagement directly activates oxytocin pathway and vagal tone. Social connection is a clinical intervention.',
    hom_interpretation: 'OXTR variant — parasympathetic tone may be affected. Prioritise social connection, physical contact, nature exposure.',
    protocol_action: 'Social engagement protocol: regular face-to-face contact. Nature exposure 20 min/day. These are direct oxytocin activators.',
    risk_direction: 'neutral', source: 'SNPedia',
  },
  {
    rsid: 'rs1042713', gene: 'ADRB2', chrom: '5', pos: 148206461, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Beta-2 adrenergic receptor', domain: 'ans',
    functional_impact: 'ADRB2 Arg16Gly — altered catecholamine sensitivity and exercise heart rate response',
    het_interpretation: 'ADRB2 variant — exercise cardiovascular response may differ. Monitor HRV and heart rate during training to calibrate intensity.',
    hom_interpretation: 'ADRB2 GG — beta-2 receptor sensitivity altered. HRV monitoring during training recommended.',
    protocol_action: 'Use HRV to guide training intensity rather than heart rate targets alone.',
    risk_direction: 'neutral', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // CIRCADIAN RHYTHM & SLEEP
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs5751876', gene: 'ADORA2A', chrom: '22', pos: 24598203, ref: 'T', alt: 'C',
    effect_allele: 'C', pathway: 'Adenosine receptor / Caffeine sensitivity', domain: 'circadian',
    functional_impact: 'ADORA2A — high caffeine sensitivity; sleep pressure builds rapidly after caffeine',
    het_interpretation: 'Heightened caffeine sensitivity. Maximum 1 coffee before 10:00. Caffeine disrupts adenosine sleep pressure even at small doses.',
    hom_interpretation: 'CC — very high caffeine sensitivity. Any caffeine after 09:00 will measurably delay sleep onset. Switch to herbal tea.',
    protocol_action: 'Maximum 1 coffee strictly before 10:00. Switch to matcha or herbal alternatives. Protect adenosine sleep pressure.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs57875989', gene: 'PER2', chrom: '2', pos: 239179935, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Circadian clock / Sleep timing', domain: 'circadian',
    functional_impact: 'PER2 period gene — circadian phase shift, altered sleep timing',
    het_interpretation: 'PER2 variant — circadian drift tendency. Strict 22:30 sleep, blackout blinds, blue light block from 20:00.',
    hom_interpretation: 'PER2 TT — significant circadian dysregulation risk. Morning light therapy within 30 min of waking. Fixed sleep schedule.',
    protocol_action: 'Morning bright light within 30 min of waking (10,000 lux or outdoor). Fixed sleep/wake times. Blue light glasses from 20:00.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1801260', gene: 'CLOCK', chrom: '4', pos: 56298551, ref: 'T', alt: 'C',
    effect_allele: 'C', pathway: 'Core circadian clock gene', domain: 'circadian',
    functional_impact: 'CLOCK 3111T>C — circadian locomotor output cycles, sleep timing, metabolic rhythm',
    het_interpretation: 'CLOCK variant — circadian rhythm may have free-running drift. Morning light anchors the clock. Fixed meal timing is essential.',
    hom_interpretation: 'CLOCK CC — strong circadian dysregulation tendency. Light-dark cycle discipline is a clinical priority.',
    protocol_action: 'Fixed wake time 7 days/week. Meals at consistent times. Morning light as alarm clock.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs2304672', gene: 'PER2', chrom: '2', pos: 239179935, ref: 'G', alt: 'C',
    effect_allele: 'C', pathway: 'Circadian clock', domain: 'circadian',
    functional_impact: 'PER2 variant — circadian period regulation',
    het_interpretation: 'PER2 regulatory variant. Support circadian hygiene: consistent sleep/wake, morning light, evening darkness.',
    hom_interpretation: 'PER2 homozygous variant. Strong circadian anchoring protocol required.',
    protocol_action: 'Consistent sleep schedule, morning light, evening darkness protocol.',
    risk_direction: 'neutral', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // EXERCISE & HORMESIS
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs1815739', gene: 'ACTN3', chrom: '11', pos: 66560624, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Fast-twitch muscle / Exercise response', domain: 'exercise',
    functional_impact: 'ACTN3 R577X — alpha-actinin-3 absent; shifts phenotype toward endurance, away from power',
    het_interpretation: 'Mixed power/endurance phenotype. Both strength training and cardio are effective. Zone 2 cardio for longevity priority.',
    hom_interpretation: 'TT (XX) — endurance phenotype. No alpha-actinin-3. Zone 2 cardio is most effective. Plyometric power training has lower impact.',
    protocol_action: 'Zone 2 aerobic training 3-5×/week. Strength training 2×/week for metabolic health. Avoid excessive HIIT.',
    risk_direction: 'neutral', source: 'SNPedia',
  },
  {
    rsid: 'rs8192678', gene: 'PPARGC1A', chrom: '4', pos: 23808660, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Mitochondrial biogenesis / PGC-1α', domain: 'exercise',
    functional_impact: 'PPARGC1A Gly482Ser — reduced mitochondrial biogenesis response to exercise',
    het_interpretation: 'Mitochondrial biogenesis mildly reduced. Zone 2 cardio and cold exposure are primary mitochondrial activators.',
    hom_interpretation: 'TT — mitochondrial biogenesis significantly reduced. Zone 2 cardio critical — 45+ min 3×/week. Cold shower daily activates PGC-1α.',
    protocol_action: 'Zone 2 cardio 45+ min 3×/week. Cold shower protocol. CoQ10 200mg supports existing mitochondrial function.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs6265', gene: 'BDNF', chrom: '11', pos: 27679916, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Brain-derived neurotrophic factor / Neuroplasticity', domain: 'exercise',
    functional_impact: 'BDNF Val66Met — impaired activity-dependent BDNF secretion and neuroplasticity',
    het_interpretation: 'BDNF Val66Met carrier — exercise-induced BDNF is the primary trigger. 30+ min aerobic exercise required for neuroplasticity.',
    hom_interpretation: 'BDNF TT — significantly reduced secretion. Exercise is the most powerful intervention. No alcohol (blocks BDNF). Social learning.',
    protocol_action: 'Minimum 30 min aerobic exercise daily for BDNF. No alcohol. Learning new skills activates BDNF. Omega-3 DHA supports BDNF.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1799752', gene: 'ACE', chrom: '17', pos: 61565784, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Angiotensin / Blood pressure response to exercise', domain: 'exercise',
    functional_impact: 'ACE I/D proxy — insertion allele associated with endurance, deletion with power',
    het_interpretation: 'ACE insertion allele (endurance type) — responds well to cardiovascular training. Blood pressure management through exercise.',
    hom_interpretation: 'ACE II — strong endurance responder. Cardiovascular training has higher adaptation rate.',
    protocol_action: 'Cardiovascular training produces above-average blood pressure and aerobic adaptation for this genotype.',
    risk_direction: 'benefit', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // SUN & SKIN
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs1805007', gene: 'MC1R', chrom: '16', pos: 89985844, ref: 'T', alt: 'C',
    effect_allele: 'C', pathway: 'Melanocortin / UV response', domain: 'sun',
    functional_impact: 'MC1R R151C — pheomelanin dominant, reduced UV protection, highest melanoma risk (SNPedia)',
    het_interpretation: 'MC1R variant — reduced UV protection. SPF 50 daily. Vitamin D supplement essential (cannot synthesise efficiently in sun).',
    hom_interpretation: 'MC1R homozygous — very high UV damage risk. SPF 50 non-negotiable. Dermatologist annually. D3 3000+ IU regardless of sun exposure.',
    protocol_action: 'SPF 50 daily on face/hands. Dermatologist check annually. D3 supplement as cannot synthesise adequately.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs1805008', gene: 'MC1R', chrom: '16', pos: 89986117, ref: 'C', alt: 'T',
    effect_allele: 'T', pathway: 'Melanocortin / UV response', domain: 'sun',
    functional_impact: 'MC1R R160W — pheomelanin dominant, melanoma risk elevated',
    het_interpretation: 'MC1R R160W — UV sensitivity. Avoid peak sun 11:00-15:00. Astaxanthin 4-8mg/day for internal UV protection.',
    hom_interpretation: 'Homozygous MC1R R160W — high melanoma risk. Daily SPF. Astaxanthin. Dermatologist annually.',
    protocol_action: 'Astaxanthin 4-8mg/day as internal UV protector. SPF 50. Annual skin check.',
    risk_direction: 'risk', source: 'SNPedia',
  },
  {
    rsid: 'rs12913832', gene: 'HERC2', chrom: '15', pos: 28365618, ref: 'A', alt: 'G',
    effect_allele: 'G', pathway: 'Eye/skin pigmentation / UV tolerance', domain: 'sun',
    functional_impact: 'HERC2/OCA2 — blue/green eye variant associated with higher UV sensitivity',
    het_interpretation: 'HERC2 variant — lighter eye/skin pigmentation, higher UV sensitivity. Eye protection (UV400 sunglasses) and SPF important.',
    hom_interpretation: 'HERC2 GG — lowest melanin, highest UV sensitivity. Daily SPF, UV400 sunglasses, D3 supplement.',
    protocol_action: 'UV400 sunglasses outdoors. SPF 30+ on face. D3 supplementation as UV avoidance limits synthesis.',
    risk_direction: 'neutral', source: 'SNPedia',
  },

  // ══════════════════════════════════════════════════════
  // GLUCOSE & METABOLIC
  // ══════════════════════════════════════════════════════
  {
    rsid: 'rs10877012', gene: 'CYP27B1', chrom: '12', pos: 57926665, ref: 'G', alt: 'A',
    effect_allele: 'A', pathway: 'Vitamin D activation / 1,25-OH-D synthesis', domain: 'nutrients',
    functional_impact: 'CYP27B1 — 25-OH-D to active 1,25-OH-D conversion; affects immune and metabolic vitamin D function',
    het_interpretation: 'Vitamin D activation step impaired. Even adequate 25-OH-D may not convert efficiently. Magnesium supports CYP27B1.',
    hom_interpretation: 'CYP27B1 AA — significant activation impairment. Magnesium 300mg (CYP27B1 cofactor). Higher D3 target.',
    protocol_action: 'Magnesium is a CYP27B1 cofactor — supplement 300mg daily to support D3 activation.',
    risk_direction: 'risk', source: 'SNPedia',
  },

];

// ── Position index for fast VCF lookup ──
// Key: "CHROM:POS:REF:ALT" (no chr prefix, GRCh37)
export const POS_INDEX = Object.fromEntries(
  CLINICAL_SNPS.map(snp => [`${snp.chrom}:${snp.pos}:${snp.ref}:${snp.alt}`, snp])
);

// ── rsID index for 23andMe / annotated VCF files ──
export const RSID_INDEX = Object.fromEntries(
  CLINICAL_SNPS.map(snp => [snp.rsid, snp])
);

// ── Set of all clinical rsIDs (for streaming filter) ──
export const CLINICAL_RSID_SET = new Set(CLINICAL_SNPS.map(snp => snp.rsid));
