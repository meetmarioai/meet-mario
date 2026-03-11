// app/api/chat/route.js
// Uses raw fetch to Anthropic API — bypasses SDK version issues with document/PDF blocks

// Increase Vercel function timeout (default 10s is too short for PDF parsing)
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { system, messages, max_tokens = 1200 } = await req.json()

    // Log incoming content block types for debugging
    const contentTypes = (messages || []).flatMap(m =>
      Array.isArray(m.content) ? m.content.map(b => b.type) : [typeof m.content]
    )
    console.log('[/api/chat] Content block types:', contentTypes.join(', '))
    console.log('[/api/chat] max_tokens:', max_tokens, '| messages:', messages?.length)

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      system: Array.isArray(system)
        ? system
        : [{ type: 'text', text: system || 'You are Meet Mario, a clinical AI assistant for MediBalans AB.', cache_control: { type: 'ephemeral' } }],
      messages,
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25,prompt-caching-2024-07-31',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    console.log('[/api/chat] Anthropic status:', response.status)
    console.log('[/api/chat] Anthropic response:', JSON.stringify({
      id: data.id,
      type: data.type,
      model: data.model,
      stop_reason: data.stop_reason,
      usage: data.usage,
      error: data.error,
      content_types: (data.content || []).map(b => b.type),
      content_preview: (data.content || []).map(b => b.type === 'text' ? b.text?.slice(0, 200) : b.type),
    }))

    if (!response.ok) {
      console.error('[/api/chat] Anthropic error:', JSON.stringify(data))
      return Response.json({ error: data?.error?.message || 'API error', content: [] }, { status: 500 })
    }

    return Response.json({ content: data.content || [] })
  } catch (err) {
    console.error('[/api/chat] Uncaught error:', err.message, err.stack)
    return Response.json({ error: err.message, content: [] }, { status: 500 })
  }
}
