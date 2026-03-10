// app/api/chat/route.js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { system, messages, max_tokens = 1200 } = await req.json()

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      system: system || 'You are Meet Mario, a clinical AI assistant for MediBalans AB.',
      messages,
    })

    const content = msg.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')

    return Response.json({ content })
  } catch (err) {
    console.error('[/api/chat]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
