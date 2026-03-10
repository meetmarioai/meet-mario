// ── MEET MARIO — LONGEVITY GENOMICS ENGINE ────────────────────────────────────
// MediBalans AB — Dr Mario Anthis PhD
//
// Layer 4: HORMESIS & mTOR PATHWAY GENOMICS
//
// The Adaptive Human framework: chronic disease = molecular silence.
// These SNPs determine how efficiently a patient activates the three master
// longevity regulators — SIRT1, AMPK, NRF2 — and how they regulate mTOR.
//
// Clinical output:
//   - Fasting protocol personalisation (mTOR suppression window)
//   - Exercise timing (mTOR activation vs autophagy)
//   - Cold/heat exposure protocols (hormetic dose)
//   - Supplement selection (rapamycin-pathway, NRF2 activators, NAD+ axis)
//   - Protein timing and leucine threshold
//   - Autophagy efficiency and dietary triggers
// ─────────────────────────────────────────────────────────────────────────────

export const LONGEVITY_SNPS = {

  // ══════════════════════════════════════════════════════════════════════════
  // NRF2 PATHWAY — Master antioxidant and hormetic stress regulator
  // SIRT1 → deacetylates NRF2 → nuclear translocation → HO-1, NQO1, GST, GPX
  // ══════════════════════════════════════════════════════════════════════════

  rs6721961: {
    gene: 'NFE2L2', name: 'NRF2 promoter — hormetic response threshold',
    ref: 'C', alt: 'A',
    interpretations: {
      hom_ref: { // CC — high NRF2 baseline
        label: 'Robust NRF2 hormetic response (CC)',
        guidance: 'Optimal NRF2 transcriptional activity. Hormetic stressors — exercise, intermittent fasting, cold exposure, phytochemicals — activate a strong antioxidant and detoxification response. Your biology is well-designed for challenge.',
        hormesis: 'Standard hormetic protocols fully indicated. NRF2 activates efficiently at physiological stress doses.',
        supplement_note: 'Sulforaphane (from cruciferous — if not ALCAT reactive): most potent dietary NRF2 activator. Avoid boiling — use raw or lightly steamed broccoli sprouts.',
        fasting: 'Intermittent fasting strongly activates NRF2 — 16:8 minimum indicated for longevity benefit.',
      },
      het: {
        label: 'Moderately reduced NRF2 activity (CA)',
        guidance: 'One reduced-function allele. NRF2 response is present but submaximal. Hormetic dose needs to be slightly higher to achieve equivalent activation.',
        hormesis: 'Increase hormetic stimulus intensity: longer fasting window (18:6), higher exercise intensity, more consistent cold exposure.',
        supplement_note: 'NRF2 activator support: Sulforaphane + Quercetin + R-ALA. These act synergistically on NRF2-KEAP1 axis.',
      },
      hom_alt: { // AA — reduced NRF2 promoter activity
        label: 'Reduced NRF2 hormetic response (AA)',
        guidance: 'Significantly reduced NRF2 baseline transcription. Hormetic adaptations are blunted — the body responds less efficiently to exercise, fasting, and phytochemical stress signals. Higher oxidative stress accumulation at rest.',
        hormesis: 'Hormetic interventions are MORE important, not less — but must be delivered consistently. One-off hormetic stress has minimal benefit; chronic mild stress is the strategy.',
        supplement_note: 'NRF2 activator stack: Sulforaphane equivalent (broccoli sprout extract 400mcg sulforaphane) + Curcumin (as Theracurmin or Meriva — bioavailable forms only) + R-ALA 300mg + NAC 500mg. This is the compensatory stack for AA.',
        flag: 'NRF2 AA — compound this with GST null variants if present: oxidative stress burden is high. Antioxidant stack is clinical, not optional.',
        fasting: '20:4 or 24h fasting protocols required to achieve equivalent NRF2 activation as CC achieves with 16:8.',
      },
    },
  },

  rs11085735: {
    gene: 'KEAP1', name: 'KEAP1 — NRF2 inhibitor sensitivity',
    ref: 'A', alt: 'C',
    interpretations: {
      hom_ref: {
        label: 'Standard NRF2/KEAP1 equilibrium',
        guidance: 'Normal KEAP1-mediated NRF2 regulation. NRF2 activation follows expected hormetic dose-response.',
        hormesis: null, supplement_note: null,
      },
      het: {
        label: 'Reduced KEAP1 inhibition — elevated baseline NRF2',
        guidance: 'KEAP1 variant reduces NRF2 inhibition — higher baseline antioxidant gene expression. Paradoxically, some cancers exploit this. In healthy individuals: enhanced baseline detox capacity.',
        hormesis: 'Enhanced NRF2 baseline means smaller hormetic doses are sufficient. High-dose NRF2 activators may be redundant.',
        supplement_note: 'Reduce sulforaphane supplementation — dietary intake sufficient. Focus on SIRT1/AMPK activators instead.',
      },
      hom_alt: {
        label: 'Significantly reduced KEAP1 — possible NRF2 overactivation',
        guidance: 'Strongly reduced KEAP1. High baseline NRF2 — confirm via clinical picture. Excess NRF2 can paradoxically impair immune surveillance.',
        flag: 'KEAP1 hom alt — discuss with clinical team. NRF2 activator supplementation may not be indicated.',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SIRT1 PATHWAY — Caloric restriction sensor, NAD+ dependent
  // SIRT1 → deacetylates PGC-1α, FOXO, NRF2, p53, NFkB
  // Activated by: NAD+, resveratrol, fasting, exercise
  // ══════════════════════════════════════════════════════════════════════════

  rs7895833: {
    gene: 'SIRT1', name: 'SIRT1 expression — longevity axis activity',
    ref: 'A', alt: 'G',
    interpretations: {
      hom_ref: {
        label: 'High SIRT1 expression (AA)',
        guidance: 'Optimal SIRT1 transcription. Caloric restriction mimetics and NAD+ precursors yield maximal benefit. The SIRT1→PGC-1α→mitochondrial biogenesis axis is fully responsive.',
        hormesis: 'Fasting activates SIRT1 powerfully. 16:8 IF provides significant longevity signalling.',
        supplement_note: 'NMN+5™ directly feeds this axis. NAD+ precursor → SIRT1 activation → PGC-1α deacetylation → mitochondrial biogenesis. This patient will respond strongly.',
        nmn_indication: 'STRONG — full NMN+5 protocol indicated.',
      },
      het: {
        label: 'Intermediate SIRT1 expression (AG)',
        guidance: 'Moderate SIRT1 transcription. NAD+ precursors and caloric restriction mimetics are beneficial.',
        supplement_note: 'NMN+5 indicated. Resveratrol as SIRT1 allosteric activator adds benefit beyond NAD+ alone.',
        nmn_indication: 'INDICATED.',
      },
      hom_alt: {
        label: 'Reduced SIRT1 expression (GG)',
        guidance: 'Reduced SIRT1 baseline. The caloric restriction longevity pathway is attenuated. This patient accumulates biological entropy faster under identical conditions to high-SIRT1 counterparts.',
        hormesis: 'Fasting is MORE important for this patient — the one intervention that most reliably upregulates SIRT1 expression even in GG. Minimum 16:8, prefer 18:6.',
        supplement_note: 'NMN+5 is therapeutic — directly compensates reduced SIRT1 activity. Add Trans-Resveratrol 250mg (SIRT1 allosteric activator — works independently of NAD+). Pterostilbene 50mg as longer-acting resveratrol analogue.',
        nmn_indication: 'STRONGLY INDICATED — therapeutic priority.',
        flag: 'SIRT1 GG — accelerated biological entropy rate. NMN+5 + fasting protocol are clinical interventions.',
      },
    },
  },

  rs3740051: {
    gene: 'SIRT3', name: 'SIRT3 — mitochondrial sirtuin',
    ref: 'G', alt: 'A',
    interpretations: {
      hom_ref: {
        label: 'Optimal mitochondrial sirtuin activity',
        guidance: 'SIRT3 deacetylates key mitochondrial proteins including SOD2, IDH2, and PDHA1. Normal mitochondrial efficiency and ROS regulation.',
        supplement_note: null,
      },
      het: {
        label: 'Reduced SIRT3 activity',
        guidance: 'Impaired mitochondrial protein deacetylation. Mitochondrial efficiency reduced. Compounds SOD2 variants if present.',
        supplement_note: 'Nicotinamide Riboside (NR) or NMN — SIRT3 is NAD+-dependent. CoQ10 Ubiquinol. R-ALA.',
      },
      hom_alt: {
        label: 'Significantly reduced SIRT3',
        guidance: 'Significant mitochondrial dysfunction risk. SIRT3 loss is associated with metabolic syndrome, hearing loss, and age-related disease.',
        supplement_note: 'NMN+5 strongly indicated. CoQ10 Ubiquinol 200mg. R-ALA 300mg. Magnesium Bisglycinate — mitochondrial cofactor.',
        flag: 'SIRT3 hom alt — mitochondrial health is a clinical priority. Exercise and NAD+ precursors are the primary interventions.',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AMPK PATHWAY — Cellular energy sensor
  // Activated by: exercise, fasting, metformin, berberine, AICAR
  // AMPK → inhibits mTORC1 → activates autophagy, mitochondrial biogenesis
  // ══════════════════════════════════════════════════════════════════════════

  rs2796498: {
    gene: 'PRKAA2', name: 'AMPK α2 catalytic subunit',
    ref: 'G', alt: 'A',
    interpretations: {
      hom_ref: {
        label: 'Optimal AMPK α2 activity',
        guidance: 'AMPK energy sensing fully functional. Fasting, exercise, and caloric restriction activate the AMPK→mTOR inhibition→autophagy axis efficiently.',
        fasting: 'Standard fasting protocols yield full AMPK activation.',
        supplement_note: null,
      },
      het: {
        label: 'Reduced AMPK α2 sensitivity',
        guidance: 'Moderate AMPK impairment. Energy stress signalling is blunted — longer fasting windows needed to achieve equivalent AMPK activation.',
        fasting: 'Extend fasting window: 18:6 minimum for AMPK activation. Morning exercise in fasted state doubles the AMPK signal.',
        supplement_note: 'Berberine 500mg with meals — activates AMPK independently of food restriction. Most evidence-based AMPK activator.',
      },
      hom_alt: {
        label: 'Significantly reduced AMPK α2',
        guidance: 'Meaningful AMPK pathway impairment. Insulin resistance risk, impaired autophagy activation, reduced mTOR inhibition in fasted state. The cellular engine that powers the Adaptive Human framework is running suboptimally.',
        fasting: '20:4 fasting indicated. OMAD (one meal a day) 1–2x/week has therapeutic AMPK-activating effect beyond caloric restriction alone.',
        supplement_note: 'Berberine 500mg 3x/day with meals — strongest non-pharmacological AMPK activator. Equivalent metabolic effect to metformin in multiple studies. Alpha Lipoic Acid — independent AMPK activator via ROS signalling.',
        flag: 'PRKAA2 hom alt — AMPK pathway impairment. Berberine is a clinical recommendation, not optional supplementation.',
        mtor_note: 'Reduced AMPK means mTORC1 inhibition is blunted — more protein restriction time required to achieve autophagy induction.',
      },
    },
  },

  rs154268: {
    gene: 'STK11', name: 'LKB1 — AMPK upstream activator',
    ref: 'C', alt: 'T',
    interpretations: {
      hom_ref: { label: 'Normal LKB1-AMPK activation', guidance: null },
      het: {
        label: 'Reduced LKB1 upstream AMPK activation',
        guidance: 'LKB1 phosphorylates and activates AMPK in response to energy stress. Variant reduces the signal that tells AMPK the cell is energy-depleted.',
        supplement_note: 'AICAR-pathway supplements: EGCG (green tea — if not ALCAT reactive), Quercetin. Both activate AMPK via LKB1-independent CaMKKβ pathway.',
        fasting: 'Exercise in fasted state is the strongest LKB1-independent AMPK activator — CaMKKβ pathway activated by calcium flux.',
      },
      hom_alt: {
        label: 'Significantly impaired LKB1→AMPK signalling',
        guidance: 'LKB1 null variants are oncogenic in Peutz-Jeghers syndrome. Heterozygous functional variants in healthy individuals impair AMPK activation.',
        flag: 'STK11 hom alt — refer for gastroenterological assessment if not previously done. AMPK pathway impairment is secondary concern.',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // mTOR PATHWAY — Master growth and protein synthesis regulator
  // mTORC1 activated by: leucine, insulin, IGF-1, amino acids, growth factors
  // mTORC1 inhibited by: AMPK, rapamycin, fasting, low leucine
  // KEY TENSION: mTOR activation = muscle growth; mTOR inhibition = autophagy
  // Optimal longevity = temporal separation of these states
  // ══════════════════════════════════════════════════════════════════════════

  rs2295080: {
    gene: 'MTOR', name: 'mTOR promoter — baseline activity',
    ref: 'T', alt: 'C',
    interpretations: {
      hom_ref: { // TT — lower mTOR activity (longevity-associated)
        label: 'Lower baseline mTOR activity (TT) — longevity-associated',
        guidance: 'TT allele associated with reduced mTORC1 baseline signalling. This is the longevity-associated genotype — lower mTOR activity extends lifespan across multiple model organisms. Autophagy activates more readily with fasting.',
        mtor: 'Fasting windows yield rapid autophagy induction. 16h fast likely sufficient for meaningful autophagy.',
        protein_timing: 'Anabolic window is real but not critical. Can afford longer post-exercise protein delay (up to 2h) while maintaining muscle protein synthesis.',
        supplement_note: null,
      },
      het: {
        label: 'Intermediate mTOR activity (TC)',
        guidance: 'Balanced mTOR signalling. Responds well to both anabolic (training + protein) and catabolic (fasting) phases when properly timed.',
        mtor: 'Standard 16:8 fasting protocol. Post-exercise protein within 45 minutes.',
        protein_timing: 'Leucine threshold: 2.5–3g per meal to maximally stimulate mTORC1 for muscle protein synthesis.',
      },
      hom_alt: { // CC — higher mTOR activity
        label: 'Elevated baseline mTOR activity (CC)',
        guidance: 'Chronically elevated mTOR is associated with accelerated aging, reduced autophagy, and increased cancer risk. The cell is biased toward growth over maintenance. In young, healthy, well-nourished patients: excellent muscle gain potential. In older patients or those with chronic disease: longevity concern.',
        mtor: 'Extended fasting required to adequately suppress mTOR for autophagy. Minimum 18h fast. 24h fast 1x/week has therapeutic mTOR suppression effect.',
        protein_timing: 'Avoid constant protein feeding — intermittent protein restriction periods important for autophagy induction even within eating window.',
        supplement_note: 'Berberine: AMPK activator → mTOR inhibitor. Most effective non-pharmacological mTOR modulator. Curcumin: direct mTOR inhibitor via PI3K/AKT pathway.',
        flag: 'mTOR CC — elevated baseline signalling. Extended fasting protocol is a clinical longevity intervention. Discuss cancer surveillance with older patients.',
      },
    },
  },

  rs11868112: {
    gene: 'RPTOR', name: 'Raptor — mTORC1 scaffold protein',
    ref: 'A', alt: 'G',
    interpretations: {
      hom_ref: { label: 'Normal mTORC1 assembly', guidance: null },
      het: {
        label: 'Altered mTORC1 scaffolding',
        guidance: 'Raptor variant affects mTORC1 complex assembly efficiency. Impact on nutrient sensing and autophagy initiation.',
        mtor: 'Leucine and insulin signalling to mTOR may be attenuated. Higher protein per meal needed to maximally activate mTORC1 post-exercise.',
        protein_timing: 'Leucine threshold elevated: aim for 3–3.5g leucine per post-exercise meal.',
      },
      hom_alt: {
        label: 'Significantly altered mTORC1 complex',
        guidance: 'Raptor hom alt may impair nutrient-sensing arm of mTOR. Autophagy may be constitutively elevated or dysregulated.',
        flag: 'RPTOR hom alt — mTOR nutrient sensing impaired. Monitor muscle mass and anabolic response to training.',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FOXO3 — LONGEVITY TRANSCRIPTION FACTOR
  // Inhibited by mTOR/PI3K/AKT → activated when mTOR is suppressed
  // FOXO3 → stress resistance, autophagy, DNA repair, apoptosis
  // Associated with human centenarian studies
  // ══════════════════════════════════════════════════════════════════════════

  rs2802292: {
    gene: 'FOXO3', name: 'Longevity-associated FOXO3 variant',
    ref: 'T', alt: 'G',  // G allele = longevity
    interpretations: {
      hom_alt: { // GG — longevity genotype
        label: 'FOXO3 longevity genotype (GG) — centenarian allele',
        guidance: 'The most replicated human longevity SNP. GG allele consistently overrepresented in centenarians across multiple independent cohorts (Okinawan, European, American). FOXO3 activates stress resistance genes, autophagy, and DNA repair when mTOR is suppressed.',
        mtor: 'This patient\'s biology is primed for longevity — fasting and mTOR suppression unlock FOXO3-driven cellular maintenance programs that most people cannot access.',
        hormesis: 'Hormetic stress is particularly potent here. Exercise, fasting, cold, and heat all converge on FOXO3 activation via AMPK and SIRT1.',
        supplement_note: 'NMN+5 and fasting synergise with FOXO3 GG: SIRT1 deacetylates FOXO3 → nuclear localisation → longevity gene expression. This is the molecular basis of the Adaptive Human framework in this patient.',
        longevity_note: 'FOXO3 GG: if this patient follows the full MediBalans protocol — ALCAT compliance + CMA repletion + methylation correction + fasting + exercise — the biological age reduction potential is among the highest possible.',
      },
      het: {
        label: 'FOXO3 TG — partial longevity advantage',
        guidance: 'One longevity allele. Partial FOXO3 activation advantage. Responds well to longevity interventions.',
        hormesis: 'Fasting and exercise activate FOXO3 via SIRT1. Consistent lifestyle is the key variable.',
        supplement_note: 'NMN+5 supported for FOXO3 activation.',
      },
      hom_ref: { // TT — no longevity allele
        label: 'FOXO3 TT — standard stress resistance',
        guidance: 'No FOXO3 longevity allele. Standard FOXO3 activity. Longevity interventions (fasting, exercise, NMN) still highly beneficial but cellular stress resistance baseline is lower.',
        hormesis: 'Hormetic interventions are MOST important in TT — this patient\'s biology needs external activation more than GG. Fasting and exercise are therapeutic.',
        supplement_note: 'NMN+5 + Resveratrol: SIRT1 activation is the best available compensatory route for FOXO3 TT.',
        flag: 'FOXO3 TT — no centenarian allele. Longevity protocol adherence is the primary lever available.',
      },
    },
  },

  rs13217795: {
    gene: 'FOXO3', name: 'FOXO3 second locus',
    ref: 'C', alt: 'T',
    interpretations: {
      hom_alt: { label: 'Second FOXO3 longevity locus TT', guidance: 'Compound FOXO3 advantage if rs2802292 also favourable.', nmn_indication: 'STRONGLY INDICATED' },
      het: { label: 'FOXO3 second locus CT', guidance: null },
      hom_ref: { label: 'No second FOXO3 locus advantage', guidance: null },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AUTOPHAGY — Cellular cleaning machinery
  // Activated by: mTOR suppression, AMPK activation, Beclin-1
  // ══════════════════════════════════════════════════════════════════════════

  rs2336904: {
    gene: 'BECN1', name: 'Beclin-1 — autophagy initiation',
    ref: 'C', alt: 'T',
    interpretations: {
      hom_ref: {
        label: 'Normal autophagy initiation',
        guidance: 'Beclin-1 function intact. Autophagy initiates at expected fasting duration (~14–16h for meaningful induction).',
        fasting: '16:8 IF produces meaningful autophagy. Standard protocol.',
      },
      het: {
        label: 'Reduced autophagy initiation efficiency',
        guidance: 'Beclin-1 variant reduces PIK3C3 complex formation — the initiation event for phagophore assembly. Autophagy induction requires longer fasting windows.',
        fasting: '18:6 minimum. 24h fast monthly is therapeutic — "deep clean" protocol.',
        supplement_note: 'Spermidine (from wheat germ — if not ALCAT reactive, or supplement form) is the most potent dietary autophagy inducer via Beclin-1-independent TG2 pathway. 1mg/day.',
        mtor: 'Combine fasting with post-exercise protein restriction window: train fasted, delay protein 2h, then eat. This maximises AMPK↑ mTOR↓ autophagy window.',
      },
      hom_alt: {
        label: 'Significantly impaired autophagy initiation',
        guidance: 'Beclin-1 hom alt — substantially reduced autophagy capacity. Cellular waste accumulates. Associated with neurodegeneration and cancer risk in aging.',
        fasting: '20:4 fasting protocol strongly recommended. Monthly 48h fast for therapeutic cellular clearance.',
        supplement_note: 'Spermidine 2mg/day. EGCG (green tea — if not ALCAT reactive): independent autophagy activator. Resveratrol → SIRT1 → FOXO1 → autophagy gene expression.',
        flag: 'BECN1 hom alt — impaired autophagy. Fasting protocol is a clinical longevity intervention. Neurodegeneration risk monitoring relevant in older patients.',
      },
    },
  },

  rs10512520: {
    gene: 'ATG16L1', name: 'ATG16L1 — autophagosome elongation',
    ref: 'A', alt: 'G',
    interpretations: {
      hom_ref: { label: 'Normal autophagosome formation', guidance: null },
      het: {
        label: 'Reduced autophagosome elongation',
        guidance: 'ATG16L1 variant impairs autophagosome membrane elongation. Associated with Crohn\'s disease susceptibility — mitophagy (mitochondrial autophagy) is impaired.',
        fasting: 'Extended fasting compensates reduced efficiency. 18:6 minimum.',
        supplement_note: 'Urolithin A (from pomegranate — if not ALCAT reactive, or supplement) is the most specific mitophagy activator known. Directly compensates ATG16L1 impairment.',
      },
      hom_alt: {
        label: 'Significantly impaired autophagosome formation',
        guidance: 'Substantial mitophagy impairment. Dysfunctional mitochondria accumulate. Higher chronic inflammation baseline.',
        supplement_note: 'Urolithin A 500mg. Spermidine. CoQ10 Ubiquinol — mitochondrial protection while mitophagy impaired.',
        flag: 'ATG16L1 hom alt — screen for inflammatory bowel symptoms. Gut-specific autophagy impairment is relevant to ALCAT protocol.',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // IGF-1 AXIS — Growth factor → mTOR activation
  // High IGF-1 = growth/mTOR activation; Low IGF-1 = longevity in model organisms
  // ══════════════════════════════════════════════════════════════════════════

  rs35767: {
    gene: 'IGF1', name: 'IGF-1 promoter — baseline growth factor signalling',
    ref: 'G', alt: 'A',
    interpretations: {
      hom_ref: {
        label: 'High IGF-1 production tendency',
        guidance: 'Elevated baseline IGF-1 drives mTORC1 via AKT/PI3K pathway continuously. Excellent anabolic response to protein and resistance training. However, chronically elevated IGF-1 accelerates aging via mTOR in post-reproductive life.',
        mtor: 'mTOR is chronically stimulated by IGF-1 independently of food. Fasting is more important for this genotype — it reduces IGF-1 and allows mTOR suppression.',
        protein_timing: 'Muscle gain is highly efficient. However, avoid constant protein feeding — this compounds IGF-1-driven mTOR activation.',
        fasting: 'Protein restriction periods and fasting reduce IGF-1 and allow FOXO3 activation. This genotype benefits most from periodic fasting.',
        supplement_note: null,
      },
      het: { label: 'Intermediate IGF-1 production', guidance: 'Balanced anabolic/catabolic signalling. Standard protocol.', mtor: null },
      hom_alt: {
        label: 'Lower IGF-1 production tendency',
        guidance: 'Lower baseline IGF-1. Associated with longevity (Laron syndrome extreme: very low IGF-1 = dramatically extended healthspan). However, too low IGF-1 impairs muscle maintenance and bone density in aging.',
        mtor: 'mTOR suppression occurs more readily — autophagy activates efficiently with standard fasting.',
        protein_timing: 'Higher protein per meal important to compensate reduced IGF-1-driven muscle protein synthesis. Leucine threshold: 3g per meal.',
        supplement_note: 'Resistance training is essential to compensate lower IGF-1 anabolic drive. Creatine Monohydrate 3g/day supports muscle protein synthesis independently of IGF-1.',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HEAT SHOCK PROTEINS — Proteostasis and stress response
  // ══════════════════════════════════════════════════════════════════════════

  rs1043618: {
    gene: 'HSPA1A', name: 'HSP70 — heat shock protein expression',
    ref: 'C', alt: 'G',
    interpretations: {
      hom_ref: {
        label: 'High HSP70 expression — robust proteostasis',
        guidance: 'Strong heat shock response. Misfolded proteins are efficiently chaperones. Heat and cold hormesis activate HSP70 effectively.',
        hormesis: 'Sauna (80–100°C, 20 min) and cold plunge (10–15°C, 2–3 min) are highly indicated — maximal HSP70 activation and hormetic benefit.',
      },
      het: {
        label: 'Intermediate HSP70 expression',
        guidance: 'Standard heat shock response. Sauna and cold exposure still beneficial.',
        hormesis: 'Sauna 3x/week. Cold shower or brief cold plunge daily.',
      },
      hom_alt: {
        label: 'Reduced HSP70 expression — impaired proteostasis',
        guidance: 'Reduced heat shock response. Misfolded protein accumulation risk. Higher neurodegeneration and cardiovascular disease susceptibility under chronic stress.',
        hormesis: 'Thermal hormesis is MOST important for this genotype. Regular sauna use directly compensates reduced baseline HSP70 by providing the heat stimulus for induction even in the low-expressor genotype.',
        supplement_note: 'Astaxanthin (from Haematococcus pluvialis — already in VitaminLab): HSP70 inducer. Curcumin: HSP70 inducer via HSF1. Glycine 1g/day supports proteostasis independently.',
        flag: 'HSPA1A hom alt — proteostasis impairment. Sauna is a clinical recommendation for this patient.',
      },
    },
  },

  rs2227956: {
    gene: 'HSPA1B', name: 'HSP70 variant — stress-induced expression',
    ref: 'T', alt: 'C',
    interpretations: {
      hom_ref: { label: 'Normal stress-induced HSP70', guidance: null },
      het: {
        label: 'Reduced stress-induced HSP70 induction',
        guidance: 'Blunted induction in response to thermal and oxidative stress. More thermal stimulus required.',
        hormesis: 'Extended sauna sessions (25–30 min) or higher frequency (4–5x/week).',
      },
      hom_alt: {
        label: 'Significantly impaired stress-induced HSP70',
        guidance: 'Compounds HSPA1A variants if present. Proteostasis significantly impaired under stress.',
        supplement_note: 'Astaxanthin + Curcumin + Glycine as HSP support stack.',
        flag: 'Compound HSP70 impairment (HSPA1A + HSPA1B) — sauna and cold protocols are clinical.',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HIF-1α — Hypoxic response and mitochondrial efficiency
  // ══════════════════════════════════════════════════════════════════════════

  rs11549465: {
    gene: 'HIF1A', name: 'HIF-1α Pro582Ser — hypoxic response',
    ref: 'C', alt: 'T',  // Pro582Ser — T allele = increased HIF1A stability
    interpretations: {
      hom_ref: {
        label: 'Standard hypoxic response',
        guidance: 'Normal HIF-1α stability under hypoxia. Standard altitude and hypoxic training response.',
        hormesis: 'Altitude training or hypoxic exercise (nasal breathing only, Wim Hof-style) activates HIF-1α.',
      },
      het: {
        label: 'Enhanced HIF-1α stability (Pro/Ser)',
        guidance: 'Ser allele increases HIF-1α stability — more potent hypoxic response. Enhanced EPO production and angiogenic response to hypoxic training. Better altitude adaptation.',
        hormesis: 'Hypoxic training highly indicated — exceptional HIF-1α activation. Breath-hold training, altitude, or hypoxic masks yield superior response.',
        training: 'Zone 2 training with nasal-only breathing (self-imposed hypoxia) is particularly potent for this genotype.',
      },
      hom_alt: {
        label: 'High HIF-1α stability (Ser/Ser)',
        guidance: 'Highest HIF-1α stability. Strong hypoxic response. In healthy individuals: superior altitude adaptation and angiogenic potential. In chronic disease: sustained HIF-1α can drive inflammatory and pro-angiogenic signalling.',
        training: 'Hypoxic training highly effective. Monitor inflammatory markers — sustained HIF-1α has dual effects.',
        flag: 'HIF1A Ser/Ser — excellent athletic adaptation potential, but chronic inflammatory condition context requires monitoring.',
      },
    },
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// FASTING PROTOCOL CALCULATOR
// Integrates mTOR, AMPK, FOXO3, Beclin-1 variants to personalise IF prescription
// ══════════════════════════════════════════════════════════════════════════════

/**
 * buildFastingProtocol
 * Returns personalised fasting recommendation based on longevity SNP profile
 *
 * @param {object} longevityResults - output from buildLongevityProfile()
 * @returns {object} { protocol, rationale, therapeutic_fasts }
 */
export function buildFastingProtocol(longevityResults) {
  let minHours = 14
  let reasons = []
  let therapeuticFasts = []

  const mtor = longevityResults['MTOR']
  const ampk = longevityResults['PRKAA2']
  const becn1 = longevityResults['BECN1']
  const foxo3 = longevityResults['FOXO3']
  const sirt1 = longevityResults['SIRT1']
  const igf1 = longevityResults['IGF1']

  if (mtor?.zygosity === 'hom_alt') { minHours = Math.max(minHours, 20); reasons.push('mTOR CC — extended suppression required') }
  if (mtor?.zygosity === 'het') { minHours = Math.max(minHours, 16); reasons.push('mTOR TC — standard 16h target') }

  if (ampk?.zygosity === 'hom_alt') { minHours = Math.max(minHours, 20); reasons.push('AMPK α2 impaired — fasted exercise required') }
  if (ampk?.zygosity === 'het') { minHours = Math.max(minHours, 16) }

  if (becn1?.zygosity === 'hom_alt') { minHours = Math.max(minHours, 20); reasons.push('Beclin-1 impaired — longer fast for autophagy induction') }
  if (becn1?.zygosity === 'het') { minHours = Math.max(minHours, 18); reasons.push('Beclin-1 het — 18h for meaningful autophagy') }

  if (igf1?.zygosity === 'hom_ref') { minHours = Math.max(minHours, 18); reasons.push('High IGF-1 tendency — fasting reduces IGF-1/mTOR axis') }

  if (foxo3?.zygosity === 'hom_ref') { minHours = Math.max(minHours, 18); reasons.push('No FOXO3 longevity allele — extended fasting is primary FOXO3 activator') }

  if (sirt1?.zygosity === 'hom_alt') { reasons.push('SIRT1 reduced — fasting is critical NAD+/SIRT1 activator') }

  // Eating window
  const eatingHours = 24 - minHours
  const protocol = `${minHours}:${eatingHours} intermittent fasting`

  // Therapeutic fasts
  if (minHours >= 20) {
    therapeuticFasts.push('24h fast 1x/week — therapeutic mTOR suppression')
    therapeuticFasts.push('48h fast 1x/month — deep autophagy, stem cell activation')
  } else if (minHours >= 18) {
    therapeuticFasts.push('24h fast 2x/month')
  } else {
    therapeuticFasts.push('24h fast 1x/month')
  }

  return {
    protocol,
    fasting_hours: minHours,
    eating_hours: eatingHours,
    rationale: reasons,
    therapeutic_fasts: therapeuticFasts,
    exercise_timing: minHours >= 18
      ? 'Train in the last 2h of the fasting window — peak AMPK activation + acute mTOR rebound post-protein = optimal anabolic window'
      : 'Train fasted or in early eating window. Consume protein within 30–45 min post-training.',
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PROTEIN TIMING CALCULATOR
// Based on mTOR, IGF-1, ACTN3, and lean mass goals
// ══════════════════════════════════════════════════════════════════════════════

/**
 * buildProteinProtocol
 * Personalises protein intake, leucine threshold, and timing
 */
export function buildProteinProtocol(longevityResults, lifestyleResults, bodyweightKg) {
  let proteinPerKg = 1.6  // baseline
  let leucineThreshold = 2.5  // grams per meal to trigger MPS
  const reasons = []

  const igf1 = longevityResults['IGF1']
  const mtor = longevityResults['MTOR']
  const actn3 = lifestyleResults?.['ACTN3']

  if (igf1?.zygosity === 'hom_alt') { proteinPerKg = 2.0; reasons.push('Low IGF-1 tendency — higher protein to compensate reduced anabolic drive') }
  if (mtor?.zygosity === 'hom_ref') { leucineThreshold = 3.0; reasons.push('mTOR TT — higher leucine threshold for MPS activation') }
  if (actn3?.zygosity === 'hom_alt') { proteinPerKg = Math.max(proteinPerKg, 1.8); reasons.push('ACTN3 XX — endurance genotype, protein supports muscle maintenance') }

  const totalProteinG = Math.round(proteinPerKg * bodyweightKg)
  const mealsPerDay = 3
  const proteinPerMeal = Math.round(totalProteinG / mealsPerDay)

  return {
    total_protein_g: totalProteinG,
    protein_per_kg: proteinPerKg,
    leucine_threshold_g: leucineThreshold,
    protein_per_meal_g: proteinPerMeal,
    rationale: reasons,
    sources: 'Animal protein preferred during protocol (complete amino acid profile). Eggs, poultry, fish from green ALCAT list. No plant protein isolates during detox.',
    timing: 'Protein at every meal. Post-exercise: first priority meal within eating window. Do not train and delay protein beyond 2h unless autophagy is the therapeutic goal.',
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MARIO AI CONTEXT BUILDER — LONGEVITY
// ══════════════════════════════════════════════════════════════════════════════

/**
 * buildLongevityMarioContext
 * Generates the longevity section of the Mario AI system prompt injection
 */
export function buildLongevityMarioContext(longevityResults, fastingProtocol, proteinProtocol) {
  const lines = ['\n════════════════════════════════════════════════════════════════']
  lines.push('LONGEVITY GENOMICS — HORMESIS & mTOR PROFILE')
  lines.push('════════════════════════════════════════════════════════════════\n')

  for (const result of Object.values(longevityResults)) {
    if (!result?.guidance) continue
    lines.push(`[${result.gene}] ${result.label}`)
    lines.push(`  Guidance: ${result.guidance}`)
    if (result.hormesis) lines.push(`  Hormesis: ${result.hormesis}`)
    if (result.mtor) lines.push(`  mTOR: ${result.mtor}`)
    if (result.supplement_note) lines.push(`  Supplement: ${result.supplement_note}`)
    if (result.fasting) lines.push(`  Fasting: ${result.fasting}`)
    lines.push('')
  }

  if (fastingProtocol) {
    lines.push(`PERSONALISED FASTING PROTOCOL: ${fastingProtocol.protocol}`)
    lines.push(`Rationale: ${fastingProtocol.rationale.join('; ')}`)
    lines.push(`Exercise timing: ${fastingProtocol.exercise_timing}`)
    lines.push(`Therapeutic fasts: ${fastingProtocol.therapeutic_fasts.join('; ')}`)
    lines.push('')
  }

  if (proteinProtocol) {
    lines.push(`PROTEIN PROTOCOL: ${proteinProtocol.total_protein_g}g/day (${proteinProtocol.protein_per_kg}g/kg)`)
    lines.push(`Leucine threshold per meal: ${proteinProtocol.leucine_threshold_g}g`)
    lines.push(`Protein per meal target: ${proteinProtocol.protein_per_meal_g}g`)
    lines.push('')
  }

  return lines.join('\n')
}
