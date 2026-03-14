// app/api/parse-lab/route.js
// ALCAT / CMA / lab parsing — prompt templates never reach the client

export const maxDuration = 60;

const COMPREHENSIVE_PROMPT = `This is a medical lab test result. Identify the report type and extract ALL data.

REPORT TYPE 1 — ALCAT (Cell Science Systems food immune reactivity panel):
This is a Cell Science Systems ALCAT report. The layout has THREE SEPARATE reactivity columns side by side. You MUST extract all three columns independently — do NOT merge them.

COLUMN LAYOUT (left to right):
1. SEVERE column (far left) — foods highlighted in RED or dark red background. These are Class 3-4 reactions. → "severe" array
2. MODERATE column (middle) — foods highlighted in ORANGE or amber background. These are Class 2 reactions. → "moderate" array
3. MILD column (right) — foods highlighted in YELLOW or light yellow background. These are Class 1 reactions. → "mild" array
4. ACCEPTABLE / GREEN — omit entirely

CRITICAL: The SEVERE column is on the FAR LEFT and is often the smallest column with the fewest items. Do NOT skip it. Do NOT merge SEVERE foods into the MODERATE column. Extract every single food name from all three columns as three distinct arrays.

REPORT TYPE 2 — CMA / CNA / Spectrox (Cell Science Systems intracellular micronutrient analysis):
This is a Cell Science Systems CMA or CNA report. It tests ~55 intracellular micronutrients.

TABLE LAYOUT: The report has a table where each ROW is one nutrient. The LEFT column contains the nutrient name. The right columns show quartile ranges (1st, 2nd, 3rd, 4th quartile) with the patient's result marked — often as a filled bar, dot, or highlighted cell in one of the quartile columns. Lower quartiles (1st, 2nd) = below optimal. Upper quartiles (3rd, 4th) = adequate.

The Spectrox score (Total Antioxidant Function) is a single numeric score, often shown prominently at the top or bottom.

READ EVERY ROW of the nutrient table. Do NOT skip any nutrient. If a nutrient is in the 1st or 2nd quartile it is deficient/low. If in 3rd or 4th quartile it is adequate.

For the summary arrays:
- 1st quartile / DEFICIENT / VERY LOW → "severe" AND "cma_deficiencies"
- 2nd quartile / LOW / BORDERLINE → "moderate" AND "cma_deficiencies"
- 3rd or 4th quartile / ADEQUATE / NORMAL → "mild" AND "cma_adequate"

Also extract:
- "cma_deficiencies": ALL below-optimal nutrient names (1st + 2nd quartile)
- "cma_adequate": ALL optimal nutrient names (3rd + 4th quartile)
- "cma_nutrients": EVERY nutrient as [{"name":"vitamin d","value":32,"unit":"ng/mL","range_low":30,"range_high":100,"status":"adequate|low|deficient"}]
- "redox_score": the Spectrox / REDOX / Total Antioxidant Function score (numeric only)
- "cma_antioxidants": antioxidant-specific nutrients: [{"name":"glutathione","value":...,"status":"adequate|low|deficient"}]
- "cma_categories": {"vitamins":[],"minerals":[],"amino_acids":[],"antioxidants":[],"fatty_acids":[],"metabolites":[]}

REPORT TYPE 3 — Standard blood work / serum lab panel (e.g. Unilabs, Synlab, hospital labs):
This is a standard serum/blood lab report — NOT an ALCAT food reactivity panel. It contains serum markers such as testosterone, ferritin, DHEAS, TSH, cortisol, haemoglobin, glucose, etc.

CRITICAL: Do NOT put these into the severe/moderate/mild arrays. Those arrays are reserved for ALCAT food names only. Instead extract ALL markers into "bloodWork" as structured objects.

For each marker extract:
- "name": marker name in lowercase English (translate Swedish)
- "value": numeric result (number only, no units)
- "unit": unit string (e.g. "nmol/L", "µg/dL", "ng/mL")
- "status": "low" | "normal" | "high" — compare value against reference range
- "ref_low": lower bound of reference range (number)
- "ref_high": upper bound of reference range (number)

Leave severe/moderate/mild as empty arrays for this report type.

Return ONLY this JSON (no markdown):
{"report_type":"ALCAT|CMA|LAB","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[],"cma_nutrients":[],"redox_score":null,"cma_antioxidants":[],"cma_categories":{},"bloodWork":[]}
Lowercase English names. Translate Swedish to English. Include EVERY nutrient found — do not skip any.`;

const TEXT_PROMPT = `This is a medical lab document. Extract reactive foods and classify by severity.

Return ONLY this JSON (no markdown):
{"report_type":"ALCAT|CMA|LAB","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[],"redox_score":null,"bloodWork":[]}

For LAB type: put ALL markers in "bloodWork" as [{"name":"...","value":0,"unit":"...","status":"low|normal|high","ref_low":0,"ref_high":0}]. Leave severe/moderate/mild empty.
Lowercase English food/nutrient names. Translate Swedish to English.`;

export async function POST(req) {
  try {
    const { fileBase64, mediaType, isPDF, textContent } = await req.json();

    let messages;
    if (textContent) {
      messages = [{ role: 'user', content: `${TEXT_PROMPT}\n\nDocument contents:\n${textContent.slice(0, 50000)}` }];
    } else {
      if (!fileBase64 || !mediaType) return Response.json({ error: 'fileBase64 and mediaType required' }, { status: 400 });
      const fileBlock = isPDF
        ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } }
        : { type: 'image', source: { type: 'base64', media_type: mediaType, data: fileBase64 } };
      messages = [{ role: 'user', content: [fileBlock, { type: 'text', text: COMPREHENSIVE_PROMPT }] }];
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 4000,
        system: 'You extract structured data from medical lab results. Return only valid JSON, nothing else — no preamble, no explanation.',
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[/api/parse-lab] Anthropic error:', err?.error?.message);
      return Response.json({ error: err?.error?.message || 'API error' }, { status: 500 });
    }

    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');

    let json = {};
    try {
      json = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      const m = text.match(/\{[\s\S]*?"severe"[\s\S]*?\}/);
      if (m) try { json = JSON.parse(m[0]); } catch {}
      if (!json.severe) {
        const m2 = text.match(/\{[\s\S]*\}/);
        if (m2) try { json = JSON.parse(m2[0]); } catch {}
      }
    }

    console.log(`[/api/parse-lab] report_type=${json.report_type} severe=${(json.severe||[]).length} moderate=${(json.moderate||[]).length} mild=${(json.mild||[]).length} cma_def=${(json.cma_deficiencies||[]).length} bloodWork=${(json.bloodWork||[]).length}`);
    return Response.json(json);
  } catch (err) {
    console.error('[/api/parse-lab]', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
