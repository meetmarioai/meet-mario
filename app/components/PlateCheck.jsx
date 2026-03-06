import { useState, useRef, useCallback } from "react";

// ─── Balans Design Tokens ───────────────────────────────────────────────────
const B = {
  linen:      "#FAF8F4",
  linenDark:  "#F2EFE9",
  linenDeep:  "#E8E3DA",
  gold:       "#9A7240",
  goldLight:  "#B8935A",
  rose:       "#C4887A",
  ink:        "#2C2419",
  inkMid:     "#5C4E3A",
  inkLight:   "#8C7D6A",
  green:      "#5A7A5A",
  amber:      "#C4963A",
  red:        "#A04040",
  border:     "rgba(154,114,64,0.15)",
  borderMid:  "rgba(154,114,64,0.25)",
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .pc-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .pc-root {
    font-family: 'Lato', sans-serif;
    background: ${B.linen};
    color: ${B.ink};
    min-height: 100vh;
    padding: 24px 20px 48px;
  }

  .pc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .pc-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 600;
    color: ${B.ink};
    letter-spacing: -0.3px;
  }
  .pc-subtitle {
    font-size: 13px;
    color: ${B.inkLight};
    font-weight: 300;
    letter-spacing: 0.5px;
    margin-bottom: 28px;
    margin-left: 30px;
  }

  .pc-card {
    background: white;
    border: 1px solid ${B.border};
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(44,36,25,0.04);
  }

  .pc-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${B.gold};
    margin-bottom: 14px;
  }

  .pc-camera-zone {
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
  .pc-camera-zone:hover { border-color: ${B.gold}; background: ${B.linenDeep}; }

  .pc-camera-icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: ${B.gold}18;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    font-size: 24px;
  }
  .pc-camera-text { font-size: 13px; color: ${B.inkMid}; font-weight: 400; }
  .pc-camera-sub { font-size: 11px; color: ${B.inkLight}; margin-top: 4px; font-weight: 300; }

  .pc-preview { width: 100%; max-height: 280px; object-fit: cover; border-radius: 10px; }
  .pc-preview-overlay {
    position: absolute;
    bottom: 10px; right: 10px;
    background: rgba(44,36,25,0.6);
    color: white;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    cursor: pointer;
    backdrop-filter: blur(4px);
  }

  .pc-row { display: flex; gap: 10px; margin-bottom: 10px; }

  .pc-select {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid ${B.border};
    border-radius: 8px;
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    color: ${B.ink};
    background: ${B.linenDark};
    outline: none;
    cursor: pointer;
  }
  .pc-select:focus { border-color: ${B.gold}; background: white; }

  .pc-btn-primary {
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
  .pc-btn-primary:hover { background: ${B.goldLight}; transform: translateY(-1px); }
  .pc-btn-primary:disabled { background: ${B.inkLight}; cursor: not-allowed; transform: none; opacity: 0.6; }

  .pc-btn-secondary {
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
  .pc-btn-secondary:hover { border-color: ${B.gold}; color: ${B.gold}; }

  .pc-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
    gap: 14px;
  }
  .pc-spinner {
    width: 36px; height: 36px;
    border: 2px solid ${B.border};
    border-top: 2px solid ${B.gold};
    border-radius: 50%;
    animation: pcspin 0.8s linear infinite;
  }
  @keyframes pcspin { to { transform: rotate(360deg); } }
  .pc-loading-text { font-size: 13px; color: ${B.inkLight}; font-style: italic; }

  /* Score ring */
  .pc-score-ring {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 80px; height: 80px;
    border-radius: 50%;
    border: 3px solid;
    flex-shrink: 0;
  }
  .pc-score-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 22px;
    font-weight: 500;
    line-height: 1;
  }
  .pc-score-den {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: ${B.inkLight};
    margin-top: 2px;
  }

  /* Food chips */
  .pc-chip-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .pc-chip {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pc-insight-block {
    padding: 14px 16px;
    border-left: 3px solid ${B.gold};
    background: ${B.linenDark};
    border-radius: 0 8px 8px 0;
    margin-bottom: 12px;
  }
  .pc-insight-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: ${B.gold};
    margin-bottom: 6px;
  }
  .pc-insight-text {
    font-size: 13px;
    color: ${B.inkMid};
    line-height: 1.65;
    font-weight: 300;
  }
  .pc-insight-text strong { color: ${B.ink}; font-weight: 700; }

  .pc-macro-row {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }
  .pc-macro-box {
    flex: 1;
    padding: 12px 8px;
    background: ${B.linenDark};
    border-radius: 10px;
    text-align: center;
  }
  .pc-macro-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 18px;
    font-weight: 500;
    color: ${B.ink};
    line-height: 1;
  }
  .pc-macro-unit {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: ${B.inkLight};
    margin-top: 2px;
  }
  .pc-macro-name {
    font-size: 10px;
    color: ${B.inkLight};
    margin-top: 4px;
    font-weight: 300;
  }

  .pc-tabs {
    display: flex;
    gap: 4px;
    background: ${B.linenDark};
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 20px;
  }
  .pc-tab {
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
  }
  .pc-tab.active {
    background: white;
    color: ${B.ink};
    font-weight: 700;
    box-shadow: 0 1px 4px rgba(44,36,25,0.08);
  }

  .pc-history-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid ${B.border};
  }
  .pc-history-row:last-child { border-bottom: none; }

  .pc-history-thumb {
    width: 44px; height: 44px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    background: ${B.linenDeep};
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  .pc-privacy {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 14px;
    background: ${B.linenDark};
    border-radius: 8px;
    margin-top: 10px;
  }
  .pc-privacy-text { font-size: 11px; color: ${B.inkLight}; font-weight: 300; line-height: 1.5; }

  .pc-fade-in { animation: pcfade 0.4s ease forwards; }
  @keyframes pcfade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .pc-violation-banner {
    background: #FFF3E0;
    border: 1px solid ${B.amber}40;
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  .pc-violation-text { font-size: 12px; color: ${B.amber}; line-height: 1.5; }
  .pc-violation-text strong { font-weight: 700; }

  .pc-alcat-banner {
    background: #FDECEA;
    border: 1px solid ${B.red}30;
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  .pc-alcat-text { font-size: 12px; color: ${B.red}; line-height: 1.5; }
  .pc-alcat-text strong { font-weight: 700; }
`;

const GLYPH = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={B.gold} strokeWidth="1.5"/>
    <path d="M8 12h8M12 8v8" stroke={B.gold} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MEAL_TYPES = ["Breakfast", "Morning snack", "Lunch", "Afternoon snack", "Dinner", "Evening snack"];
const ROTATION_DAYS = ["Day 1", "Day 2", "Day 3", "Day 4", "Not sure"];

function scoreColor(score) {
  if (score >= 80) return B.green;
  if (score >= 55) return B.amber;
  return B.red;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PlateCheck({
  patientName = "Patient",
  alcat = { severe: [], moderate: [], mild: [] },
  rotationDay = null,
  onLogSaved,
}) {
  const [tab, setTab] = useState("scan");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [mealType, setMealType] = useState("Lunch");
  const [rotDay, setRotDay] = useState(rotationDay ? `Day ${rotationDay}` : "Not sure");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("platecheck_history") || "[]"); } catch { return []; }
  });
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const saveHistory = useCallback((entry) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 40);
      try { localStorage.setItem("platecheck_history", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const analyse = async () => {
    if (!image || !imageFile) return;
    setLoading(true);
    setResult(null);

    try {
      const base64 = image.split(",")[1];
      const mediaType = imageFile.type || "image/jpeg";

      const alcat_context = `
ALCAT severe reactors (avoid 9 months): ${alcat.severe.slice(0, 20).join(", ")}
ALCAT moderate reactors (avoid 6 months): ${alcat.moderate.slice(0, 20).join(", ")}
ALCAT mild reactors (avoid 3 months): ${alcat.mild.slice(0, 15).join(", ")}
Universal rules: NO seed oils (canola, sunflower, soybean, corn, vegetable oil). NO oats. NO legumes unless on rotation. Prioritise wild-caught fish, grass-fed meat, tallow or coconut oil.
Patient's rotation day today: ${rotDay}
`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          system: `You are a precision medicine nutrition AI for MediBalans Meet Mario platform in Stockholm.
You analyse meal photographs for clinical compliance with the patient's ALCAT rotation protocol.

ALCAT context for this patient:
${alcat_context}

CRITICAL: Respond ONLY with valid JSON. No preamble, no markdown backticks.

JSON schema:
{
  "identified_foods": [<list of food names you can identify in the plate>],
  "alcat_violations": [<foods identified that match patient's ALCAT reactive list, with severity: "severe"|"moderate"|"mild">],
  "rotation_violations": [<foods that don't belong in the stated rotation day, empty if day is "Not sure">],
  "seed_oil_flag": <true if visible seed oils, fried appearance suggesting seed oils, or processed foods likely cooked in seed oils>,
  "protocol_score": <integer 0-100, where 100 = perfect protocol compliance>,
  "macros_estimate": {
    "calories": <integer estimate>,
    "protein_g": <integer>,
    "carbs_g": <integer>,
    "fat_g": <integer>
  },
  "cpf_balance": <"optimal"|"protein_low"|"carb_high"|"fat_low"|"fat_high">,
  "clinical_note": <2-3 sentence functional medicine assessment of this meal in context of ALCAT protocol and gut health>,
  "suggestion": <1 concrete improvement for next time>,
  "positive_note": <1 thing this meal does well clinically>
}`,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: `Analyse this ${mealType.toLowerCase()} plate photo for clinical protocol compliance.` }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = (data.content || []).map(b => b.text || "").join("");

      let parsed;
      try {
        parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch {
        setResult({ error: "Could not parse analysis. Please try again." });
        return;
      }

      const entry = {
        ...parsed,
        date: new Date().toISOString(),
        meal_type: mealType,
        rotation_day: rotDay,
        image_thumb: image, // store for history display
      };

      setResult(entry);
      saveHistory({ ...entry, image_thumb: null }); // don't persist full base64
      if (onLogSaved) onLogSaved(entry);

    } catch (err) {
      setResult({ error: "Network error. Please check connection." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setImage(null); setImageFile(null); setResult(null); };

  const score = result?.protocol_score ?? null;
  const col = score !== null ? scoreColor(score) : B.inkLight;

  return (
    <>
      <style>{styles}</style>
      <div className="pc-root">

        {/* Header */}
        <div className="pc-header">
          {GLYPH}
          <h1 className="pc-title">PlateCheck</h1>
        </div>
        <p className="pc-subtitle">Meal scan · ALCAT compliance · Rotation protocol</p>

        {/* Tabs */}
        <div className="pc-tabs">
          {[["scan","📸 Scan Plate"],["history","📋 Meal Log"]].map(([t,l]) => (
            <button key={t} className={`pc-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>

        {/* ── SCAN TAB ── */}
        {tab === "scan" && (
          <div className="pc-fade-in">

            {/* Capture */}
            <div className="pc-card">
              <div className="pc-label">Photo capture</div>

              {!image ? (
                <>
                  <div className="pc-camera-zone" onClick={() => cameraRef.current?.click()}>
                    <div className="pc-camera-icon">🍽️</div>
                    <div className="pc-camera-text">Photograph your plate</div>
                    <div className="pc-camera-sub">Opens camera · Top-down view works best</div>
                  </div>
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                    style={{display:"none"}} onChange={handleFile} />
                  <button className="pc-btn-secondary" onClick={() => fileRef.current?.click()}>
                    Upload from library
                  </button>
                  <input ref={fileRef} type="file" accept="image/*"
                    style={{display:"none"}} onChange={handleFile} />
                </>
              ) : (
                <div className="pc-camera-zone" style={{cursor:"default"}}>
                  <img src={image} alt="Meal" className="pc-preview" />
                  <div className="pc-preview-overlay" onClick={reset}>↩ Retake</div>
                </div>
              )}

              {image && (
                <div className="pc-row" style={{marginTop:14}}>
                  <select className="pc-select" value={mealType} onChange={e=>setMealType(e.target.value)}>
                    {MEAL_TYPES.map(m=><option key={m}>{m}</option>)}
                  </select>
                  <select className="pc-select" value={rotDay} onChange={e=>setRotDay(e.target.value)}>
                    {ROTATION_DAYS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
              )}

              {image && !result && (
                <button className="pc-btn-primary" onClick={analyse} disabled={loading}>
                  {loading ? "Analysing…" : "Analyse Plate"}
                </button>
              )}

              <div className="pc-privacy">
                <span>🔒</span>
                <span className="pc-privacy-text">
                  Images are analysed in real time and never stored. Only the clinical assessment is logged.
                </span>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="pc-card pc-fade-in">
                <div className="pc-loading">
                  <div className="pc-spinner"/>
                  <div className="pc-loading-text">Cross-referencing ALCAT protocol…</div>
                </div>
              </div>
            )}

            {/* Error */}
            {result?.error && (
              <div className="pc-card pc-fade-in">
                <div className="pc-insight-block" style={{borderColor:B.red}}>
                  <div className="pc-insight-label" style={{color:B.red}}>Notice</div>
                  <div className="pc-insight-text">{result.error}</div>
                </div>
                <button className="pc-btn-secondary" onClick={reset}>Try again</button>
              </div>
            )}

            {/* Result */}
            {result && !result.error && (
              <div className="pc-fade-in">

                {/* Score + meal */}
                <div className="pc-card">
                  <div className="pc-label">Protocol compliance</div>
                  <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:20}}>
                    <div className="pc-score-ring" style={{borderColor:col}}>
                      <div className="pc-score-num" style={{color:col}}>{score}</div>
                      <div className="pc-score-den">/ 100</div>
                    </div>
                    <div>
                      <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:600,color:B.ink}}>
                        {result.meal_type}
                      </div>
                      <div style={{fontSize:12,color:B.inkLight,marginTop:3}}>
                        {result.rotation_day} · {new Date(result.date).toLocaleTimeString("en-SE",{hour:"2-digit",minute:"2-digit"})}
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:col,marginTop:4,textTransform:"uppercase",letterSpacing:0.8}}>
                        {score>=80?"Excellent":score>=60?"Good":score>=40?"Needs improvement":"Protocol violation"}
                      </div>
                    </div>
                  </div>

                  {/* Macros */}
                  {result.macros_estimate && (
                    <div className="pc-macro-row">
                      {[
                        {k:"calories",label:"kcal",name:"Energy"},
                        {k:"protein_g",label:"g",name:"Protein"},
                        {k:"carbs_g",label:"g",name:"Carbs"},
                        {k:"fat_g",label:"g",name:"Fat"},
                      ].map(m=>(
                        <div key={m.k} className="pc-macro-box">
                          <div className="pc-macro-val">{result.macros_estimate[m.k]}</div>
                          <div className="pc-macro-unit">{m.label}</div>
                          <div className="pc-macro-name">{m.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ALCAT violations */}
                {result.alcat_violations?.length > 0 && (
                  <div className="pc-card pc-fade-in">
                    <div className="pc-label">ALCAT flags</div>
                    <div className="pc-alcat-banner">
                      <span>⛔</span>
                      <div className="pc-alcat-text">
                        <strong>Reactive foods detected in this meal.</strong> These items are on your ALCAT avoidance list and may trigger delayed immune responses up to 72 hours later.
                      </div>
                    </div>
                    <div className="pc-chip-grid">
                      {result.alcat_violations.map((v,i)=>(
                        <div key={i} className="pc-chip" style={{
                          background: v.severity==="severe"?`${B.red}18`:v.severity==="moderate"?`${B.amber}18`:`${B.gold}18`,
                          color: v.severity==="severe"?B.red:v.severity==="moderate"?B.amber:B.gold,
                          border: `1px solid ${v.severity==="severe"?B.red:v.severity==="moderate"?B.amber:B.gold}40`,
                        }}>
                          <span>{v.severity==="severe"?"⛔":v.severity==="moderate"?"⚠️":"ℹ️"}</span>
                          {typeof v === "string" ? v : v.food || JSON.stringify(v)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rotation violations */}
                {result.rotation_violations?.length > 0 && (
                  <div className="pc-card pc-fade-in">
                    <div className="pc-label">Rotation violations</div>
                    <div className="pc-violation-banner">
                      <span>🔄</span>
                      <div className="pc-violation-text">
                        <strong>Foods outside {result.rotation_day} rotation.</strong> Eating outside your rotation window reduces the rest period between exposures and may reactivate sensitivities.
                      </div>
                    </div>
                    <div className="pc-chip-grid">
                      {result.rotation_violations.map((v,i)=>(
                        <div key={i} className="pc-chip" style={{
                          background:`${B.amber}15`,color:B.amber,
                          border:`1px solid ${B.amber}40`,
                        }}>
                          🔄 {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seed oil flag */}
                {result.seed_oil_flag && (
                  <div className="pc-card pc-fade-in">
                    <div className="pc-alcat-banner" style={{background:"#FFF3E0",border:`1px solid ${B.amber}40`}}>
                      <span>🛢️</span>
                      <div className="pc-violation-text">
                        <strong>Possible seed oil detected.</strong> Canola, sunflower, soybean and corn oils are inflammatory and excluded from the MediBalans protocol. Use tallow, coconut oil, or avocado oil.
                      </div>
                    </div>
                  </div>
                )}

                {/* Identified foods */}
                {result.identified_foods?.length > 0 && (
                  <div className="pc-card pc-fade-in">
                    <div className="pc-label">Foods identified</div>
                    <div className="pc-chip-grid">
                      {result.identified_foods.map((f,i)=>{
                        const isSevere = alcat.severe?.some(r=>r.toLowerCase()===f.toLowerCase());
                        const isMod = alcat.moderate?.some(r=>r.toLowerCase()===f.toLowerCase());
                        return (
                          <div key={i} className="pc-chip" style={{
                            background: isSevere?`${B.red}12`:isMod?`${B.amber}12`:`${B.green}12`,
                            color: isSevere?B.red:isMod?B.amber:B.green,
                            border: `1px solid ${isSevere?B.red:isMod?B.amber:B.green}30`,
                          }}>
                            {isSevere?"⛔":isMod?"⚠️":"✓"} {f}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Clinical note + suggestion */}
                <div className="pc-card pc-fade-in">
                  <div className="pc-label">Clinical assessment</div>

                  {result.positive_note && (
                    <div className="pc-insight-block" style={{borderColor:B.green}}>
                      <div className="pc-insight-label" style={{color:B.green}}>What's working</div>
                      <div className="pc-insight-text">{result.positive_note}</div>
                    </div>
                  )}

                  {result.clinical_note && (
                    <div className="pc-insight-block">
                      <div className="pc-insight-label">Assessment</div>
                      <div className="pc-insight-text">{result.clinical_note}</div>
                    </div>
                  )}

                  {result.suggestion && (
                    <div className="pc-insight-block" style={{borderColor:B.rose}}>
                      <div className="pc-insight-label" style={{color:B.rose}}>Next time</div>
                      <div className="pc-insight-text"><strong>{result.suggestion}</strong></div>
                    </div>
                  )}

                  <button className="pc-btn-secondary" onClick={reset}>Scan another plate</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div className="pc-fade-in">
            {history.length === 0 ? (
              <div className="pc-card" style={{textAlign:"center",padding:"40px 24px"}}>
                <div style={{fontSize:32,marginBottom:12}}>🍽️</div>
                <div style={{fontFamily:"Playfair Display,serif",fontSize:18,color:B.inkMid}}>No meals logged yet</div>
                <div style={{fontSize:13,color:B.inkLight,marginTop:6}}>Scan your first plate to begin your food log</div>
              </div>
            ) : (
              <div className="pc-card">
                <div className="pc-label">Recent meals</div>
                {history.slice(0,20).map((entry,i)=>{
                  const c = scoreColor(entry.protocol_score ?? 50);
                  return (
                    <div key={i} className="pc-history-row">
                      <div className="pc-history-thumb">🍽️</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:13,fontWeight:700,color:B.ink}}>{entry.meal_type}</div>
                          <div style={{
                            fontFamily:"IBM Plex Mono,monospace",fontSize:12,fontWeight:500,
                            color:c,background:`${c}15`,padding:"2px 8px",borderRadius:10,
                          }}>
                            {entry.protocol_score ?? "—"}
                          </div>
                        </div>
                        <div style={{fontSize:11,color:B.inkLight,marginTop:2}}>
                          {entry.rotation_day} · {new Date(entry.date).toLocaleDateString("en-SE",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                        </div>
                        {entry.alcat_violations?.length > 0 && (
                          <div style={{fontSize:11,color:B.red,marginTop:3}}>
                            ⛔ {entry.alcat_violations.length} ALCAT flag{entry.alcat_violations.length>1?"s":""}
                          </div>
                        )}
                        {entry.identified_foods?.length > 0 && (
                          <div style={{fontSize:11,color:B.inkLight,marginTop:2}}>
                            {entry.identified_foods.slice(0,5).join(", ")}{entry.identified_foods.length>5?` +${entry.identified_foods.length-5} more`:""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
