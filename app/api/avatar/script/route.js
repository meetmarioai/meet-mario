// ─── /app/api/avatar/script/route.js ─────────────────────────────────────────
// Generates a natural spoken script for the avatar to deliver.
// Takes patient data, runs it through Claude with a "spoken voice" system prompt,
// returns clean paragraphs the avatar can speak aloud.
//
// ENV REQUIRED:
//   ANTHROPIC_API_KEY
//
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── System prompt for spoken delivery ────────────────────────────────────────
// This is NOT the chat system prompt. This is optimised for natural speech —
// no markdown, no bullets, no headers. Just Mario talking to his patient.
const SPOKEN_SYSTEM = `You are Dr Mario Anthis — founder of MediBalans AB, Stockholm. You are recording a personalised video message for one of your patients, explaining their test results.

VOICE RULES:
— Speak naturally, as if sitting across from the patient in your consultation room.
— Use short sentences. Pause-friendly phrasing. Conversational rhythm.
— NEVER use markdown, bullet points, asterisks, headers, or any written formatting.
— NEVER say "bullet point" or "number one" — just flow naturally.
— Do NOT greet with "Hi" or "Hello" — begin with the patient's name directly.
— Keep the total script between 60–90 seconds when read aloud (approximately 180–250 words).
— You are warm, authoritative, and direct. European sensibility — understated confidence.
— You explain mechanisms simply but never dumb them down.
— End with one clear next step for the patient.

STRUCTURE (invisible to the patient — just guide your flow):
1. Address the patient by name, acknowledge they've done the testing.
2. Summarise the key finding — what stands out most in their results.
3. Explain WHY this matters for their specific symptoms (connect the dots).
4. Give one actionable takeaway for the next week.
5. Close with encouragement and a clear next step (book a follow-up, start the protocol, etc).

CRITICAL: Output ONLY the spoken script. No stage directions. No "[pause]" markers. No quotation marks around the script. Just the words Mario would say, in clean paragraphs.`

export async function POST(request) {
  try {
    const { patient, mode } = await request.json()

    if (!patient) {
      return NextResponse.json({ error: 'Patient data required' }, { status: 400 })
    }

    // ── Build patient context for the script ───────────────────────────────
    const severe   = (patient.severe || []).filter(Boolean)
    const moderate = (patient.moderate || []).filter(Boolean)
    const mild     = (patient.mild || []).filter(Boolean)
    const markers  = patient.markers || []
    const genomicSnps = patient.genomicSnps || []
    const micronutrients = patient.micronutrients || {}

    let context = `Patient name: ${patient.name || 'Patient'}
Primary complaints: ${patient.symptoms || 'Not specified'}
Health goals: ${patient.goals || 'Not specified'}
`

    if (severe.length > 0) {
      context += `\nSEVERE reactivity (avoid 6 months): ${severe.join(', ')}`
    }
    if (moderate.length > 0) {
      context += `\nMODERATE reactivity (avoid 3–6 months): ${moderate.join(', ')}`
    }
    if (mild.length > 0) {
      context += `\nMILD reactivity (4-day rotation): ${mild.join(', ')}`
    }
    if (markers.length > 0) {
      context += `\nSpecial markers: ${markers.join(', ')}`
    }
    if (genomicSnps.length > 0) {
      context += `\nGenomic variants: ${genomicSnps.map(s => `${s.gene || s.rsid}: ${s.genotype}`).join(', ')}`
    }
    if (Object.keys(micronutrients).length > 0) {
      context += `\nMicronutrient deficiencies: ${Object.entries(micronutrients).filter(([,v]) => v.level === 'deficient' || v.level === 'borderline').map(([k,v]) => `${k} (${v.level})`).join(', ')}`
    }

    // ── Select the script type ─────────────────────────────────────────────
    let userPrompt
    switch (mode) {
      case 'overview':
        userPrompt = `Generate a spoken results overview for this patient:\n\n${context}\n\nFocus on the most clinically significant findings and what they mean for the patient's daily life.`
        break
      case 'protocol':
        userPrompt = `Generate a spoken protocol introduction for this patient:\n\n${context}\n\nExplain the 21-day detox protocol — what they will eat, why, and what to expect in the first week.`
        break
      case 'genomics':
        userPrompt = `Generate a spoken genomics explanation for this patient:\n\n${context}\n\nFocus on their genetic variants and what these mean for their nutritional needs and methylation capacity.`
        break
      default:
        userPrompt = `Generate a spoken results overview for this patient:\n\n${context}`
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: SPOKEN_SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const script = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')

    return NextResponse.json({ script })
  } catch (err) {
    console.error('[avatar/script] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    )
  }
}
