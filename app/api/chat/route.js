// ─────────────────────────────────────────────────────────────────────────────
// FIX 3 OF 3 — app/api/chat/route.js  (complete replacement)
//
// Changes vs current version:
//   1. bodyParser sizeLimit bumped to 20mb → fixes 413 on large PDFs
//   2. Accepts optional max_tokens override from client (for CMA/ALCAT parsing)
//   3. Returns { text } always — consistent for all callers
//   4. Proper error shape returned as JSON (not thrown)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",   // ← was default 4.5mb — fixes 413 on ALCAT/CMA PDFs
    },
  },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { system, messages, max_tokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const payload = {
      model: "claude-sonnet-4-6",          // always use latest — never let client dictate
      max_tokens: max_tokens || 1500,       // client can request more for parsing (e.g. 4096)
      messages,
      ...(system ? { system } : {}),
    };

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,   // key stays server-side — never exposed
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error("Anthropic error:", data);
      return NextResponse.json(
        { error: data?.error?.message || "Anthropic API error", status: anthropicRes.status },
        { status: anthropicRes.status }
      );
    }

    // Extract text content — handles multi-block responses
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ text });

  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
