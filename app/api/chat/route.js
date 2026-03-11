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

    let msg
    if (betas && betas.length > 0) {
      // Use beta endpoint for PDF support
      msg = await client.beta.messages.create({
        ...params,
        betas,
      })
    } else {
      msg = await client.messages.create(params)
    }

    return Response.json({ content: msg.content })
  } catch (err) {
    console.error('[/api/chat]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
