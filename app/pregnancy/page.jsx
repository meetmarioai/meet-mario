"use client";
import { useState } from "react";

// ─── DESIGN TOKENS (Balans) ───────────────────────────────────────────────────
const T = {
  w:    "#F7F4F0", w1: "#F1EDE7", w2: "#E8E2DA", w3: "#D8D0C4",
  w4:   "#B8ACA0", w5: "#8A7E72", w6: "#4A4038", w7: "#1C1510",
  rg:   "#C4887A", rg2: "#9A6255", rg3: "#DEB0A4", rgBg: "#F8F0EE",
  err:  "#B85040", ok: "#6A9060", warn: "#B88040",
  // Pregnancy accent — warm sage
  sage: "#7A9E8A", sageBg: "#EEF4F0", sageLight: "#C4DDD0",
  // Gold for critical warnings
  gold: "#9A7240", goldBg: "#FAF3E8",
};
const fonts = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', 'Arial', sans-serif",
  mono:  "'SF Mono', 'Fira Mono', 'Courier New', monospace",
};

// ─── CLINICAL DATA ────────────────────────────────────────────────────────────
const HIGH_MERCURY_FISH = ["SWORDFISH","SHARK","KING MACKEREL","TILEFISH","BIGEYE TUNA","ORANGE ROUGHY"];
const LISTERIA_FOODS = ["UNPASTEURISED MILK","SOFT CHEESE","PÂTÉ","DELI MEAT","SMOKED SALMON (COLD)"];

const VARIANT_RISKS = {
  "MTHFR_C677T": {
    gene: "MTHFR C677T",
    bothParents: "25% chance fetus is homozygous C677T. Severely impaired methylation from birth. Neural tube defect risk elevated 3-4×. Critical: mother must take 5-MTHF (not folic acid) from preconception.",
    oneParent: "50% chance fetus is heterozygous. Methylation at ~65% efficiency. Monitor folate status from birth.",
    severity: "critical",
  },
  "MTHFR_A1298C": {
    gene: "MTHFR A1298C",
    bothParents: "25% chance homozygous A1298C. Combined with C677T compound heterozygosity risk. Severe methylation impairment. Neural development, autism spectrum risk elevated.",
    oneParent: "Child may carry one copy. If combined with C677T from other parent, compound heterozygous risk.",
    severity: "high",
  },
  "APOE4": {
    gene: "APOE ε4",
    bothParents: "25% chance fetus is APOE4/4 homozygous — 8-12× elevated Alzheimer's risk. Genetic counselling strongly recommended before conception.",
    oneParent: "50% chance fetus carries one APOE4 allele — 3× elevated Alzheimer's risk. Consider genetic counselling.",
    severity: "high",
  },
  "NAT2_SLOW": {
    gene: "NAT2 slow acetylator",
    bothParents: "Child will be slow acetylator. Environmental carcinogen processing impaired from birth. Avoid charred foods, tobacco smoke exposure entirely during pregnancy.",
    oneParent: "50% chance child is slow acetylator. Moderate dietary precautions advised.",
    severity: "moderate",
  },
  "SOD2": {
    gene: "SOD2 rs4880",
    bothParents: "Reduced mitochondrial antioxidant defence in fetus. Higher CoQ10 and manganese needs from infancy. Prioritise antioxidant-rich maternal diet throughout pregnancy.",
    oneParent: "Child may have moderately reduced mitochondrial defence. Ensure adequate maternal CoQ10 and polyphenol intake.",
    severity: "moderate",
  },
  "VDR": {
    gene: "VDR (Vitamin D Receptor)",
    bothParents: "Fetus will have reduced vitamin D receptor sensitivity. Maternal supplementation must be higher (4000-6000 IU/day). Critical for fetal immune programming and skeletal development.",
    oneParent: "Monitor maternal and infant vitamin D status closely. Standard supplementation may be insufficient.",
    severity: "moderate",
  },
};

const TRIMESTER_PROTOCOL = [
  {
    trimester: "Periconception",
    weeks: "−3 months to week 6",
    color: T.sage,
    icon: "◎",
    description: "The most critical window. Neural tube closes by day 28 — often before pregnancy is confirmed.",
    nutrients: [
      { name: "5-MTHF (active folate)", dose: "400–800 mcg/day", note: "NOT synthetic folic acid if MTHFR positive", critical: true },
      { name: "Methylcobalamin B12", dose: "500–1000 mcg/day", note: "Active form only — critical for MTHFR carriers", critical: true },
      { name: "Choline", dose: "450 mg/day", note: "Most prenatal vitamins are severely inadequate", critical: true },
      { name: "Iodine", dose: "150–200 mcg/day", note: "Sweden borderline sufficient — supplement essential", critical: false },
      { name: "Vitamin D3 + K2", dose: "2000–4000 IU D3 + 100 mcg MK-7", note: "Higher if VDR variant present", critical: false },
      { name: "DHA (algae-sourced)", dose: "300–600 mg/day", note: "Neuronal membrane formation begins immediately", critical: false },
    ],
    foods: [
      { food: "Egg yolk daily", why: "Choline, methylcobalamin, DHA, vitamin D — all in one" },
      { food: "Wild salmon or sardines 4×/week", why: "DHA, vitamin D, CoQ10, calcium" },
      { food: "Dark leafy greens (spinach, asparagus)", why: "Natural folate — check ALCAT first" },
      { food: "Liver once/week (small amount)", why: "B12, folate, CoQ10 — limit T1 to avoid excess vitamin A" },
      { food: "Avocado daily", why: "Folate, healthy fats, B6 — universally well tolerated" },
      { food: "Blueberries, pomegranate", why: "Polyphenols, antioxidants, folic acid protection" },
    ],
    avoid: ["Alcohol — no safe level", "Raw fish and undercooked meat — Listeria/Toxoplasma", "High mercury fish", "Synthetic folic acid (if MTHFR positive)", "Seed oils"],
  },
  {
    trimester: "First Trimester",
    weeks: "Weeks 7–12",
    color: T.rg,
    icon: "◑",
    description: "Organ formation. Maternal immune tolerance must be established. ALCAT adherence is critical — maternal cytokines cross the placenta.",
    nutrients: [
      { name: "5-MTHF", dose: "800 mcg/day", note: "Continue — neural tube and brain development", critical: true },
      { name: "Zinc", dose: "15–25 mg/day", note: "DNA synthesis, cell division, organ formation", critical: true },
      { name: "Iron (only if deficient)", dose: "18–27 mg/day", note: "Test serum ferritin first — excess iron is harmful", critical: false },
      { name: "B6 (P5P form)", dose: "25–50 mg/day", note: "Reduces nausea significantly, amino acid metabolism", critical: false },
      { name: "Magnesium glycinate", dose: "300 mg/day", note: "Muscle relaxation, prevents early cramping", critical: false },
      { name: "Omega-3 DHA + EPA", dose: "600 mg DHA / 300 mg EPA", note: "Fetal CNS and retinal development", critical: false },
    ],
    foods: [
      { food: "Ginger tea", why: "Clinical evidence for nausea reduction — check ALCAT (mild for many)" },
      { food: "White potato (if tolerated)", why: "B6, easily digested, gentle on nausea" },
      { food: "Coconut water", why: "Electrolytes, magnesium, gentle hydration for nausea" },
      { food: "Lean white fish — codfish, tilapia", why: "Low mercury, protein, zinc, omega-3" },
      { food: "Pumpkin seeds", why: "Zinc, magnesium, iron — check ALCAT" },
      { food: "Quinoa", why: "Complete protein, iron, zinc, B vitamins — check ALCAT" },
    ],
    avoid: ["High mercury fish (swordfish, shark, king mackerel)", "Liver in large amounts (vitamin A toxicity T1)", "Unpasteurised dairy", "Raw shellfish", "Caffeine over 200mg/day", "All ALCAT reactive foods"],
  },
  {
    trimester: "Second Trimester",
    weeks: "Weeks 13–26",
    color: T.warn,
    icon: "◕",
    description: "Rapid fetal growth. Calcium demand peaks. Maternal bones will be depleted if diet is insufficient.",
    nutrients: [
      { name: "Calcium citrate", dose: "1000–1200 mg/day", note: "Skeletal mineralisation accelerates rapidly", critical: true },
      { name: "Vitamin D3", dose: "3000–5000 IU/day", note: "Calcium absorption requires D3 — especially if VDR variant", critical: true },
      { name: "Magnesium glycinate", dose: "350–400 mg/day", note: "Prevents gestational hypertension and preterm risk", critical: false },
      { name: "CoQ10 (ubiquinol)", dose: "200–300 mg/day", note: "Placental mitochondrial function, preeclampsia prevention", critical: false },
      { name: "Iron (if ferritin low)", dose: "30–60 mg/day", note: "Placental development — test before supplementing", critical: false },
      { name: "Choline", dose: "550 mg/day", note: "Fetal hippocampal development — most critical T2-T3", critical: false },
    ],
    foods: [
      { food: "Sardines with bones 3×/week", why: "Calcium, vitamin D, CoQ10, omega-3 in one food" },
      { food: "Broccoli and collard greens daily", why: "Calcium, K1, sulforaphane, folate" },
      { food: "Egg yolk every morning", why: "Choline peaks in importance T2-T3, D3, B12" },
      { food: "Wild salmon twice weekly", why: "DHA, vitamin D, CoQ10, protein" },
      { food: "Mussels weekly", why: "Iron, zinc, B12, DHA, manganese — one of the most nutrient-dense foods" },
      { food: "Pumpkin and sweet potato", why: "Beta-carotene (safe form of vitamin A), B6, potassium" },
    ],
    avoid: ["High mercury fish", "Unpasteurised dairy and soft cheeses", "Cold smoked salmon (Listeria)", "Deli meats and pâté", "Alcohol", "All ALCAT reactive foods — fetal cytokine exposure"],
  },
  {
    trimester: "Third Trimester",
    weeks: "Weeks 27–40",
    color: T.rg2,
    icon: "●",
    description: "70% of fetal brain growth occurs here. DHA demand is at its highest point in human life. Iron stores are built in the final 6 weeks.",
    nutrients: [
      { name: "DHA (high dose)", dose: "800–1000 mg/day", note: "70% of brain growth occurs T3 — non-negotiable", critical: true },
      { name: "Iron", dose: "30–60 mg/day (if ferritin <50)", note: "Fetal iron stores built in final 6 weeks of pregnancy", critical: true },
      { name: "Vitamin K2 MK-7", dose: "200 mcg/day", note: "Fetal bone and vascular calcification programming", critical: false },
      { name: "Probiotics (L. rhamnosus, B. longum)", dose: "10–20 billion CFU/day", note: "Fetal microbiome seeding begins — maternal gut health transfers", critical: false },
      { name: "Calcium", dose: "1200 mg/day", note: "Fetal skeletal density finalises T3", critical: false },
      { name: "Omega-3 EPA", dose: "400 mg/day", note: "Anti-inflammatory, reduces preterm labour risk", critical: false },
    ],
    foods: [
      { food: "Wild salmon and mackerel daily if possible", why: "DHA peaks — brain building is happening right now" },
      { food: "Beef or lamb (slow-cooked)", why: "Iron (heme form — most bioavailable), zinc, CoQ10" },
      { food: "Mussels weekly", why: "Iron, B12, DHA, zinc — most complete seafood for T3" },
      { food: "Probiotic foods (coconut yogurt if tolerated)", why: "Maternal microbiome transfers to infant during birth" },
      { food: "Beets and leafy greens", why: "Iron, folate, nitrates for placental blood flow" },
      { food: "Dates (last 4 weeks)", why: "Clinical evidence for cervical ripening and shorter labour" },
    ],
    avoid: ["High mercury fish", "Raw fish entirely", "Unpasteurised products", "Alcohol", "Excessive caffeine", "All ALCAT reactive foods — preterm inflammation risk"],
  },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Panel({ children, style = {} }) {
  return (
    <div style={{ background: T.w, border: `1px solid ${T.w3}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}
function FieldLabel({ children }) {
  return <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.18em", color: T.rg2, marginBottom: 10, textTransform: "uppercase" }}>{children}</div>;
}
function Warning({ children, color = T.err }) {
  return (
    <div style={{ background: `${color}0F`, border: `1px solid ${color}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 8, fontSize: 12, fontFamily: fonts.sans, color: T.w6, lineHeight: 1.6 }}>
      {children}
    </div>
  );
}
function Badge({ children, color }) {
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 8px", fontSize: 10, fontFamily: fonts.mono, color, letterSpacing: "0.08em" }}>
      {children}
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PregnancyPage() {
  const [tab, setTab] = useState("overview");
  const [partnerA, setPartnerA] = useState({ name: "", alcat: null, alcatParsed: false, variants: {}, uploading: false });
  const [partnerB, setPartnerB] = useState({ name: "", alcat: null, alcatParsed: false, variants: {}, uploading: false });
  const [compatibility, setCompatibility] = useState(null);
  const [compatLoading, setCompatLoading] = useState(false);
  const [trimester, setTrimester] = useState(0);
  const [marioMsg, setMarioMsg] = useState("");
  const [marioResp, setMarioResp] = useState("");
  const [marioLoading, setMarioLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [maternalAlcat, setMaternalAlcat] = useState(null);
  const [maternalUploading, setMaternalUploading] = useState(false);

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "genetics", label: "Genetic compatibility" },
    { id: "nutrition", label: "Trimester nutrition" },
    { id: "alcat", label: "Maternal ALCAT" },
    { id: "mario", label: "Ask Mario" },
  ];

  // ── API call ──────────────────────────────────────────────────────────────
  async function callClaude(messages, system) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
    });
    const d = await res.json();
    return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  }

  // ── Parse ALCAT PDF ───────────────────────────────────────────────────────
  async function parseAlcatPDF(file) {
    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = () => rej(new Error("Read failed"));
      r.readAsDataURL(file);
    });
    const isImage = file.type.startsWith("image/");
    const mediaType = isImage ? file.type : "application/pdf";
    const contentBlock = isImage
      ? { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } }
      : { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } };

    const prompt = `Parse this ALCAT food sensitivity report. Return ONLY JSON:
{"name":"patient name","severe":["FOOD1"],"moderate":["FOOD1"],"mild":["FOOD1"],"candida":true/false,"casein":true/false}
All food names UPPERCASE.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 2000,
        messages: [{ role: "user", content: [contentBlock, { type: "text", text: prompt }] }]
      })
    });
    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  }

  // ── Compatibility analysis ────────────────────────────────────────────────
  async function analyseCompatibility() {
    setCompatLoading(true);
    const aVariants = Object.entries(partnerA.variants).filter(([, v]) => v).map(([k]) => k);
    const bVariants = Object.entries(partnerB.variants).filter(([, v]) => v).map(([k]) => k);
    const shared = aVariants.filter(v => bVariants.includes(v));

    const risks = [];
    for (const v of aVariants) {
      if (VARIANT_RISKS[v]) {
        const bothCarry = bVariants.includes(v);
        risks.push({ ...VARIANT_RISKS[v], bothParents: bothCarry, risk: bothCarry ? VARIANT_RISKS[v].bothParents : VARIANT_RISKS[v].oneParent });
      }
    }
    for (const v of bVariants) {
      if (VARIANT_RISKS[v] && !aVariants.includes(v)) {
        risks.push({ ...VARIANT_RISKS[v], bothParents: false, risk: VARIANT_RISKS[v].oneParent });
      }
    }

    const prompt = `You are a clinical geneticist and prenatal nutrition specialist at MediBalans AB.

Partner A variants: ${aVariants.join(", ") || "none entered"}
Partner B variants: ${bVariants.join(", ") || "none entered"}
Shared variants (both parents carry): ${shared.join(", ") || "none"}

Provide a brief, warm, clinical summary of:
1. The most important genetic consideration for their future child
2. The single most critical preconception dietary change for the mother
3. One supplement they must both take before conception

Keep it under 150 words. Be direct but compassionate. No bullet points.`;

    try {
      const summary = await callClaude([{ role: "user", content: prompt }],
        "You are Mario, a precision medicine AI specialising in preconception and prenatal care at MediBalans AB, Stockholm. You integrate genomics, immunology, and clinical nutrition. Respond warmly and precisely.");
      setCompatibility({ risks, summary, shared });
    } catch (e) { setCompatibility({ risks, summary: "Analysis unavailable.", shared }); }
    setCompatLoading(false);
  }

  // ── Mario prenatal chat ───────────────────────────────────────────────────
  async function sendMario() {
    if (!marioMsg.trim()) return;
    setMarioLoading(true);
    const msgs = [...chatHistory, { role: "user", content: marioMsg }];
    setChatHistory(msgs);
    setMarioMsg("");

    const maternalContext = maternalAlcat
      ? `Maternal ALCAT: Severe: ${maternalAlcat.severe?.join(", ")||"none"}. Moderate: ${maternalAlcat.moderate?.join(", ")||"none"}. Candida: ${maternalAlcat.candida?"yes":"no"}. Casein: ${maternalAlcat.casein?"yes":"no"}.`
      : "No maternal ALCAT loaded.";

    const aContext = Object.entries(partnerA.variants).filter(([,v])=>v).map(([k])=>k).join(", ") || "none";
    const bContext = Object.entries(partnerB.variants).filter(([,v])=>v).map(([k])=>k).join(", ") || "none";

    const sys = `You are Mario, prenatal precision medicine AI at MediBalans AB, Stockholm.

${maternalContext}
Maternal genetic variants: ${aContext}
Partner genetic variants: ${bContext}
Current trimester focus: ${TRIMESTER_PROTOCOL[trimester]?.trimester || "not specified"}

CRITICAL RULES — always enforce:
- No seed oils ever
- No high mercury fish (swordfish, shark, king mackerel, tilefish)
- No unpasteurised dairy, raw meat, raw shellfish
- No alcohol — zero safe level
- If MTHFR positive: 5-MTHF only, never synthetic folic acid
- All food recommendations must respect maternal ALCAT reactivity
- Remind about genetic counselling for APOE4 or BRCA findings
- CPF balance every meal
- Wild-caught fish only
- Cook meat below 180°C (NAT2 consideration)

You reason from three layers simultaneously: immune (ALCAT), genomic (variants), and cellular (trimester-specific nutrient needs).
Respond in warm, clear prose. You are their daily clinical companion through pregnancy.`;

    try {
      const resp = await callClaude(msgs, sys);
      const newMsgs = [...msgs, { role: "assistant", content: resp }];
      setChatHistory(newMsgs);
      setMarioResp(resp);
    } catch { setMarioResp("Connection error. Please try again."); }
    setMarioLoading(false);
  }

  const proto = TRIMESTER_PROTOCOL[trimester];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.w, fontFamily: fonts.sans }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.w3}`, padding: "0 44px", background: T.w, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="/dashboard" style={{ fontSize: 11, fontFamily: fonts.mono, color: T.w4, textDecoration: "none", letterSpacing: "0.1em" }}>← MEET MARIO</a>
            <div style={{ width: 1, height: 16, background: T.w3 }} />
            <div style={{ fontFamily: fonts.serif, fontSize: 16, color: T.w7, fontWeight: 400 }}>
              Baby <em style={{ color: T.sage, fontStyle: "italic" }}>Balans</em>
            </div>
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 8, letterSpacing: "0.18em", color: T.w4 }}>
            PRECONCEPTION · PREGNANCY · FIRST 1000 DAYS
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", borderBottom: `2px solid ${tab === t.id ? T.sage : "transparent"}`,
              padding: "10px 18px", cursor: "pointer", fontSize: 12, fontFamily: fonts.sans,
              color: tab === t.id ? T.sage : T.w5, fontWeight: tab === t.id ? 500 : 400, transition: "all .15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 44px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.2em", color: T.sage, marginBottom: 12, textTransform: "uppercase" }}>Precision prenatal medicine</div>
            <div style={{ fontFamily: fonts.serif, fontSize: 44, fontWeight: 400, color: T.w7, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 20 }}>
              Eating for<br /><em style={{ fontStyle: "italic", color: T.sage }}>two genomes</em>
            </div>
            <p style={{ fontSize: 14, color: T.w5, lineHeight: 1.8, maxWidth: 560, marginBottom: 40, fontWeight: 300 }}>
              The first 1,000 days — from conception to age 2 — represent the most consequential nutritional window in human life. Maternal immune activation, micronutrient status, and genetic variants shape the child's epigenome, microbiome, and disease risk for decades. This platform integrates both parents' genomics with maternal ALCAT immune data to generate a precision prenatal protocol.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
              {[
                { icon: "⬡", title: "Genetic compatibility", desc: "Upload both parents' WGS variants. Identify recessive risks in the fetus — MTHFR, APOE, NAT2, SOD2, VDR.", color: T.sage, tab: "genetics" },
                { icon: "◎", title: "Trimester nutrition", desc: "Trimester-specific supplement and food protocols. Adjusted for maternal ALCAT reactivity and genetic variants.", color: T.rg, tab: "nutrition" },
                { icon: "⬆", title: "Maternal ALCAT", desc: "Upload maternal ALCAT. Mario filters all meal recommendations. Maternal cytokines cross the placenta.", color: T.warn, tab: "alcat" },
                { icon: "✦", title: "Ask Mario", desc: "Clinical AI reasoning from ALCAT + genetics + trimester simultaneously. Your daily prenatal companion.", color: T.rg2, tab: "mario" },
              ].map(({ icon, title, desc, color, tab: t }) => (
                <div key={t} onClick={() => setTab(t)} style={{ background: T.w, border: `1px solid ${T.w3}`, borderLeft: `3px solid ${color}`, borderRadius: 10, padding: "20px 22px", cursor: "pointer", transition: "box-shadow .15s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ fontSize: 20, marginBottom: 10, color }}>{icon}</div>
                  <div style={{ fontFamily: fonts.serif, fontSize: 18, color: T.w7, marginBottom: 6, fontWeight: 400 }}>{title}</div>
                  <div style={{ fontSize: 12, color: T.w5, lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>

            <Warning color={T.gold}>
              <strong style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.12em" }}>CLINICAL DISCLAIMER</strong><br />
              This platform provides decision support for qualified clinicians. It does not replace genetic counselling, obstetric care, or individual medical advice. All recommendations should be reviewed by the attending physician. For APOE4/4, BRCA, or other high-penetrance findings, genetic counselling referral is mandatory.
            </Warning>
          </div>
        )}

        {/* ── GENETICS ── */}
        {tab === "genetics" && (
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.2em", color: T.sage, marginBottom: 12 }}>PARENTAL GENOMICS</div>
            <div style={{ fontFamily: fonts.serif, fontSize: 36, fontWeight: 400, color: T.w7, letterSpacing: "-0.01em", marginBottom: 8 }}>
              Genetic <em style={{ color: T.sage, fontStyle: "italic" }}>compatibility</em>
            </div>
            <p style={{ fontSize: 13, color: T.w5, lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>
              When both parents carry the same heterozygous variant, each child has a 25% chance of inheriting two copies — producing a homozygous genotype with significantly stronger clinical expression. Enter variants from WGS reports below.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Partner A (Mother)", state: partnerA, setState: setPartnerA },
                { label: "Partner B (Father)", state: partnerB, setState: setPartnerB },
              ].map(({ label, state, setState }) => (
                <Panel key={label}>
                  <FieldLabel>{label}</FieldLabel>
                  <input value={state.name} onChange={e => setState(s => ({ ...s, name: e.target.value }))}
                    placeholder="Name" style={{ width: "100%", background: T.w1, border: `1px solid ${T.w3}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: fonts.sans, color: T.w6, marginBottom: 14, boxSizing: "border-box" }} />
                  <div style={{ fontSize: 11, fontFamily: fonts.mono, color: T.w4, letterSpacing: "0.1em", marginBottom: 10 }}>KEY VARIANTS</div>
                  {[
                    { key: "MTHFR_C677T", label: "MTHFR C677T" },
                    { key: "MTHFR_A1298C", label: "MTHFR A1298C" },
                    { key: "APOE4", label: "APOE ε4 carrier" },
                    { key: "NAT2_SLOW", label: "NAT2 slow acetylator" },
                    { key: "SOD2", label: "SOD2 rs4880" },
                    { key: "VDR", label: "VDR variant" },
                  ].map(({ key, label: vLabel }) => (
                    <div key={key} onClick={() => setState(s => ({ ...s, variants: { ...s.variants, [key]: !s.variants[key] } }))}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6, cursor: "pointer", marginBottom: 3,
                        background: state.variants[key] ? T.sageBg : T.w1, border: `1px solid ${state.variants[key] ? T.sage : T.w3}`, transition: "all .15s" }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${state.variants[key] ? T.sage : T.w3}`, background: state.variants[key] ? T.sage : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {state.variants[key] && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 11, fontFamily: fonts.sans, color: state.variants[key] ? T.sage : T.w5 }}>{vLabel}</span>
                    </div>
                  ))}
                </Panel>
              ))}
            </div>

            <button onClick={analyseCompatibility} style={{ background: T.sage, color: "#fff", borderRadius: 9, padding: "12px 32px", fontSize: 12, fontFamily: fonts.sans, fontWeight: 500, letterSpacing: "0.08em", border: "none", cursor: "pointer", marginBottom: 24 }}>
              {compatLoading ? "Analysing…" : "Analyse compatibility"}
            </button>

            {compatibility && (
              <div>
                {/* Mario's summary */}
                <Panel style={{ borderLeft: `3px solid ${T.sage}` }}>
                  <FieldLabel>Mario's clinical summary</FieldLabel>
                  <div style={{ fontSize: 13, fontFamily: fonts.sans, color: T.w6, lineHeight: 1.8 }}>{compatibility.summary}</div>
                </Panel>

                {/* Risk cards */}
                {compatibility.risks.length > 0 && (
                  <div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.18em", color: T.w4, marginBottom: 12 }}>VARIANT RISK ANALYSIS</div>
                    {compatibility.risks.map((r, i) => (
                      <div key={i} style={{ background: T.w, border: `1px solid ${T.w3}`, borderLeft: `3px solid ${r.severity === "critical" ? T.err : r.severity === "high" ? T.warn : T.sage}`, borderRadius: 9, padding: "16px 20px", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.w7, fontWeight: 500 }}>{r.gene}</div>
                          <Badge color={r.severity === "critical" ? T.err : r.severity === "high" ? T.warn : T.sage}>
                            {r.bothParents ? "BOTH PARENTS" : "ONE PARENT"} · {r.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div style={{ fontSize: 12, fontFamily: fonts.sans, color: T.w5, lineHeight: 1.7 }}>{r.risk}</div>
                      </div>
                    ))}
                  </div>
                )}

                {compatibility.risks.some(r => r.severity === "critical" || r.bothParents) && (
                  <Warning color={T.err}>
                    <strong>Genetic counselling recommended.</strong> One or more high-impact shared variants have been identified. A certified genetic counsellor should review these findings before conception.
                  </Warning>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── NUTRITION ── */}
        {tab === "nutrition" && (
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.2em", color: T.sage, marginBottom: 12 }}>PRECISION PRENATAL NUTRITION</div>
            <div style={{ fontFamily: fonts.serif, fontSize: 36, fontWeight: 400, color: T.w7, letterSpacing: "-0.01em", marginBottom: 24 }}>
              Eat for the <em style={{ color: T.sage, fontStyle: "italic" }}>genome you're building</em>
            </div>

            {/* Trimester selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              {TRIMESTER_PROTOCOL.map((p, i) => (
                <button key={i} onClick={() => setTrimester(i)} style={{
                  background: trimester === i ? p.color : T.w1,
                  border: `1px solid ${trimester === i ? p.color : T.w3}`,
                  borderRadius: 8, padding: "8px 16px", cursor: "pointer", transition: "all .15s",
                  fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.1em",
                  color: trimester === i ? "#fff" : T.w5,
                }}>
                  {p.icon} {p.trimester.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ borderLeft: `3px solid ${proto.color}`, paddingLeft: 20, marginBottom: 28 }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.16em", color: proto.color, marginBottom: 4 }}>{proto.weeks}</div>
              <div style={{ fontFamily: fonts.serif, fontSize: 22, color: T.w7, fontWeight: 400, marginBottom: 8 }}>{proto.trimester}</div>
              <div style={{ fontSize: 13, color: T.w5, lineHeight: 1.7, maxWidth: 540 }}>{proto.description}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

              {/* Supplements */}
              <Panel>
                <FieldLabel>Supplement protocol</FieldLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {proto.nutrients.map((n, i) => (
                    <div key={i} style={{ background: n.critical ? `${T.err}08` : T.w1, border: `1px solid ${n.critical ? T.err + "30" : T.w3}`, borderRadius: 7, padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.w7, fontWeight: 500 }}>{n.name}</div>
                        {n.critical && <Badge color={T.err}>CRITICAL</Badge>}
                      </div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 10, color: proto.color, marginTop: 2, marginBottom: 4 }}>{n.dose}</div>
                      <div style={{ fontSize: 11, color: T.w4, lineHeight: 1.5 }}>{n.note}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Foods */}
              <div>
                <Panel>
                  <FieldLabel>Priority foods this trimester</FieldLabel>
                  {proto.foods.map((f, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: i < proto.foods.length - 1 ? `1px solid ${T.w2}` : "none" }}>
                      <div style={{ fontSize: 12, fontFamily: fonts.sans, color: T.w7, fontWeight: 500, marginBottom: 2 }}>{f.food}</div>
                      <div style={{ fontSize: 11, fontFamily: fonts.sans, color: T.w4, lineHeight: 1.5 }}>{f.why}</div>
                    </div>
                  ))}
                </Panel>

                <Panel>
                  <FieldLabel>Avoid this trimester</FieldLabel>
                  {proto.avoid.map((a, i) => (
                    <div key={i} style={{ fontSize: 12, fontFamily: fonts.sans, color: T.w6, padding: "4px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: T.err, marginTop: 1 }}>✕</span>{a}
                    </div>
                  ))}
                </Panel>
              </div>
            </div>

            {/* MTHFR warning */}
            {(partnerA.variants.MTHFR_C677T || partnerA.variants.MTHFR_A1298C) && (
              <Warning color={T.err}>
                <strong>MTHFR variant detected in mother.</strong> The supplement protocol above shows 5-MTHF. Confirm the prenatal vitamin used does NOT contain synthetic folic acid (listed as "folic acid" or "pteroylmonoglutamic acid") — this competes with the impaired MTHFR enzyme and may be counterproductive.
              </Warning>
            )}
          </div>
        )}

        {/* ── MATERNAL ALCAT ── */}
        {tab === "alcat" && (
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.2em", color: T.sage, marginBottom: 12 }}>MATERNAL IMMUNE MAPPING</div>
            <div style={{ fontFamily: fonts.serif, fontSize: 36, fontWeight: 400, color: T.w7, letterSpacing: "-0.01em", marginBottom: 8 }}>
              Maternal <em style={{ color: T.sage, fontStyle: "italic" }}>ALCAT</em>
            </div>
            <p style={{ fontSize: 13, color: T.w5, lineHeight: 1.7, marginBottom: 20, maxWidth: 560 }}>
              Maternal cytokines (IL-6, TNF-α) cross the placenta. Chronic immune activation from food reactivity directly exposes the fetus to inflammatory signals — linked to elevated autism, ADHD, and autoimmune risk. The ALCAT during pregnancy is not optional.
            </p>

            <Warning color={T.warn}>
              <strong>The ALCAT is more important during pregnancy than at any other time.</strong> Immune activation in the mother becomes fetal inflammation. Every reactive food eaten is a cytokine signal sent to the developing brain and immune system.
            </Warning>

            {!maternalAlcat ? (
              <Panel>
                <FieldLabel>Upload maternal ALCAT report</FieldLabel>
                <label style={{ cursor: "pointer", display: "block", border: `2px dashed ${T.w3}`, borderRadius: 10, padding: "40px", textAlign: "center" }}>
                  <input type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={async e => {
                    const file = e.target.files[0]; if (!file) return;
                    setMaternalUploading(true);
                    try { const parsed = await parseAlcatPDF(file); setMaternalAlcat(parsed); }
                    catch (err) { console.error(err); }
                    setMaternalUploading(false);
                  }} />
                  <div style={{ fontSize: 28, marginBottom: 10, color: T.sage }}>⬆</div>
                  <div style={{ fontSize: 12, fontFamily: fonts.sans, color: T.w5, marginBottom: 4 }}>{maternalUploading ? "Parsing with Claude AI…" : "Upload maternal ALCAT PDF or image"}</div>
                  <div style={{ fontSize: 10, fontFamily: fonts.mono, color: T.w4, letterSpacing: "0.12em" }}>DRAG & DROP OR CLICK</div>
                </label>
              </Panel>
            ) : (
              <div>
                <div style={{ background: `${T.ok}0F`, border: `1px solid ${T.ok}30`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, color: T.ok, fontFamily: fonts.sans, fontWeight: 500 }}>✓ Maternal ALCAT loaded</div>
                    <div style={{ fontSize: 11, fontFamily: fonts.mono, color: T.w4 }}>{maternalAlcat.name} · {maternalAlcat.severe?.length} severe · {maternalAlcat.moderate?.length} moderate · {maternalAlcat.mild?.length} mild</div>
                  </div>
                  <button onClick={() => setMaternalAlcat(null)} style={{ background: T.w1, border: `1px solid ${T.w3}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 10, fontFamily: fonts.mono, color: T.w5 }}>RESET</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "SEVERE — ELIMINATE", color: T.err, foods: maternalAlcat.severe || [] },
                    { label: "MODERATE — ELIMINATE", color: T.warn, foods: maternalAlcat.moderate || [] },
                    { label: "MILD — ROTATE", color: T.ok, foods: maternalAlcat.mild || [] },
                  ].map(({ label, color, foods }) => (
                    <div key={label} style={{ background: T.w, border: `1px solid ${T.w3}`, borderLeft: `3px solid ${color}`, borderRadius: 9, padding: "14px 16px" }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: 8, letterSpacing: "0.16em", color, marginBottom: 8 }}>{label} ({foods.length})</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, maxHeight: 120, overflowY: "auto" }}>
                        {foods.map(f => {
                          const mercury = HIGH_MERCURY_FISH.includes(f);
                          return (
                            <span key={f} style={{ background: mercury ? `${T.err}20` : `${color}12`, border: `1px solid ${mercury ? T.err : color}30`, borderRadius: 3, padding: "2px 6px", fontSize: 9, fontFamily: fonts.sans, color: mercury ? T.err : T.w5 }}>
                              {f}{mercury ? " ⚠" : ""}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mercury overlap warning */}
                {[...(maternalAlcat.severe || []), ...(maternalAlcat.moderate || []), ...(maternalAlcat.mild || [])].some(f => HIGH_MERCURY_FISH.includes(f)) && (
                  <Warning color={T.err}>
                    <strong>⚠ High mercury fish in your ALCAT list.</strong> Some flagged foods are also high-mercury species. These must be avoided during pregnancy regardless of ALCAT status. Items marked ⚠ above.
                  </Warning>
                )}

                {maternalAlcat.candida && (
                  <Warning color={T.warn}>
                    <strong>Candida moderate detected.</strong> During pregnancy, Candida overgrowth is common and can colonise the birth canal. Continue strict yeast/sugar avoidance. Consider Lactobacillus rhamnosus supplementation throughout pregnancy.
                  </Warning>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MARIO CHAT ── */}
        {tab === "mario" && (
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.2em", color: T.sage, marginBottom: 12 }}>PRENATAL AI CONSULTATION</div>
            <div style={{ fontFamily: fonts.serif, fontSize: 36, fontWeight: 400, color: T.w7, letterSpacing: "-0.01em", marginBottom: 8 }}>
              Ask <em style={{ color: T.sage, fontStyle: "italic" }}>Mario</em>
            </div>
            <p style={{ fontSize: 13, color: T.w5, lineHeight: 1.7, marginBottom: 8, maxWidth: 520 }}>
              Mario reasons from your ALCAT, your genetic variants, and trimester-specific nutritional needs simultaneously. Load your data in the other tabs first for the most precise answers.
            </p>

            {/* Active context */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {[
                { label: "ALCAT", active: !!maternalAlcat },
                { label: "GENETICS", active: Object.values(partnerA.variants).some(Boolean) },
                { label: "TRIMESTER", active: true },
                { label: "COMPATIBILITY", active: !!compatibility },
              ].map(({ label, active }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, background: active ? T.sageBg : T.w1, border: `1px solid ${active ? T.sage : T.w3}`, borderRadius: 6, padding: "4px 10px" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: active ? T.sage : T.w3 }} />
                  <span style={{ fontSize: 9, fontFamily: fonts.mono, letterSpacing: "0.1em", color: active ? T.sage : T.w4 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Trimester selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontFamily: fonts.sans, color: T.w4, alignSelf: "center", marginRight: 4 }}>Trimester:</span>
              {TRIMESTER_PROTOCOL.map((p, i) => (
                <button key={i} onClick={() => setTrimester(i)} style={{ background: trimester === i ? p.color : T.w1, border: `1px solid ${trimester === i ? p.color : T.w3}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 10, fontFamily: fonts.mono, color: trimester === i ? "#fff" : T.w5 }}>
                  {p.icon} {p.trimester}
                </button>
              ))}
            </div>

            {/* Chat */}
            <div style={{ background: T.w1, border: `1px solid ${T.w3}`, borderRadius: 12, padding: 20, minHeight: 300, maxHeight: 400, overflowY: "auto", marginBottom: 12 }}>
              {chatHistory.length === 0 && (
                <div style={{ fontSize: 13, fontFamily: fonts.sans, color: T.w4, fontStyle: "italic", textAlign: "center", marginTop: 80 }}>
                  Load your ALCAT and genetic variants, then ask Mario anything about your pregnancy nutrition.
                </div>
              )}
              {chatHistory.map((m, i) => (
                <div key={i} style={{ marginBottom: 16, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "78%", padding: "12px 16px", borderRadius: 10,
                    background: m.role === "user" ? T.sage : T.w,
                    border: m.role === "user" ? "none" : `1px solid ${T.w3}`,
                    fontSize: 13, fontFamily: fonts.sans, color: m.role === "user" ? "#fff" : T.w6, lineHeight: 1.7,
                  }}>{m.content}</div>
                </div>
              ))}
              {marioLoading && (
                <div style={{ fontSize: 12, fontFamily: fonts.mono, color: T.w4, letterSpacing: "0.1em" }}>Mario is thinking…</div>
              )}
            </div>

            {/* Suggested questions */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {[
                "What should I eat for breakfast this trimester?",
                "Is my MTHFR variant dangerous for my baby?",
                "Which fish can I eat safely?",
                "What supplements are most critical right now?",
                "How does my ALCAT affect the baby?",
              ].map(q => (
                <button key={q} onClick={() => setMarioMsg(q)} style={{ background: T.w1, border: `1px solid ${T.w3}`, borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontFamily: fonts.sans, color: T.w5 }}>{q}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <input value={marioMsg} onChange={e => setMarioMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMario()}
                placeholder="Ask Mario about your pregnancy nutrition…"
                style={{ flex: 1, background: T.w, border: `1px solid ${T.w3}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, fontFamily: fonts.sans, color: T.w6, outline: "none" }} />
              <button onClick={sendMario} disabled={marioLoading || !marioMsg.trim()} style={{ background: marioLoading ? T.w3 : T.sage, color: "#fff", borderRadius: 8, padding: "10px 24px", border: "none", cursor: marioLoading ? "default" : "pointer", fontSize: 12, fontFamily: fonts.sans, fontWeight: 500 }}>
                {marioLoading ? "…" : "Send"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
