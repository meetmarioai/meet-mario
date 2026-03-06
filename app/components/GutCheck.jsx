import { useState, useRef, useEffect, useCallback } from "react";

// ─── Balans Design Tokens ───────────────────────────────────────────────────
const B = {
  linen:      "#FAF8F4",
  linenDark:  "#F2EFE9",
  linendDeep: "#E8E3DA",
  gold:       "#9A7240",
  goldLight:  "#B8935A",
  rose:       "#C4887A",
  roseLight:  "#D4A090",
  ink:        "#2C2419",
  inkMid:     "#5C4E3A",
  inkLight:   "#8C7D6A",
  green:      "#5A7A5A",
  amber:      "#C4963A",
  red:        "#A04040",
  border:     "rgba(154,114,64,0.15)",
  borderMid:  "rgba(154,114,64,0.25)",
};

// ─── Bristol Stool Scale Reference ──────────────────────────────────────────
const BRISTOL = [
  { type: 1, label: "Separate hard lumps",     emoji: "🪨", color: B.red,   status: "Severe constipation",  detail: "Intestinal transit severely impaired. Increase water, magnesium, movement." },
  { type: 2, label: "Lumpy sausage shape",      emoji: "🔴", color: B.red,   status: "Mild constipation",    detail: "Transit slow. Assess fibre intake, hydration, thyroid status." },
  { type: 3, label: "Sausage with cracks",      emoji: "🟡", color: B.amber, status: "Near optimal",         detail: "Slightly dry. Minor improvement in hydration may help." },
  { type: 4, label: "Smooth, soft sausage",     emoji: "✅", color: B.green, status: "Optimal",              detail: "Ideal transit time and mucosal hydration. Microbiome likely balanced." },
  { type: 5, label: "Soft blobs, clear edges",  emoji: "🟡", color: B.amber, status: "Lacking fibre",        detail: "Transit slightly fast. Assess soluble fibre and ALCAT reactive foods." },
  { type: 6, label: "Fluffy, mushy pieces",     emoji: "🔴", color: B.red,   status: "Mild inflammation",    detail: "Mild gut inflammation or dysbiosis. Cross-reference ALCAT reactives." },
  { type: 7, label: "Entirely liquid",          emoji: "🚨", color: B.red,   status: "Acute diarrhoea",      detail: "Acute mucosal disruption. Assess infection, food exposure, stress." },
];

const GLYPH_CELL = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={B.gold} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" fill={B.gold} opacity="0.3"/>
    <circle cx="12" cy="12" r="1.5" fill={B.gold}/>
  </svg>
);

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .gc-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .gc-root {
    font-family: 'Lato', sans-serif;
    background: ${B.linen};
    color: ${B.ink};
    min-height: 100vh;
    padding: 24px 20px 48px;
  }

  .gc-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .gc-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 600;
    color: ${B.ink};
    letter-spacing: -0.3px;
  }

  .gc-subtitle {
    font-size: 13px;
    color: ${B.inkLight};
    font-weight: 300;
    letter-spacing: 0.5px;
    margin-bottom: 28px;
    margin-left: 30px;
  }

  .gc-card {
    background: white;
    border: 1px solid ${B.border};
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(44,36,25,0.04);
  }

  .gc-section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${B.gold};
    margin-bottom: 14px;
  }

  /* Camera zone */
  .gc-camera-zone {
    border: 1.5px dashed ${B.borderMid};
    border-radius: 12px;
    background: ${B.linenDark};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .gc-camera-zone:hover {
    border-color: ${B.gold};
    background: ${B.linendDeep};
  }

  .gc-camera-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${B.gold}18;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    font-size: 22px;
  }

  .gc-camera-text {
    font-size: 13px;
    color: ${B.inkMid};
    font-weight: 400;
  }

  .gc-camera-sub {
    font-size: 11px;
    color: ${B.inkLight};
    margin-top: 4px;
    font-weight: 300;
  }

  .gc-preview {
    width: 100%;
    max-height: 280px;
    object-fit: cover;
    border-radius: 10px;
  }

  .gc-preview-overlay {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(44,36,25,0.6);
    color: white;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    cursor: pointer;
    backdrop-filter: blur(4px);
  }

  /* Analyse button */
  .gc-btn-primary {
    width: 100%;
    padding: 14px;
    background: ${B.gold};
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 14px;
    text-transform: uppercase;
  }

  .gc-btn-primary:hover { background: ${B.goldLight}; transform: translateY(-1px); }
  .gc-btn-primary:disabled { background: ${B.inkLight}; cursor: not-allowed; transform: none; opacity: 0.6; }

  .gc-btn-secondary {
    width: 100%;
    padding: 11px;
    background: transparent;
    color: ${B.inkMid};
    border: 1px solid ${B.border};
    border-radius: 10px;
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.2s ease;
  }
  .gc-btn-secondary:hover { border-color: ${B.gold}; color: ${B.gold}; }

  /* Loading */
  .gc-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
    gap: 14px;
  }

  .gc-spinner {
    width: 36px;
    height: 36px;
    border: 2px solid ${B.border};
    border-top: 2px solid ${B.gold};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .gc-loading-text {
    font-size: 13px;
    color: ${B.inkLight};
    font-style: italic;
  }

  /* Result */
  .gc-result-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    border-radius: 12px;
    margin-bottom: 16px;
    background: ${B.linenDark};
  }

  .gc-bristol-badge {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 20px;
    font-weight: 500;
    color: white;
    flex-shrink: 0;
  }

  .gc-result-type {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 600;
    color: ${B.ink};
    line-height: 1.2;
  }

  .gc-result-status {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 3px;
  }

  .gc-insight-block {
    padding: 16px;
    border-left: 3px solid ${B.gold};
    background: ${B.linenDark};
    border-radius: 0 8px 8px 0;
    margin-bottom: 14px;
  }

  .gc-insight-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${B.gold};
    margin-bottom: 6px;
  }

  .gc-insight-text {
    font-size: 13px;
    color: ${B.inkMid};
    line-height: 1.65;
    font-weight: 300;
  }

  .gc-insight-text strong {
    color: ${B.ink};
    font-weight: 700;
  }

  /* Trend strip */
  .gc-trend-strip {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    padding: 12px 0;
  }

  .gc-trend-dot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 1;
  }

  .gc-trend-bar {
    width: 100%;
    border-radius: 4px 4px 0 0;
    transition: height 0.4s ease;
    min-height: 4px;
  }

  .gc-trend-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: ${B.inkLight};
  }

  .gc-trend-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: ${B.ink};
  }

  /* Bristol guide */
  .gc-bristol-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid ${B.border};
  }
  .gc-bristol-row:last-child { border-bottom: none; }

  .gc-bristol-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: ${B.inkLight};
    width: 16px;
    flex-shrink: 0;
  }

  .gc-bristol-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .gc-bristol-name {
    font-size: 12px;
    color: ${B.inkMid};
    flex: 1;
  }

  .gc-bristol-status-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
    color: white;
  }

  /* Privacy notice */
  .gc-privacy {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: ${B.linenDark};
    border-radius: 8px;
    margin-top: 8px;
  }
  .gc-privacy-text {
    font-size: 11px;
    color: ${B.inkLight};
    font-weight: 300;
    line-height: 1.5;
  }

  .gc-tabs {
    display: flex;
    gap: 4px;
    background: ${B.linenDark};
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 20px;
  }

  .gc-tab {
    flex: 1;
    padding: 8px;
    border: none;
    background: transparent;
    border-radius: 7px;
    font-family: 'Lato', sans-serif;
    font-size: 12px;
    color: ${B.inkLight};
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 400;
  }
  .gc-tab.active {
    background: white;
    color: ${B.ink};
    font-weight: 700;
    box-shadow: 0 1px 4px rgba(44,36,25,0.08);
  }

  .gc-note-input {
    width: 100%;
    border: 1px solid ${B.border};
    border-radius: 8px;
    padding: 10px 12px;
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    color: ${B.ink};
    background: ${B.linenDark};
    resize: none;
    outline: none;
    margin-top: 8px;
  }
  .gc-note-input:focus { border-color: ${B.gold}; background: white; }

  .gc-fade-in {
    animation: fadeIn 0.4s ease forwards;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GutCheck({ patientName = "Patient", onLogSaved }) {
  const [tab, setTab] = useState("check"); // check | history | guide
  const [image, setImage] = useState(null);       // base64 data URL
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gutcheck_history") || "[]"); }
    catch { return []; }
  });
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const saveToHistory = useCallback((entry) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 30); // keep last 30
      try { localStorage.setItem("gutcheck_history", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
    setResult(null);
    setNote("");
  };

  const analyseImage = async () => {
    if (!imageFile || !image) return;
    setLoading(true);
    setResult(null);

    try {
      // Convert to base64 for API
      const base64Data = image.split(",")[1];
      const mediaType = imageFile.type || "image/jpeg";

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a clinical gut health AI assistant integrated into the MediBalans Meet Mario precision medicine platform. 
You analyse stool photographs to assess gut health using the Bristol Stool Scale.

CRITICAL RULES:
- If the image does NOT appear to be a stool photograph, respond with JSON: {"error": "not_stool", "message": "No stool detected in image"}
- Be clinical, precise, non-judgmental
- Always respond ONLY with valid JSON — no preamble, no markdown, no backticks

JSON schema to return:
{
  "bristol_type": <1-7 integer>,
  "confidence": <"high"|"medium"|"low">,
  "color_note": <brief clinical color observation, e.g. "medium brown" or "pale yellow">,
  "consistency_note": <brief consistency observation>,
  "clinical_insight": <2-3 sentence functional medicine interpretation, referencing ALCAT/rotation protocol if relevant>,
  "recommendation": <1 concrete actionable recommendation for today>,
  "alcat_flag": <true if pattern suggests food reactivity, false otherwise>
}`,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Data }
              },
              {
                type: "text",
                text: "Please analyse this stool photograph and return your clinical assessment in the specified JSON format."
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";

      let parsed;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = { error: "parse_error", message: "Could not interpret AI response." };
      }

      if (parsed.error) {
        setResult({ error: parsed.message || "Analysis failed." });
      } else {
        const bristolRef = BRISTOL.find(b => b.type === parsed.bristol_type) || BRISTOL[3];
        const entry = {
          date: new Date().toISOString(),
          bristol_type: parsed.bristol_type,
          color: bristolRef.color,
          status: bristolRef.status,
          confidence: parsed.confidence,
          color_note: parsed.color_note,
          consistency_note: parsed.consistency_note,
          clinical_insight: parsed.clinical_insight,
          recommendation: parsed.recommendation,
          alcat_flag: parsed.alcat_flag,
          note: note,
        };
        setResult(entry);
        saveToHistory(entry);
        if (onLogSaved) onLogSaved(entry);
      }

    } catch (err) {
      setResult({ error: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setNote("");
  };

  const bristolRef = result && !result.error
    ? BRISTOL.find(b => b.type === result.bristol_type) || BRISTOL[3]
    : null;

  // Trend: last 7 entries
  const trend = history.slice(0, 7).reverse();

  return (
    <>
      <style>{styles}</style>
      <div className="gc-root">

        {/* Header */}
        <div className="gc-header">
          {GLYPH_CELL}
          <h1 className="gc-title">GutCheck</h1>
        </div>
        <p className="gc-subtitle">Daily gut biomarker · Bristol Stool Analysis</p>

        {/* Tabs */}
        <div className="gc-tabs">
          {["check", "history", "guide"].map(t => (
            <button key={t} className={`gc-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "check" ? "📸 Daily Check" : t === "history" ? "📈 Trend" : "📋 Reference"}
            </button>
          ))}
        </div>

        {/* ── CHECK TAB ── */}
        {tab === "check" && (
          <div className="gc-fade-in">
            <div className="gc-card">
              <div className="gc-section-label">Photo capture</div>

              {!image ? (
                <>
                  <div className="gc-camera-zone" onClick={() => cameraRef.current?.click()}>
                    <div className="gc-camera-icon">📷</div>
                    <div className="gc-camera-text">Take a photo</div>
                    <div className="gc-camera-sub">Opens camera on mobile · Tap to capture</div>
                  </div>
                  {/* Hidden camera input */}
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                  {/* Upload fallback */}
                  <button className="gc-btn-secondary" onClick={() => fileRef.current?.click()}>
                    Upload from library
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                </>
              ) : (
                <div className="gc-camera-zone" style={{ cursor: "default" }}>
                  <img src={image} alt="Stool sample" className="gc-preview" />
                  <div className="gc-preview-overlay" onClick={reset}>↩ Retake</div>
                </div>
              )}

              <div className="gc-privacy">
                <span>🔒</span>
                <span className="gc-privacy-text">
                  Images are sent directly to the AI for analysis and never stored on our servers.
                  Analysis is processed in real time and immediately discarded.
                </span>
              </div>
            </div>

            {/* Note */}
            {image && !result && (
              <div className="gc-card gc-fade-in">
                <div className="gc-section-label">Optional note</div>
                <textarea
                  className="gc-note-input"
                  rows={2}
                  placeholder="Any symptoms today? Bloating, pain, urgency..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <button
                  className="gc-btn-primary"
                  onClick={analyseImage}
                  disabled={loading || !image}
                >
                  {loading ? "Analysing…" : "Analyse with AI"}
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="gc-card gc-fade-in">
                <div className="gc-loading">
                  <div className="gc-spinner" />
                  <div className="gc-loading-text">Clinical AI analysis in progress…</div>
                </div>
              </div>
            )}

            {/* Error */}
            {result?.error && (
              <div className="gc-card gc-fade-in">
                <div className="gc-insight-block" style={{ borderColor: B.red }}>
                  <div className="gc-insight-label" style={{ color: B.red }}>Analysis notice</div>
                  <div className="gc-insight-text">{result.error}</div>
                </div>
                <button className="gc-btn-secondary" onClick={reset}>Try again</button>
              </div>
            )}

            {/* Result */}
            {result && !result.error && bristolRef && (
              <div className="gc-card gc-fade-in">
                <div className="gc-section-label">Analysis result</div>

                {/* Bristol badge */}
                <div className="gc-result-header">
                  <div className="gc-bristol-badge" style={{ background: bristolRef.color }}>
                    {result.bristol_type}
                  </div>
                  <div>
                    <div className="gc-result-type">Bristol Type {result.bristol_type}</div>
                    <div className="gc-result-type" style={{ fontSize: 13, fontFamily: "Lato", fontWeight: 300 }}>
                      {bristolRef.label}
                    </div>
                    <div className="gc-result-status" style={{ color: bristolRef.color }}>
                      {result.status}
                    </div>
                  </div>
                </div>

                {/* Color & consistency */}
                {(result.color_note || result.consistency_note) && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    {result.color_note && (
                      <div style={{ flex: 1, padding: "10px 12px", background: B.linenDark, borderRadius: 8 }}>
                        <div className="gc-insight-label">Colour</div>
                        <div className="gc-insight-text">{result.color_note}</div>
                      </div>
                    )}
                    {result.consistency_note && (
                      <div style={{ flex: 1, padding: "10px 12px", background: B.linenDark, borderRadius: 8 }}>
                        <div className="gc-insight-label">Texture</div>
                        <div className="gc-insight-text">{result.consistency_note}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Clinical insight */}
                <div className="gc-insight-block">
                  <div className="gc-insight-label">Clinical interpretation</div>
                  <div className="gc-insight-text">{result.clinical_insight}</div>
                </div>

                {/* Recommendation */}
                <div className="gc-insight-block" style={{ borderColor: B.rose }}>
                  <div className="gc-insight-label" style={{ color: B.rose }}>Today's action</div>
                  <div className="gc-insight-text"><strong>{result.recommendation}</strong></div>
                </div>

                {/* ALCAT flag */}
                {result.alcat_flag && (
                  <div style={{
                    padding: "10px 14px",
                    background: "#FFF3E0",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                  }}>
                    <span>⚠️</span>
                    <span style={{ fontSize: 12, color: B.amber, fontWeight: 700 }}>
                      Pattern suggests possible ALCAT food reactivity. Cross-reference today's rotation foods.
                    </span>
                  </div>
                )}

                {result.confidence && (
                  <div style={{ textAlign: "right", marginTop: 4 }}>
                    <span style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: 10,
                      color: B.inkLight,
                      letterSpacing: 1,
                    }}>
                      AI confidence: {result.confidence.toUpperCase()}
                    </span>
                  </div>
                )}

                <button className="gc-btn-secondary" onClick={reset}>New check</button>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div className="gc-fade-in">
            {history.length === 0 ? (
              <div className="gc-card" style={{ textAlign: "center", padding: "40px 24px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, color: B.inkMid }}>
                  No data yet
                </div>
                <div style={{ fontSize: 13, color: B.inkLight, marginTop: 6 }}>
                  Complete your first GutCheck to start your trend
                </div>
              </div>
            ) : (
              <>
                {/* Trend chart */}
                <div className="gc-card">
                  <div className="gc-section-label">7-day Bristol trend</div>
                  <div className="gc-trend-strip">
                    {trend.map((entry, i) => {
                      const ref = BRISTOL.find(b => b.type === entry.bristol_type) || BRISTOL[3];
                      const barH = Math.max(16, (entry.bristol_type / 7) * 80);
                      const isOptimal = entry.bristol_type === 4;
                      return (
                        <div key={i} className="gc-trend-dot">
                          <div className="gc-trend-val">{entry.bristol_type}</div>
                          <div
                            className="gc-trend-bar"
                            style={{
                              height: barH,
                              background: isOptimal ? B.green : entry.bristol_type <= 2 || entry.bristol_type >= 6 ? B.red : B.amber,
                            }}
                          />
                          <div className="gc-trend-label">
                            {new Date(entry.date).toLocaleDateString("en-SE", { weekday: "short" }).slice(0, 2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Log entries */}
                <div className="gc-card">
                  <div className="gc-section-label">Log entries</div>
                  {history.slice(0, 10).map((entry, i) => {
                    const ref = BRISTOL.find(b => b.type === entry.bristol_type) || BRISTOL[3];
                    return (
                      <div key={i} className="gc-bristol-row">
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: ref.color, display: "flex", alignItems: "center",
                          justifyContent: "center", color: "white",
                          fontFamily: "IBM Plex Mono, monospace", fontSize: 12, fontWeight: 500,
                          flexShrink: 0,
                        }}>
                          {entry.bristol_type}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: B.ink, fontWeight: 700 }}>{ref.status}</div>
                          <div style={{ fontSize: 11, color: B.inkLight }}>
                            {new Date(entry.date).toLocaleDateString("en-SE", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })}
                          </div>
                          {entry.note && (
                            <div style={{ fontSize: 11, color: B.inkMid, fontStyle: "italic", marginTop: 2 }}>
                              "{entry.note}"
                            </div>
                          )}
                        </div>
                        {entry.alcat_flag && <span title="ALCAT flag">⚠️</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── GUIDE TAB ── */}
        {tab === "guide" && (
          <div className="gc-fade-in">
            <div className="gc-card">
              <div className="gc-section-label">Bristol Stool Scale</div>
              {BRISTOL.map(b => (
                <div key={b.type} className="gc-bristol-row">
                  <div className="gc-bristol-num">T{b.type}</div>
                  <div className="gc-bristol-indicator" style={{ background: b.color }} />
                  <div style={{ flex: 1 }}>
                    <div className="gc-bristol-name">{b.label}</div>
                    <div style={{ fontSize: 11, color: B.inkLight, marginTop: 2, fontWeight: 300 }}>{b.detail}</div>
                  </div>
                  <div className="gc-bristol-status-tag" style={{ background: b.color }}>
                    {b.type === 4 ? "✓" : b.type === 3 ? "~" : b.type === 5 ? "~" : "!"}
                  </div>
                </div>
              ))}
            </div>

            <div className="gc-card">
              <div className="gc-section-label">Clinical context</div>
              <div className="gc-insight-block">
                <div className="gc-insight-label">Transit time</div>
                <div className="gc-insight-text">
                  Bristol Type reflects intestinal transit time. Type 1–2 indicates slow transit (>72h).
                  Type 4 reflects optimal 24–48h transit. Type 6–7 indicates rapid transit (&lt;10h),
                  associated with bile acid malabsorption or mucosal inflammation.
                </div>
              </div>
              <div className="gc-insight-block" style={{ borderColor: B.rose }}>
                <div className="gc-insight-label" style={{ color: B.rose }}>ALCAT correlation</div>
                <div className="gc-insight-text">
                  Consistent Type 5–6 patterns on specific ALCAT rotation days may indicate
                  residual reactivity to foods in that day's rotation. Log daily to identify patterns.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
