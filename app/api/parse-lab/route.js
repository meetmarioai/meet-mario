// app/api/parse-lab/route.js
// ALCAT / CMA / lab parsing — prompt templates never reach the client

export const maxDuration = 60;

// ── Phase 1: classify only ─────────────────────────────────────────────────
const CLASSIFY_PROMPT = `Look at this medical document and return ONLY this JSON — nothing else:
{"report_type":"ALCAT|CMA|LAB|UNKNOWN"}

ALCAT: Cell Science Systems food reactivity panel. Has three coloured columns: RED (severe), ORANGE (moderate), YELLOW (mild). Contains food names, NOT lab values.
CMA: Cell Science Systems intracellular micronutrient analysis. Lists ~55 nutrients with quartile bars.
LAB: Standard serum/blood lab panel (e.g. Unilabs, Synlab). Has test names, numeric values, reference ranges, units.
UNKNOWN: anything else.

CRITICAL: If you see "Cell Science Systems", "ALCAT", "Food Sensitivities", or coloured food columns — return ALCAT even if lab terms appear in headers.`;

// ── Phase 2a: ALCAT extraction ─────────────────────────────────────────────
const ALCAT_PROMPT = `Extract ALL reactive foods from this ALCAT report. Three separate columns, extract independently.

SEVERE (far left, RED background) → "severe" array
MODERATE (middle, ORANGE background) → "moderate" array
MILD (right, YELLOW background) → "mild" array
ACCEPTABLE/GREEN → omit entirely

CRITICAL: SEVERE column is smallest, far left. Do NOT skip it or merge into MODERATE.

Return ONLY this JSON (no markdown):
{"report_type":"ALCAT","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[],"cma_nutrients":[],"redox_score":null,"cma_antioxidants":[],"cma_categories":{},"bloodWork":[]}`;

// ── Phase 2b: CMA extraction ───────────────────────────────────────────────
const CMA_PROMPT = `Extract ALL nutrients from this CMA/CNA/Spectrox report.

Each row = one nutrient. Quartile position determines status:
- 1st quartile / DEFICIENT → "severe" AND "cma_deficiencies"
- 2nd quartile / LOW → "moderate" AND "cma_deficiencies"
- 3rd or 4th quartile / ADEQUATE → "mild" AND "cma_adequate"

Also extract:
- "cma_deficiencies": all below-optimal nutrient names
- "cma_adequate": all optimal nutrient names
- "cma_nutrients": every nutrient as [{"name":"...","value":0,"unit":"...","range_low":0,"range_high":0,"status":"adequate|low|deficient"}]
- "redox_score": the Spectrox/REDOX/Total Antioxidant Function score (number only, null if absent)
- "cma_antioxidants": [{"name":"...","value":0,"status":"adequate|low|deficient"}]
- "cma_categories": {"vitamins":[],"minerals":[],"amino_acids":[],"antioxidants":[],"fatty_acids":[],"metabolites":[]}

Return ONLY this JSON (no markdown):
{"report_type":"CMA","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[],"cma_nutrients":[],"redox_score":null,"cma_antioxidants":[],"cma_categories":{},"bloodWork":[]}`;

// ── Phase 2c: LAB extraction ───────────────────────────────────────────────
const LAB_PROMPT = `Extract ALL lab markers from this blood/serum report. Translate all test names to lowercase English.

Do NOT put anything in severe/moderate/mild — those are for ALCAT food reactivity only.
Put ALL markers in "bloodWork" as structured objects.

For each marker:
- "name": English standard name in lowercase
- "value": numeric result only
- "unit": unit string exactly as shown
- "status": "low" | "normal" | "high" based on reference range
- "ref_low": lower bound as number, or null
- "ref_high": upper bound as number, or null
- "notes": phase info or null

Swedish term mapping:
Analys/Undersökning=test name, Resultat=result, Referensintervall=reference range, Enhet=unit
Slutsvar=final result, Referensintervall saknas=no reference range (ref_low/ref_high null)
Se kommentar=see comment (use broadest phase range, add phase info to notes)

Common translations: S-DHEAS→DHEA-S, S-Testosteron→Total Testosterone, S-Testosteron,bioaktiv→Bioactive Testosterone, P-Homocystein→Homocysteine, S-Östradiol→Estradiol, B-Hemoglobin→Hemoglobin, B-EVF→Hematocrit, B-Erytrocyter→Red Blood Cells, B-MCV→MCV, Erc(B)-MCH→MCH, B-Leukocyter→White Blood Cells, B-Trombocyter→Platelets, S-Follitropin→FSH, S-Progesteron→Progesterone, S-SHBG→SHBG, S-25-hydroxiVitaminD→25-OH Vitamin D, S-Kortisol→Cortisol, P-Kreatinin→Creatinine, Pt-eGFRrel→eGFR, P-Ferritin→Ferritin, P-ALAT→ALT, P-ASAT→AST, P-Bilirubin→Bilirubin, P-Kolesterol→Total Cholesterol, P-HDL-kolesterol→HDL Cholesterol, P-LDL-kol,beräknat→LDL Cholesterol, P-Tyrotropin→TSH, P-T4,fritt→Free T4, P-T3,fritt→Free T3, P-ALP→Alkaline Phosphatase, P(fPt)-Triglycerid→Triglycerides, S-Insulin→Insulin, P-Glukos→Glucose, S-IGF-1→IGF-1, B-HbA1c→HbA1c, P-Natrium→Sodium, P-Kalium→Potassium, P-Kalcium→Calcium, P-Magnesium→Magnesium, P-Fosfat→Phosphate, S-Järn→Iron, S-Transferrin→Transferrin, S-Transferrinmättnad→Transferrin Saturation

Scan every page. Skip repeated patient headers. Include every unique analyte.

Return ONLY this JSON (no markdown):
{"report_type":"LAB","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[],"cma_nutrients":[],"redox_score":null,"cma_antioxidants":[],"cma_categories":{},"bloodWork":[]}`;

const TEXT_PROMPT = `This is a medical lab document. Extract reactive foods and classify by severity.

Return ONLY this JSON (no markdown):
{"report_type":"ALCAT|CMA|LAB","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[],"redox_score":null,"bloodWork":[]}

For LAB type: put ALL markers in "bloodWork" as [{"name":"english name","value":0,"unit":"...","status":"low|normal|high","ref_low":0,"ref_high":0,"notes":null}]. Leave severe/moderate/mild empty.
Swedish→English: S-DHEAS→DHEA-S, S-Testosteron→Total Testosterone, P-Homocystein→Homocysteine, S-Östradiol→Estradiol, B-Hemoglobin→Hemoglobin, B-EVF→Hematocrit, B-Leukocyter→White Blood Cells, B-Trombocyter→Platelets, S-Follitropin→FSH, S-Progesteron→Progesterone, S-SHBG→SHBG, S-25-hydroxiVitaminD→25-OH Vitamin D, S-Kortisol→Cortisol, P-Ferritin→Ferritin, P-ALAT→ALT, P-ASAT→AST, P-Kolesterol→Total Cholesterol, P-HDL-kolesterol→HDL Cholesterol, P-LDL-kol→LDL Cholesterol, P-Tyrotropin→TSH, P-T4 fritt→Free T4, P-T3 fritt→Free T3, P-ALP→Alkaline Phosphatase, P-Triglycerid→Triglycerides.
Analys/Undersökning=test name, Resultat=result, Referensintervall=reference range, Enhet=unit.
Translate all test names to lowercase English. Include every analyte found.`;

async function callClaude(fileBlock, prompt, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'pdfs-2024-09-25',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: 'You extract structured data from medical lab results. Return only valid JSON, nothing else — no preamble, no explanation.',
      messages: [{ role: 'user', content: [fileBlock, { type: 'text', text: prompt }] }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Anthropic ${res.status}`);
  }
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  console.log(`[/api/parse-lab] call stop_reason=${data.stop_reason} tokens=${data.usage?.input_tokens}/${data.usage?.output_tokens}`);
  return text;
}

function parseJSON(text) {
  try { return JSON.parse(text.replace(/```json\s?|```/g, '').trim()); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) try { return JSON.parse(m[0]); } catch {}
  return null;
}

export async function POST(req) {
  try {
    const { fileBase64, mediaType, isPDF, textContent } = await req.json();

    // ── Text content path (Word docs / plain text) ───────────────────────────
    if (textContent) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: 'You extract structured data from medical lab results. Return only valid JSON, nothing else.',
          messages: [{ role: 'user', content: `${TEXT_PROMPT}\n\nDocument contents:\n${textContent.slice(0, 50000)}` }],
        }),
      });
      if (!res.ok) { const e = await res.json().catch(()=>({})); return Response.json({ error: e?.error?.message||'API error' }, { status: 500 }); }
      const d = await res.json();
      const t = (d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
      const json = parseJSON(t) || {};
      return Response.json(json);
    }

    if (!fileBase64 || !mediaType) return Response.json({ error: 'fileBase64 and mediaType required' }, { status: 400 });

    const fileBlock = isPDF
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } }
      : { type: 'image',    source: { type: 'base64', media_type: mediaType,           data: fileBase64 } };

    console.log(`[/api/parse-lab] incoming isPDF=${isPDF} mediaType=${mediaType} base64Len=${fileBase64.length}`);

    // ── Phase 1: classify ─────────────────────────────────────────────────────
    const classifyText = await callClaude(fileBlock, CLASSIFY_PROMPT, 30);
    const classified = parseJSON(classifyText) || {};
    const reportType = classified.report_type || 'UNKNOWN';
    console.log(`[/api/parse-lab] classified as: ${reportType}`);

    // ── Phase 2: type-specific extraction ────────────────────────────────────
    const extractPrompt = reportType === 'ALCAT' ? ALCAT_PROMPT
      : reportType === 'CMA' ? CMA_PROMPT
      : LAB_PROMPT; // LAB / HORMONE / STOOL / UNKNOWN all go through LAB extractor

    const maxTok = reportType === 'CMA' ? 4000 : reportType === 'ALCAT' ? 3000 : 3000;
    const extractText = await callClaude(fileBlock, extractPrompt, maxTok);
    console.log('[/api/parse-lab] raw extract (first 400):', extractText.slice(0, 400));

    const json = parseJSON(extractText) || { report_type: reportType };
    // Ensure report_type is set from classifier if extractor omitted it
    if (!json.report_type) json.report_type = reportType;

    console.log(`[/api/parse-lab] report_type=${json.report_type} severe=${(json.severe||[]).length} moderate=${(json.moderate||[]).length} mild=${(json.mild||[]).length} cma_def=${(json.cma_deficiencies||[]).length} bloodWork=${(json.bloodWork||[]).length}`);
    return Response.json(json);

  } catch (err) {
    console.error('[/api/parse-lab]', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
