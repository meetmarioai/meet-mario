// app/api/chat/route.js
// Uses raw fetch to Anthropic API — PDF support and prompt caching are GA

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { system, messages, max_tokens = 1200 } = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens,
        system: Array.isArray(system)
          ? system
          : [{ type: 'text', text: system || 'You are Meet Mario, a clinical AI assistant for MediBalans AB.', cache_control: { type: 'ephemeral' } }],
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[/api/chat] Anthropic error:', data?.error?.message)
      return Response.json({ error: data?.error?.message || 'API error', content: [] }, { status: 500 })
    }

    return Response.json({ content: data.content || [] })
  } catch (err) {
    console.error('[/api/chat]', err.message)
    return Response.json({ error: err.message, content: [] }, { status: 500 })
  }
}
