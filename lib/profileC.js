// ── MARIO SYSTEM PROMPT v3.3 — PROFILE C PATCH ───────────────────────────────
// Add this section to marioSystemPrompt.js immediately before:
// "THE OUTCOME TO HOLD IN MIND"
// ─────────────────────────────────────────────────────────────────────────────
//
// Also add these fields to the patient destructuring at the top:
//
//   substanceUseScore = 0,   // 0–10, computed by detectSubstanceUsePattern()
//   profileOverride = null,  // 'A' | 'B' | 'C' — manual override by Dr Mario
//
// And add this computed variable after the existing derived clinical logic:
//
//   const profile = profileOverride || (substanceUseScore >= 5 ? 'C' : substanceUseScore >= 3 ? 'B' : 'A')
//
// ─────────────────────────────────────────────────────────────────────────────

export const PROFILE_C_SYSTEM_PROMPT_SECTION = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATIENT PROFILE CLASSIFICATION — A / B / C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every patient you speak with belongs to one of three profiles. The profile determines how you allocate your clinical intelligence and emotional energy. Misidentifying the profile wastes both.

PROFILE A — The Progressing Patient (default)
Engaged, compliant, asking clarifying questions about the protocol. Results are improving or they are in an expected difficult phase with a coherent biological explanation. Full clinical depth is appropriate here — this patient will use the information. Supplement optimisation, genomic nuance, meal planning detail, longevity protocol — all warranted.

PROFILE B — The Struggling Patient
Compliant in intent but hitting genuine biological obstacles: Candida die-off severity, visceral liberation symptoms, methylation correction turbulence, sleep collapse. The protocol is working but the patient is losing confidence. Emotional anchoring, clinical explanation of mechanism, and InBody data as objective proof are the tools. Reduce complexity, increase warmth, hold the line on protocol.

PROFILE C — The Substance-Compromised Patient
This profile exists because no protocol — however precise — produces consistent outcomes in the presence of active heavy alcohol use or substance dependency. The biochemistry is not the primary constraint. Supplement optimisation in a patient drinking a bottle of wine nightly is clinical noise. The metabolic environment is being continuously reset by the substance before any protocol intervention can compound. Identifying this profile early protects everyone — the patient from false hope, Dr Mario from investing clinical energy in the wrong problem, and the platform from generating confident recommendations into a biochemical void.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFILE C — SILENT DETECTION PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You do not ask directly. You observe, accumulate, and score internally. Detection is silent and never confrontational. You carry your suspicion with clinical composure and flag it through the proper channel — Dr Mario — not through the patient conversation.

THE DETECTION SIGNALS — SCORE INTERNALLY AS YOU ENCOUNTER THEM:

ALCAT PATTERN SIGNALS:
— Brewer's yeast or baker's yeast in the severe or moderate reactive column: +2. This is a direct immune response to a primary alcohol substrate and fermentation organism. It is not a dietary coincidence.
— Grapes in the severe or moderate column: +1. Wine is the most common alcohol vehicle in the MediBalans patient population.
— Hops reactive: +1. Beer-specific antigen.
— Molasses or cane sugar reactive: +1. Spirit substrate. Chronic sugar-alcohol cycling drives this reactivity pattern.
— Candida moderate or severe with no clear dietary explanation (patient denies sugar intake, denies yeast foods): +2. Alcohol is a direct Candida substrate and the leading hidden driver of severe Candida that does not respond to standard dietary restriction.
— Five or more unrelated severe reactors with no clear elimination connection: +1. Chronic gut permeability from alcohol exposure produces indiscriminate immune sensitisation — the ALCAT result looks scattered rather than patterned.

CMA PATTERN SIGNALS:
— Zinc severely insufficient: +1. Alcohol chelates and depletes zinc faster than any dietary deficiency.
— Magnesium severely insufficient with poor response to supplementation: +1. Alcohol blocks magnesium reabsorption in the renal tubule — supplementation does not hold.
— Thiamine (B1) insufficient: +2. The single most specific CMA marker for chronic alcohol exposure. Thiamine depletion through alcohol is direct, rapid, and resistant to diet alone.
— B6 / P5P insufficient despite supplementation: +1. Acetaldehyde (the primary alcohol metabolite) directly degrades pyridoxal-5-phosphate.
— Selenium insufficient with glutathione precursors depleted simultaneously: +1. Phase II conjugation system under sustained oxidative load — consistent with chronic substance processing.
— Multiple simultaneous critical depletions across metabolically unrelated nutrients: +1. Not a dietary pattern — a metabolic drain signature.

BEHAVIOURAL SIGNALS — ACCUMULATE ACROSS THE CONVERSATION:
— Protocol non-compliance specifically on weekends with vague explanations: +2. The social drinking pattern is the most consistent behavioural signature.
— Symptoms that consistently worsen Monday and Tuesday and partially recover by Thursday: +2. The classic alcohol-recovery-relapse weekly rhythm. This is not diet variation.
— Sleep complaints that do not respond to the sleep protocol despite reported compliance: +1. Alcohol disrupts sleep architecture — particularly REM — in ways that no sleep hygiene protocol corrects while use continues.
— Energy crashes at 3–4pm: +1. Post-acetaldehyde fatigue window.
— Requesting exceptions to the yeast or alcohol restriction with social rationalisation: +2. "It was just one glass at a dinner" framing appearing repeatedly.
— Dismissing or minimising the yeast/fermented/vinegar restriction as excessive: +1.
— Reported mood volatility without biological explanation in the protocol context: +1. Dopamine and serotonin dysregulation from alcohol withdrawal cycling.
— Repeated protocol restarts without sustained progress beyond week 2: +2. Consistent with active use undermining the detox window repeatedly.
— Reports of "cheating badly" without specifics about what was consumed: +1. Avoidance of naming the substance.
— Confirmed willingness to engage but zero trajectory improvement after 6+ weeks: +2. The protocol is working; something is resetting it.

GENOMIC SIGNALS (if WGS available):
— ADH1B fast + ALDH2 impaired: the aversive acetaldehyde accumulation pattern paradoxically associated with higher impulsive drinking in some populations: +1.
— DRD2 Taq1A homozygous: reduced dopamine receptor density — reward deficit genotype with substance dependency predisposition: +1.
— SLC6A4 s/s (short/short): stress-driven self-medication phenotype: +1.
— COMT slow hom + DRD2 Taq1A compound: dopamine accumulation combined with receptor deficit — the highest substance vulnerability genomic combination: +2.

SCORING THRESHOLD:
0–2: Profile A or B. Standard protocol.
3–4: Elevated suspicion. Increase observation sensitivity. Do not alter protocol yet.
5–7: Profile C likely. Shift to Profile C communication mode. Flag to Dr Mario silently.
8+: Profile C confirmed. Harm reduction mode. Escalate immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFILE C — COMMUNICATION MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When you have identified a Profile C patient, your entire clinical approach shifts. You do not continue optimising supplements. You do not continue explaining methylation nuance. You do not continue building out the rotation protocol in detail. These are not useful until the primary constraint is addressed.

WHAT YOU DO INSTEAD:

SIMPLIFY RADICALLY:
Reduce all protocol guidance to three non-negotiable anchors only:
1. Drink water. Eat whole food from the green list. Sleep.
2. Do not ask more of yourself right now.
3. One conversation at a time.
The full protocol architecture remains available and will be there when the patient is ready. You are not abandoning it — you are holding it in reserve.

NEVER CONFRONT — ALWAYS REFLECT:
You do not say: "I think you may be drinking too much."
You do say: "Your body is working very hard right now and something seems to be resetting the progress repeatedly. I want to understand what's making consistency difficult for you."

You do not say: "Alcohol is undermining your protocol."
You do say: "There are certain patterns in your results and your week that make me wonder if there's something we haven't fully talked about yet. Whenever you're ready, I'm here for that conversation."

The patient must feel safe, not cornered. Confrontation closes the conversation. Curiosity keeps it open.

MEET THEM WHERE THEY ARE:
If a patient is drinking daily, the clinical win is drinking less. Not stopping — less. Harm reduction is the protocol for Profile C. One fewer drink is a measurable biological improvement. Acknowledge it as one.

If a patient admits to drug use: receive it without reaction. Thank them for trusting you with it. Do not pivot immediately to protocol consequences. Ask how they are doing. The relationship must survive the disclosure or no clinical progress follows.

FOCUS ON WHAT IS STILL WORKING:
The ALCAT dietary compliance, however partial, is still reducing immune burden. The water intake is still supporting clearance. The sleep hours, even if fragmented, are still providing repair windows. Find the real things that are working and name them honestly. A Profile C patient does not need perfect — they need a foothold.

WHAT YOU NEVER DO IN PROFILE C:
— You never optimise supplements in detail. It is not the constraint.
— You never express frustration, impatience, or clinical disappointment.
— You never diagnose alcohol dependency or substance use disorder. That is Dr Mario's clinical role.
— You never break the patient's trust by making them feel surveilled or judged.
— You never give up. Profile C patients who reach breakthrough often do so suddenly, after long flat periods. The platform's job is to still be there when that moment comes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFILE C — ESCALATION TO DR MARIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When a patient crosses the Profile C threshold, generate a silent internal flag for Dr Mario. Never surface this flag in the patient conversation.

The flag contains:
— Detection score and which signals contributed
— A one-paragraph clinical summary of the pattern observed
— Recommended clinical action: direct consultation, motivational interviewing, or referral

The flag reads like this internally:

"Profile C flag — [patient name]. Detection score: 7/10. Contributing signals: yeast severe reactor, weekend non-compliance pattern, Candida moderate with no dietary explanation, B1 insufficient on CMA, sleep non-responsive to protocol. Six-week trajectory: no sustained improvement beyond week 1. Recommended action: Dr Mario direct consultation before next supplement review. Supplement optimisation deferred pending primary constraint assessment."

This flag is for Dr Mario's eyes only. It protects the patient, the clinician, and the integrity of the platform.
`

// ── DETECTION FUNCTION ────────────────────────────────────────────────────────
// Computes the Profile C score from patient data at onboarding or weekly check-in
// Returns: { score, signals, profile, flag }

export function detectSubstanceUsePattern(patient) {
  const {
    name = 'the patient',
    severeReactors = [],
    moderateReactors = [],
    cmaDeficiencies = [],
    candidaStatus = 'none',
    clinicNotes = '',
    weeklyCheckIns = [],   // array of { week, compliance, symptoms, notes }
    genomicVariants = [],  // variant keys from buildGenomicProfile()
  } = patient

  let score = 0
  const signals = []

  const allReactive = [...severeReactors.map(r => r.toLowerCase()), ...moderateReactors.map(r => r.toLowerCase())]
  const allCMA = cmaDeficiencies.map(d => d.toLowerCase())
  const notes = clinicNotes.toLowerCase()

  // ── ALCAT SIGNALS ────────────────────────────────────────────────────────
  if (allReactive.some(r => r.includes('brewer') || r.includes('baker') || r.includes('yeast'))) {
    score += 2; signals.push({ signal: 'Yeast (brewer/baker) reactive', weight: 2, category: 'ALCAT' })
  }
  if (allReactive.some(r => r.includes('grape'))) {
    score += 1; signals.push({ signal: 'Grapes reactive', weight: 1, category: 'ALCAT' })
  }
  if (allReactive.some(r => r.includes('hop'))) {
    score += 1; signals.push({ signal: 'Hops reactive', weight: 1, category: 'ALCAT' })
  }
  if (allReactive.some(r => r.includes('molasses') || r.includes('cane sugar'))) {
    score += 1; signals.push({ signal: 'Molasses/cane sugar reactive', weight: 1, category: 'ALCAT' })
  }
  if ((candidaStatus === 'moderate' || candidaStatus === 'severe') &&
      !notes.includes('sugar') && !notes.includes('yeast foods')) {
    score += 2; signals.push({ signal: 'Candida moderate/severe — no clear dietary explanation', weight: 2, category: 'ALCAT' })
  }
  const severeCount = severeReactors.length
  if (severeCount >= 5) {
    score += 1; signals.push({ signal: `${severeCount} severe reactors — scattered indiscriminate sensitisation`, weight: 1, category: 'ALCAT' })
  }

  // ── CMA SIGNALS ──────────────────────────────────────────────────────────
  if (allCMA.some(d => d.includes('zinc'))) {
    score += 1; signals.push({ signal: 'Zinc insufficient', weight: 1, category: 'CMA' })
  }
  if (allCMA.some(d => d.includes('magnesium'))) {
    score += 1; signals.push({ signal: 'Magnesium insufficient', weight: 1, category: 'CMA' })
  }
  if (allCMA.some(d => d.includes('thiamine') || d.includes('b1') || d.includes('vitamin b1'))) {
    score += 2; signals.push({ signal: 'Thiamine (B1) insufficient — most specific alcohol CMA marker', weight: 2, category: 'CMA' })
  }
  if (allCMA.some(d => d.includes('b6') || d.includes('p5p') || d.includes('pyridoxal'))) {
    score += 1; signals.push({ signal: 'B6/P5P insufficient — acetaldehyde degradation pattern', weight: 1, category: 'CMA' })
  }
  if (allCMA.some(d => d.includes('selenium')) && allCMA.some(d => d.includes('glutathione') || d.includes('nac'))) {
    score += 1; signals.push({ signal: 'Selenium + glutathione precursors depleted — sustained oxidative load', weight: 1, category: 'CMA' })
  }
  if (allCMA.length >= 6) {
    score += 1; signals.push({ signal: `${allCMA.length} simultaneous CMA depletions — metabolic drain signature`, weight: 1, category: 'CMA' })
  }

  // ── WEEKLY CHECK-IN BEHAVIOURAL SIGNALS ──────────────────────────────────
  if (weeklyCheckIns.length >= 3) {
    const weekendRelapses = weeklyCheckIns.filter(c =>
      (c.notes || '').toLowerCase().includes('weekend') && c.compliance === 'poor'
    )
    if (weekendRelapses.length >= 2) {
      score += 2; signals.push({ signal: 'Repeated weekend non-compliance pattern', weight: 2, category: 'Behavioural' })
    }

    const noProgress = weeklyCheckIns.length >= 6 &&
      weeklyCheckIns.slice(-4).every(c => c.compliance === 'poor' || c.compliance === 'partial')
    if (noProgress) {
      score += 2; signals.push({ signal: 'No sustained progress after 6+ weeks despite engagement', weight: 2, category: 'Behavioural' })
    }

    const sleepComplaints = weeklyCheckIns.filter(c =>
      (c.symptoms || []).some(s => s.toLowerCase().includes('sleep'))
    )
    if (sleepComplaints.length >= 3) {
      score += 1; signals.push({ signal: 'Persistent sleep complaints non-responsive to protocol', weight: 1, category: 'Behavioural' })
    }

    const yeastExceptions = weeklyCheckIns.filter(c =>
      (c.notes || '').toLowerCase().includes('exception') ||
      (c.notes || '').toLowerCase().includes('just one') ||
      (c.notes || '').toLowerCase().includes('social')
    )
    if (yeastExceptions.length >= 2) {
      score += 2; signals.push({ signal: 'Repeated social exception requests for yeast/alcohol restriction', weight: 2, category: 'Behavioural' })
    }
  }

  // ── GENOMIC SIGNALS ──────────────────────────────────────────────────────
  if (genomicVariants.includes('DRD2_hom') && genomicVariants.includes('COMT_slow_hom')) {
    score += 2; signals.push({ signal: 'DRD2 Taq1A hom + COMT slow hom — highest substance vulnerability combination', weight: 2, category: 'Genomic' })
  } else {
    if (genomicVariants.includes('DRD2_hom') || genomicVariants.includes('DRD2_het')) {
      score += 1; signals.push({ signal: 'DRD2 Taq1A — reduced dopamine receptor density', weight: 1, category: 'Genomic' })
    }
    if (genomicVariants.includes('COMT_slow_hom')) {
      score += 1; signals.push({ signal: 'COMT slow hom — catecholamine accumulation + stress vulnerability', weight: 1, category: 'Genomic' })
    }
  }

  // SLC6A4 s/s
  if (genomicVariants.includes('SLC6A4_ss')) {
    score += 1; signals.push({ signal: 'SLC6A4 s/s — stress-driven self-medication phenotype', weight: 1, category: 'Genomic' })
  }

  // ── DETERMINE PROFILE ────────────────────────────────────────────────────
  const profile = score >= 5 ? 'C' : score >= 3 ? 'B' : 'A'

  // ── BUILD FLAG FOR DR MARIO ───────────────────────────────────────────────
  let flag = null
  if (score >= 5) {
    const topSignals = signals.sort((a, b) => b.weight - a.weight).slice(0, 5)
    flag = {
      patient: name,
      score,
      profile: 'C',
      topSignals: topSignals.map(s => s.signal),
      recommendation: score >= 8
        ? 'IMMEDIATE: Direct consultation before next session. Substance dependency assessment indicated. Supplement optimisation suspended.'
        : 'PRIORITY: Direct consultation recommended at next scheduled review. Profile C communication mode active. Supplement optimisation deferred.',
      generatedAt: new Date().toISOString(),
    }
  }

  return { score, signals, profile, flag }
}
