
## Appendix A — Clinical Rules (Never Violate)

These rules are encoded in the system prompt but Claude Code must understand them
when building or modifying any clinical feature.

### 1. The 90-Day Rule
First 90 days: green list ONLY. Zero exceptions regardless of reactivity tier.
Rationale: Complete innate immune rest required for mucosal repair and adaptive
immune memory decay. Even one exposure resets the clock.

### 2. Mild Reactions Are Real
Mild ALCAT reactions = real innate immune activation (granulocyte degranulation).
They accumulate silently with daily exposure. Never treat mild as "safe" or
"acceptable for occasional use." In protocol logic, mild foods are ELIMINATED
in Phase 1 alongside severe and moderate.

### 3. The 4-Day Rotation Window
96-hour conservative buffer mapping to granulocyte resolution kinetics.
After Phase 1, green list foods rotate on a 4-day cycle. Never generate
meal plans that repeat a food within 4 days.

### 4. Reintroduction Sequence (Standard)
Phase 1 (Days 1–90): Green list only
Phase 2 (Days 91–120): Mild reactors reintroduced one at a time, 96hr observation
Phase 3 (Days 120+): Moderate reactors attempted last
Severe reactors: Many are permanent eliminations. Never auto-reintroduce.

### 5. Reintroduction Sequence (Concordance — MRT patients)
Phase 1 (Days 1–90): Green list only (concordant safe foods = core rotation)
Phase 2a (Days 91–120): ALCAT-only discordant foods first (lowest failure risk)
Phase 2b (Days 121–150): MRT-only discordant foods (higher risk, symptom monitored)
Phase 3 (Days 150+): Concordant reactive foods last, one at a time, 96hr windows

### 6. Geography Dimension
Reactions to ancestral foods (e.g. cold-water fish for Scandinavian patients) signal
DEEP entropic burden — the barrier has failed so severely that even well-recognised
molecules trigger reactions. Reactions to geographically foreign foods may reflect
population-level library gaps, not individual pathology. Never treat these the same
in protocol severity or patient communication.

### 7. Entropy Depth Estimation
Internal calculation, never shown to patients by name:
- Age > 45: +1 signal
- Symptom duration > 5 years: +1 signal
- Multiple methylation variants (>2): +1 signal
- Family history of chronic disease: +1 signal
- Recent migration (<10 years, non-native geography): +1 signal
Signals 0–1 = low entropy | 2–3 = medium | 4+ = high

### 8. Seed Oil Universal Exclusion
Always excluded regardless of ALCAT result:
sunflower, canola, rapeseed, soybean, cottonseed, corn oil, "vegetable oil"
Only acceptable oils: olive (if olive clears ALCAT), coconut, tallow, ghee (if dairy clears)

### 9. Canned Fish Protocol
Canned fish = nutritionally equivalent to fresh. 100g mackerel covers weekly omega-3.
BUT: packing fluid must be cross-referenced against ALCAT. Seed oils excluded universally.
Olive oil packing only if olive is on the patient's green list. Water-packed is always safe.

### 10. Manuka Distinction
Manuka UMF 10+ (1 tsp morning): therapeutic — methylglyoxal antimicrobial, prebiotic.
This is a PROTOCOL element, not a sweetener. It is the only sugar permitted in Phase 1.
Regular honey: excluded. Manuka below UMF 10: excluded.

### 11. Food Communication Philosophy
Sensory and emotional language. Protocol framed as biological precision, not restriction.
Every recommendation connected to the patient's specific data. Never say "you can't eat X."
Say "your immune system is currently reacting to X — once the barrier repairs, we'll
reintroduce it and see how your biology responds."

### 12. Mario Responds in Plain Prose
No markdown formatting in chat responses. No **bold**, no - bullet points, no ## headers.
Patients see raw text. Mario speaks in conversational paragraphs like a doctor would.

### 13. File Type Discrimination is Mandatory
ALCAT = food reactivity. CMA = intracellular nutrients. VCF = genomic variants. Standard blood work = serum markers. Each file type has its own storage namespace. NEVER mix data across types.

---

## Appendix B — Security Architecture

### What is server-side (protected)
- `lib/marioSystemPrompt.js` — full system prompt (NOTE: currently imported by page.jsx — still reaches client bundle. Moving to app/api/lib/ is a pending task.)
- `app/api/lib/clinicalSNPs.js` — SNP database (migrated, not in client bundle)
- `app/api/vcf/route.js` — VCF position matching
- `app/api/score/route.js` — BES scoring formula
- `app/api/parse-lab/route.js` — ALCAT/CMA parsing prompt templates
- `ANTHROPIC_API_KEY` — environment variable, server-only
- Population dataset processing and cross-referencing logic

### What is client-side (public)
- UI layout and styling (page.jsx)
- Onboarding question flow (questions visible, scoring hidden)
- Result display (scores shown, formulas hidden)
- File upload handling (reads file, sends to server API)

### Verification
After any deployment, confirm no proprietary data in client bundle:
```bash
npm run build
grep -r "clinicalSNPs\|POS_INDEX\|MTHFR\|rs1801133\|sigmoid\|Biological Entropy" .next/static/
# Should return ZERO matches
```

### Blood Work / Standard Lab PDFs
Blood work / standard lab PDFs are a NEW file type. They must NOT be routed into ALCAT arrays (severe/moderate/mild). They need their own data namespace: bloodWork[]

### GitHub Repo
Must be PRIVATE. Never make public. Even with server-side logic,
the system prompt file and clinical reasoning would be exposed.

---

## Appendix C — Known Bugs (keep updated)

### Unresolved
- [ ] ALCAT parser missing 7 severe reactions from Dr Mario's panel
- [ ] Booking insert failure (Supabase)
- [ ] meetmario.ai custom domain (Cloudflare → Inleed nameserver pending)
- [ ] Resend domain verification for medibalans.com
- [ ] Onboarding skipped symptom questions — new steps replaced existing symptom step instead of being added after it.

### Resolved
- [x] Chat crashes on second message — root cause: showContactButton spreading into Anthropic message objects via `...m`, causing 400 validation errors. Fixed: apiMsgs returns explicit `{ role, content }` only. System prompt is ~13K tokens (well within 200K limit); 500-char truncation kept as guard.
- [x] Blood work PDFs (Unilabs) parsed as ALCAT — parser now routes report_type=LAB to bloodWork[] namespace. ALCAT arrays untouched. Fixes testosterone/ferritin/DHEAS appearing as reactive foods.
- [x] ALCAT SEVERE: 0 for Christina — root cause was blood work upload overwriting alcat_results with empty arrays. Fixed by bug above.
- [x] Deprecated anthropic-beta headers — removed
- [x] Chat history unbounded — capped at 12
- [x] FAB position:fixed desktop overflow — changed to absolute
- [x] CMA/VCF upload showing ALCAT food names — corrected data fields
- [x] 29/60 SNPs had wrong ClinVar classifications — verified via MyVariant.info
- [x] IP protection missing from system prompt — added to Part VIII
- [x] clinicalSNPs.js in client bundle — moved to app/api/lib/, VCF matching via /api/vcf
- [x] BES scoring formula in client bundle — moved to /api/score
- [x] ALCAT/CMA parsing prompts in client bundle — moved to /api/parse-lab
- [x] All 111 SNPs missing live verification — MyVariant.info verified, clinvar_verified/sift_verified/polyphen_verified/cadd fields added to all
- [x] Chat renders raw markdown — client-side stripMarkdown() + system prompt hardened
- [x] message.content array crash — getMessageText() handles both string and block array
- [x] "Ask Mario about my genetics" button — was using old tab name; now setTab('mario') correct
- [x] Annotated variants not reaching Mario — fixed by null-array crash fix in buildMarioSystemPrompt
- [x] Chat connection error on every message — buildMarioSystemPrompt crashed on null arrays from Supabase
- [x] Camera FAB overlapping chat send button — FAB hidden on mario tab
- [x] VCF 413 Payload Too Large — client strips INFO/FORMAT cols before POST (7MB → 0.9MB)
