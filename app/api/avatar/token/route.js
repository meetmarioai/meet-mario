// app/api/avatar/token/route.js
// Returns a short-lived LiveAvatar session token.
// Client uses this to initialise @heygen/streaming-avatar.

export async function POST() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    const data = await res.json();

    if (!res.ok || !data?.data?.session_token) {
      console.error('[avatar/token] LiveAvatar error:', data);
      return Response.json({ error: data?.message || 'Failed to get token' }, { status: 500 });
    }

    return Response.json({ token: data.data.session_token });
  } catch (err) {
    console.error('[avatar/token]', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
