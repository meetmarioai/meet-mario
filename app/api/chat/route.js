// app/api/chat/route.js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { system, messages, max_tokens = 1200, betas } = await req.json()

    const params = {
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      system: system || 'You are Meet Mario, a clinical AI assistant for MediBalans AB.',
      messages,
    }

    // Pass content as-is — supports image, document (PDF), and text blocks
    // betas header enables PDF document support
    const requestOptions = betas ? { headers: { 'anthropic-beta': betas.join(',') } } : {}

    const msg = await client.messages.create(params, requestOptions)

    // Return full content array (not just text) so client can inspect all blocks
    return Response.json({ content: msg.content })
  } catch (err) {
    console.error('[/api/chat]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
