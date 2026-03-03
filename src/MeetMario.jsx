import { useState, useRef, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS — Warm Scandinavian ────────────────────────────────────────
const S = {
  bg:          "#FAF8F4",
  bgDeep:      "#F2EDE5",
  bgDark:      "#1C1814",
  card:        "#FFFFFF",
  cardWarm:    "#FDFAF6",
  border:      "#E8E0D4",
  borderStrong:"#C8B89A",
  ink:         "#1A1410",
  inkMid:      "#6B5E52",
  inkDim:      "#A89880",
  gold:        "#9A7240",
  goldLight:   "#C4A06A",
  goldBg:      "#FDF6EC",
  goldDark:    "#6A4E28",
  sage:        "#5A7A58",
  sageBg:      "#F0F5EF",
  sageDark:    "#3A5A38",
  rust:        "#B05030",
  rustBg:      "#FDF1EE",
  amber:       "#C47820",
  amberBg:     "#FDF5E8",
  sand:        "#B09030",
  sandBg:      "#FDFAF0",
  teal:        "#3A7A7A",
  tealBg:      "#EEF5F5",
  severe:      "#B05030",
  moderate:    "#C47820",
  mild:        "#B09030",
  serif:       "'Playfair Display','Georgia',serif",
  sans:        "'Lato','Helvetica Neue',sans-serif",
  mono:        "'IBM Plex Mono','Courier New',monospace",
  shadowSm:    "0 1px 4px rgba(100,80,50,0.08)",
  shadowMd:    "0 4px 16px rgba(100,80,50,0.10)",
  shadowLg:    "0 8px 32px rgba(100,80,50,0.12)",
};
const FX = "flex", CP = "pointer";

// ─── CLINICAL FLAGS ───────────────────────────────────────────────────────────
const CLINICAL_FLAGS = {
  SEED_OILS: {
    items: ["Canola Oil","Sunflower Oil","Safflower Oil","Soybean Oil","Corn Oil","Grapeseed Oil","Margarine","Vegetable Oil"],
    reason: "High omega-6 PUFA — membrane disruption, oxidative stress, systemic inflammation",
  },
  OATS: {
    items: ["Oat (GF)","Oat (Regular)","Rolled Oats"],
    reason: "Avenin cross-reactivity; contamination risk in standard mills",
  },
  LEGUMES: {
    items: ["Soybean","Chickpea","Lentil Bean","Pinto Bean","Kidney Bean","Black Beans","Lima Bean","Navy Bean","Cannellini Beans"],
    reason: "Lectins and phytates impair mineral absorption and gut permeability",
  },
};

// ─── ALCAT POPULATION DATA (1,042 real patient reports) ──────────────────────
const ALCAT_DATA = {
  "Baker's Yeast":    { r: 0.659, cat: "yeast" },
  "Brewer's Yeast":   { r: 0.515, cat: "yeast" },
  "Mushroom":         { r: 0.341, cat: "yeast" },
  "Buckwheat":        { r: 0.492, cat: "gluten" },
  "Wheat / Gluten":   { r: 0.201, cat: "gluten" },
  "Allulose":         { r: 0.745, cat: "sugar" },
  "Agave":            { r: 0.733, cat: "sugar" },
  "Sugar":            { r: 0.595, cat: "sugar" },
  "Egg":              { r: 0.686, cat: "egg" },
  "Egg Yolk":         { r: 0.685, cat: "egg" },
  "Egg White":        { r: 0.431, cat: "egg" },
  "Eggplant":         { r: 0.392, cat: "egg" },
  "Adzuki Bean":      { r: 0.650, cat: "legume" },
  "Chickpea":         { r: 0.473, cat: "legume" },
  "Soybean":          { r: 0.460, cat: "legume" },
  "Lentil":           { r: 0.384, cat: "legume" },
  "Cacao":            { r: 0.566, cat: "stimulant" },
  "Cocoa":            { r: 0.515, cat: "stimulant" },
  "Tea":              { r: 0.461, cat: "stimulant" },
  "Coffee":           { r: 0.395, cat: "stimulant" },
  "Pepper":           { r: 0.417, cat: "nightshade" },
  "Paprika":          { r: 0.416, cat: "nightshade" },
  "Tomato":           { r: 0.325, cat: "nightshade" },
  "Potato":           { r: 0.200, cat: "nightshade" },
  "Amaranth":         { r: 0.767, cat: "grain" },
  "Corn":             { r: 0.507, cat: "grain" },
  "Rice":             { r: 0.420, cat: "grain" },
  "Quinoa":           { r: 0.379, cat: "grain" },
  "Millet":           { r: 0.341, cat: "grain" },
  "Oat":              { r: 0.255, cat: "grain" },
  "Brazil Nut":       { r: 0.813, cat: "nut" },
  "Macadamia":        { r: 0.687, cat: "nut" },
  "Hazelnut":         { r: 0.679, cat: "nut" },
  "Almond":           { r: 0.677, cat: "nut" },
  "Cashew":           { r: 0.480, cat: "nut" },
  "Flaxseed":         { r: 0.452, cat: "seed" },
  "Chia":             { r: 0.423, cat: "seed" },
  "Canola Oil":       { r: 0.598, cat: "seed_oil" },
  "Beef":             { r: 0.726, cat: "meat" },
  "Duck":             { r: 0.695, cat: "meat" },
  "Bison":            { r: 0.537, cat: "meat" },
  "Chicken":          { r: 0.375, cat: "meat" },
  "Pork":             { r: 0.373, cat: "meat" },
  "Turkey":           { r: 0.372, cat: "meat" },
  "Venison":          { r: 0.343, cat: "meat" },
  "Lamb":             { r: 0.341, cat: "meat" },
  "Catfish":          { r: 0.572, cat: "fish" },
  "Oyster":           { r: 0.556, cat: "fish" },
  "Tilapia":          { r: 0.506, cat: "fish" },
  "Trout":            { r: 0.468, cat: "fish" },
  "Shrimp":           { r: 0.420, cat: "fish" },
  "Scallop":          { r: 0.416, cat: "fish" },
  "Salmon":           { r: 0.400, cat: "fish" },
  "Mackerel":         { r: 0.389, cat: "fish" },
  "Codfish":          { r: 0.386, cat: "fish" },
  "Sole":             { r: 0.383, cat: "fish" },
  "Halibut":          { r: 0.358, cat: "fish" },
  "Sardine":          { r: 0.338, cat: "fish" },
  "Crab":             { r: 0.330, cat: "fish" },
  "Tuna":             { r: 0.303, cat: "fish" },
  "Apple":            { r: 0.744, cat: "fruit" },
  "Pineapple":        { r: 0.691, cat: "fruit" },
  "Avocado":          { r: 0.570, cat: "fruit" },
  "Blueberry":        { r: 0.477, cat: "fruit" },
  "Banana":           { r: 0.458, cat: "fruit" },
  "Cherry":           { r: 0.453, cat: "fruit" },
  "Grape":            { r: 0.392, cat: "fruit" },
  "Raspberry":        { r: 0.379, cat: "fruit" },
  "Strawberry":       { r: 0.375, cat: "fruit" },
  "Pear":             { r: 0.358, cat: "fruit" },
  "Mango":            { r: 0.337, cat: "fruit" },
  "Peach":            { r: 0.310, cat: "fruit" },
  "Lime":             { r: 0.431, cat: "citrus" },
  "Grapefruit":       { r: 0.400, cat: "citrus" },
  "Orange":           { r: 0.352, cat: "citrus" },
  "Lemon":            { r: 0.352, cat: "citrus" },
  "Arrowroot":        { r: 0.673, cat: "vegetable" },
  "Artichoke":        { r: 0.552, cat: "vegetable" },
  "Asparagus":        { r: 0.528, cat: "vegetable" },
  "Broccoli":         { r: 0.492, cat: "vegetable" },
  "Zucchini":         { r: 0.456, cat: "vegetable" },
  "Celery":           { r: 0.427, cat: "vegetable" },
  "Carrot":           { r: 0.410, cat: "vegetable" },
  "Kale":             { r: 0.395, cat: "vegetable" },
  "Spinach":          { r: 0.362, cat: "vegetable" },
  "Butternut Squash": { r: 0.355, cat: "vegetable" },
  "Cucumber":         { r: 0.353, cat: "vegetable" },
  "Pumpkin":          { r: 0.307, cat: "vegetable" },
  "Beet":             { r: 0.264, cat: "vegetable" },
  "Coriander":        { r: 0.608, cat: "herb" },
  "Bay Leaf":         { r: 0.572, cat: "herb" },
  "Sage":             { r: 0.484, cat: "herb" },
  "Ginger":           { r: 0.411, cat: "herb" },
  "Turmeric":         { r: 0.393, cat: "herb" },
  "Onion":            { r: 0.350, cat: "herb" },
  "Thyme":            { r: 0.349, cat: "herb" },
  "Parsley":          { r: 0.339, cat: "herb" },
  "Black Pepper":     { r: 0.755, cat: "spice" },
  "Cayenne":          { r: 0.572, cat: "spice" },
  "Clove":            { r: 0.529, cat: "spice" },
  "Cumin":            { r: 0.511, cat: "spice" },
  "Cinnamon":         { r: 0.369, cat: "spice" },
};

const SYMPTOM_WEIGHTS = {
  bloating:    { yeast: 2.0, gluten: 1.8, dairy: 1.7, sugar: 1.6 },
  gi_pain:     { gluten: 2.0, dairy: 1.8, nightshade: 1.5, yeast: 1.6 },
  fatigue:     { gluten: 1.8, yeast: 2.0, dairy: 1.5, sugar: 1.7 },
  brain_fog:   { gluten: 2.0, dairy: 1.6, sugar: 1.8, yeast: 1.5 },
  skin:        { dairy: 2.0, gluten: 1.7, egg: 1.8, nightshade: 1.6 },
  joint_pain:  { nightshade: 1.8, gluten: 1.7, dairy: 1.6 },
  sleep:       { sugar: 1.8, stimulant: 2.0, yeast: 1.5 },
  headaches:   { dairy: 1.6, citrus: 1.8, gluten: 1.5, stimulant: 1.7 },
  weight:      { sugar: 2.0, gluten: 1.7, dairy: 1.6 },
  anxiety:     { stimulant: 2.0, sugar: 1.7, gluten: 1.6 },
  acne:        { dairy: 2.0, sugar: 1.8, gluten: 1.5 },
  eczema:      { dairy: 1.9, egg: 1.9, gluten: 1.6, nightshade: 1.5 },
  sinusitis:   { dairy: 2.0, gluten: 1.6, yeast: 1.5 },
};

function computeProtocol(formData) {
  const symptoms = [...(formData.symptoms || []), ...(formData.gi_symptoms || [])];
  const diet = formData.diet_patterns || [];
  const catRisk = {};
  symptoms.forEach(sym => {
    const w = SYMPTOM_WEIGHTS[sym] || {};
    Object.entries(w).forEach(([cat, v]) => { catRisk[cat] = (catRisk[cat] || 1.0) * v; });
  });
  diet.forEach(cat => { catRisk[cat] = (catRisk[cat] || 1.0) * 1.3; });
  if ((formData.medications || []).includes("antibiotics_recent")) catRisk.yeast = (catRisk.yeast || 1.0) * 1.8;
  (formData.cravings || []).forEach(crav => {
    const map = { bread: "gluten", cheese: "dairy", sugar_sweets: "sugar", coffee: "stimulant", alcohol: "yeast" };
    if (map[crav]) catRisk[map[crav]] = (catRisk[map[crav]] || 1.0) * 1.4;
  });
  const scored = Object.entries(ALCAT_DATA).map(([name, d]) => {
    const mult = catRisk[d.cat] || 1.0;
    return { name, adjusted: Math.min(d.r * mult, 1.0), base: d.r, cat: d.cat };
  }).sort((a, b) => b.adjusted - a.adjusted);
  const alcat_avoid = scored.filter(f => f.adjusted >= 0.18 && f.cat !== "seed_oil");
  const clinical_avoid = [
    ...CLINICAL_FLAGS.SEED_OILS.items.map(name => ({ name, adjusted: 1.0, cat: "seed_oil", reason: CLINICAL_FLAGS.SEED_OILS.reason, label: "SEED OIL", labelColor: S.rust })),
    ...CLINICAL_FLAGS.OATS.items.map(name => ({ name, adjusted: 0.72, cat: "grain", reason: CLINICAL_FLAGS.OATS.reason, label: "FLAGGED", labelColor: S.amber })),
    ...CLINICAL_FLAGS.LEGUMES.items.map(name => ({ name, adjusted: 0.65, cat: "legume", reason: CLINICAL_FLAGS.LEGUMES.reason, label: "LECTIN", labelColor: S.amber })),
  ];
  const avoid = [...alcat_avoid, ...clinical_avoid];
  const avoidNames = new Set(avoid.map(f => f.name));
  const safe = scored.filter(f => f.adjusted < 0.10 && f.cat !== "seed_oil" && !avoidNames.has(f.name));
  const safeByCategory = {};
  safe.forEach(f => {
    if (!safeByCategory[f.cat]) safeByCategory[f.cat] = [];
    safeByCategory[f.cat].push(f.name);
  });
  safeByCategory["fat"] = ["Extra Virgin Olive Oil", "Coconut Oil", "Avocado Oil", "Ghee", "Tallow"];
  const topCats = Object.entries(catRisk).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
  const profileMap = {
    "gluten,yeast": "Leaky Gut / Dysbiotic", "yeast,gluten": "Leaky Gut / Dysbiotic",
    "dairy,egg": "Classic Immune-Reactive", "egg,dairy": "Classic Immune-Reactive",
    "sugar,yeast": "Candida-Driven Dysbiosis", "yeast,sugar": "Candida-Driven Dysbiosis",
    "nightshade,dairy": "Musculoskeletal Inflammatory",
    "stimulant,sugar": "Neurometabolic Burnout",
  };
  const profile = profileMap[topCats.join(",")] || "Mixed Inflammatory";
  const symptomCount = symptoms.length;
  const hasTested = (formData.previous_testing || []).length > 0;
  const leadScore = Math.min(100, symptomCount * 8 + (formData.severity_avg || 3) * 6 + (hasTested ? -10 : 15) + (formData.readiness || 3) * 5);
  return { avoid, safe, safeByCategory, profile, topCats, scored, leadScore, symptomCount, formData };
}

// ─── ROTATION DATA ─────────────────────────────────────────────────────────────
const ROT = {
  1: { grains:["Arrowroot","Tapioca","White potato"], veg:["Butternut squash","Carrot","Kale","Leaf lettuce","Rutabaga"], fruit:["Banana","Kiwi","Lemon","Mango","Papaya"], protein:["Codfish","Crab","Lamb","Sardine","Snapper"], misc:["Coriander seed","Flaxseed","Parsley","Rosemary","Turmeric"] },
  2: { grains:["Millet","Wild rice"], veg:["Bok choy","Button mushroom","Zucchini"], fruit:["Blueberry","Dragon fruit","Pear","Tangerine"], protein:["Chicken","Egg yolk","Mackerel","Tuna"], misc:["Cinnamon","Ginger","Hazelnut","Mustard seed","Saffron"] },
  3: { grains:["Corn","Quinoa","Sweet potato"], veg:["Asparagus","Collard greens","Green pea","Leek","Radish","String bean","Watercress"], fruit:["Apricot","Blackberry","Cherry","Nectarine","Raspberry"], protein:["Duck","Grouper","Halibut","Pork","Sole"], misc:["Cocoa","Dill","Macadamia","Oregano","Pine nut","Thyme","Vanilla"] },
  4: { grains:["Buckwheat","Teff"], veg:["Dandelion leaf","Portobello mushroom","Red beet","Spinach","Turnip","Water chestnut"], fruit:["Cantaloupe","Grapefruit","Orange","Watermelon"], protein:["Haddock","Mussel","Salmon","Scallop","Shrimp","Trout","Turkey","Venison"], misc:["Black pepper","Nutmeg","Pecan","Walnut"] },
};

const CUISINES = [
  { id: "mediterranean", label: "Mediterranean", flag: "🫒", desc: "Olive oil, herbs, fish" },
  { id: "french",        label: "French",         flag: "🇫🇷", desc: "Bistro — duck, root veg" },
  { id: "swedish",       label: "Swedish",        flag: "🇸🇪", desc: "Nordic fish, forest herbs" },
  { id: "japanese",      label: "Japanese",       flag: "🇯🇵", desc: "Clean minimal, fish" },
  { id: "middle_eastern",label: "Middle Eastern", flag: "🌿", desc: "Spiced meats, herbs" },
  { id: "scandinavian",  label: "Scandinavian",   flag: "🐟", desc: "Cured fish, foraged" },
];

async function callClaude(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
  });
  const d = await res.json();
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}

// ─── BIOMETRIC SIMULATION ─────────────────────────────────────────────────────
function simulateMealResponse(hadReactive) {
  const pts = [];
  for (let m = 0; m <= 120; m += 3) {
    const t = m / 120;
    const curve = t < 0.3 ? t / 0.3 : t < 0.6 ? 1 : Math.max(0, (1 - t) / 0.4);
    const rx = hadReactive ? 2.2 + Math.random() * 0.6 : 1;
    const n = () => (Math.random() - 0.5);
    pts.push({ min: m, hr: Math.round(68 + 14 * rx * curve + n() * 2), hrv: Math.round(55 - (hadReactive ? 22 : 6) * curve + n() * 2), temp: +((36.5 + (hadReactive ? 0.6 : 0.08) * curve + n() * 0.03)).toFixed(2), glucose: Math.round(82 + (hadReactive ? 58 : 22) * curve + n() * 3), spo2: +((98 - (hadReactive ? 1.8 : 0.2) * curve + n() * 0.1)).toFixed(1) });
  }
  return pts;
}
function detectSpikes(pts) {
  if (!pts || pts.length < 4) return [];
  const b = pts[0]; const spikes = [];
  pts.forEach((p, i) => {
    if (i < 3) return;
    if (p.hr - b.hr >= 22 && !spikes.find(s => s.m === "hr")) spikes.push({ min: p.min, m: "hr", label: "Heart Rate spike", val: `+${p.hr - b.hr} bpm`, level: p.hr - b.hr >= 32 ? "severe" : "moderate" });
    if (b.hrv - p.hrv >= 18 && !spikes.find(s => s.m === "hrv")) spikes.push({ min: p.min, m: "hrv", label: "HRV drop", val: `-${b.hrv - p.hrv} ms`, level: b.hrv - p.hrv >= 28 ? "severe" : "moderate" });
    if (p.temp - b.temp >= 0.45 && !spikes.find(s => s.m === "temp")) spikes.push({ min: p.min, m: "temp", label: "Temperature rise", val: `+${(p.temp - b.temp).toFixed(2)}°C`, level: p.temp - b.temp >= 0.65 ? "severe" : "moderate" });
    if (p.glucose - b.glucose >= 38 && !spikes.find(s => s.m === "glucose")) spikes.push({ min: p.min, m: "glucose", label: "Glucose spike", val: `+${p.glucose - b.glucose} mg/dL`, level: p.glucose - b.glucose >= 55 ? "severe" : "moderate" });
  });
  return spikes;
}

const SYMPTOM_CATS = {
  digestive: { label: "Digestive",    icon: "🫁", items: ["Bloating", "Cramping", "Nausea", "Gas", "Reflux", "Loose stools", "Stomach pain"] },
  skin:      { label: "Skin",         icon: "🌡️", items: ["Flushing", "Itching", "Rash", "Hives", "Puffiness"] },
  neuro:     { label: "Neurological", icon: "🧠", items: ["Brain fog", "Headache", "Dizziness", "Fatigue spike", "Mood drop", "Anxiety"] },
  joints:    { label: "Joints",       icon: "🦴", items: ["Joint stiffness", "Muscle aches", "Back pain", "Swollen fingers"] },
};

// ─── SHARED STYLE ─────────────────────────────────────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lato:wght@300;400;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${S.bg};}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:${S.bgDeep};}
  ::-webkit-scrollbar-thumb{background:${S.borderStrong};border-radius:2px;}
  input::placeholder,textarea::placeholder{color:${S.inkDim};}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes glow{0%,100%{box-shadow:0 0 0 0 ${S.gold}30}50%{box-shadow:0 0 0 8px ${S.gold}10}}
  @keyframes mm-pulse{0%,100%{opacity:0.3;transform:scale(0.85)}50%{opacity:1;transform:scale(1.15)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
`;

// ─── ONBOARDING COMPONENTS ─────────────────────────────────────────────────────
function Chips({ options, selected, onToggle, color = S.gold }) {
  return (
    <div style={{ display: FX, flexWrap: "wrap", gap: 8 }}>
      {options.map(o => {
        const active = selected?.includes(o.value ?? o);
        const val = o.value ?? o; const lbl = o.label ?? o;
        return (
          <div key={val} onClick={() => onToggle(val)} style={{
            padding: "8px 16px", borderRadius: 24,
            border: `1.5px solid ${active ? color : S.border}`,
            background: active ? color + "12" : S.card,
            color: active ? color : S.inkMid,
            fontSize: 13, fontFamily: S.sans, cursor: CP,
            transition: "all 0.15s", userSelect: "none",
            boxShadow: active ? `0 0 0 3px ${color}18` : S.shadowSm,
            fontWeight: active ? 700 : 400,
          }}>{lbl}</div>
        );
      })}
    </div>
  );
}

function ScaleQ({ value, onChange, min = 1, max = 10, labels }) {
  return (
    <div>
      <div style={{ display: FX, gap: 4, marginBottom: 10 }}>
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
          <button key={n} onClick={() => onChange(n)} style={{
            flex: 1, padding: "10px 4px", borderRadius: 8,
            border: `1.5px solid ${value === n ? S.gold : S.border}`,
            background: value === n ? S.goldBg : S.card,
            color: value === n ? S.gold : S.inkMid,
            fontSize: 13, fontWeight: value === n ? 700 : 400,
            fontFamily: S.mono, cursor: CP, transition: "all 0.15s",
            boxShadow: value === n ? `0 0 0 3px ${S.gold}20` : "none",
          }}>{n}</button>
        ))}
      </div>
      {labels && <div style={{ display: FX, justifyContent: "space-between" }}>
        {labels.map((l, i) => <span key={i} style={{ fontSize: 10, color: S.inkDim, fontFamily: S.mono }}>{l}</span>)}
      </div>}
    </div>
  );
}

function SelectQ({ options, value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <div key={o.value} onClick={() => onChange(o.value)} style={{
            padding: "12px 14px", borderRadius: 10,
            border: `1.5px solid ${active ? S.gold : S.border}`,
            background: active ? S.goldBg : S.card,
            cursor: CP, transition: "all 0.15s",
            boxShadow: active ? `0 0 0 3px ${S.gold}18` : S.shadowSm,
          }}>
            <div style={{ fontSize: 13, color: active ? S.gold : S.ink, fontWeight: active ? 700 : 400, fontFamily: S.sans, marginBottom: 2 }}>{o.label}</div>
            {o.sub && <div style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>{o.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}

function QBlock({ label, sub, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.ink, fontFamily: S.sans, marginBottom: sub ? 4 : 10 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: S.inkMid, fontFamily: S.mono, marginBottom: 10 }}>{sub}</div>}
      {children}
    </div>
  );
}

function SecHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, fontFamily: S.mono, color: S.gold, letterSpacing: "0.15em", marginBottom: 8 }}>{icon} {title.toUpperCase()}</div>
      {subtitle && <div style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.ink, lineHeight: 1.2, fontStyle: "italic" }}>{subtitle}</div>}
    </div>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "identity",  label: "About you",      icon: "○" },
  { id: "symptoms",  label: "Symptoms",        icon: "○" },
  { id: "gut",       label: "Gut health",      icon: "○" },
  { id: "sleep",     label: "Sleep & Energy",  icon: "○" },
  { id: "diet",      label: "Diet & Cravings", icon: "○" },
  { id: "medical",   label: "Medical history", icon: "○" },
  { id: "goals",     label: "Your goals",      icon: "○" },
];

function renderSection(id, data, u, t) {
  const map = {
    identity: (
      <>
        <SecHeader icon="—" title="About you" subtitle="Let us understand who we are working with." />
        <QBlock label="First name (optional)">
          <input type="text" placeholder="Your first name" value={data.firstName || ""} onChange={e => u("firstName", e.target.value)}
            style={{ width: "100%", background: S.card, border: `1.5px solid ${data.firstName ? S.gold : S.border}`, borderRadius: 10, padding: "11px 14px", color: S.ink, fontSize: 14, fontFamily: S.sans, outline: "none", boxShadow: S.shadowSm }} />
        </QBlock>
        <QBlock label="Age range">
          <Chips options={["Under 25","25–34","35–44","45–54","55–64","65+"]} selected={data.age ? [data.age] : []} onToggle={v => u("age", v)} />
        </QBlock>
        <QBlock label="Biological sex">
          <Chips options={[{value:"female",label:"Female"},{value:"male",label:"Male"},{value:"other",label:"Other"}]} selected={data.sex ? [data.sex] : []} onToggle={v => u("sex", v)} />
        </QBlock>
        <QBlock label="Country of residence">
          <Chips options={["Sweden","Norway","Denmark","Finland","Germany","UK","Netherlands","Other"]} selected={data.country ? [data.country] : []} onToggle={v => u("country", v)} />
        </QBlock>
      </>
    ),
    symptoms: (
      <>
        <SecHeader icon="—" title="Symptoms" subtitle="What is your body trying to tell you?" />
        <QBlock label="Which symptoms do you experience regularly?">
          <Chips color={S.rust} options={[
            {value:"bloating",label:"Bloating"},{value:"gi_pain",label:"GI pain"},
            {value:"fatigue",label:"Fatigue"},{value:"brain_fog",label:"Brain fog"},
            {value:"skin",label:"Skin issues"},{value:"joint_pain",label:"Joint pain"},
            {value:"sleep",label:"Poor sleep"},{value:"headaches",label:"Headaches"},
            {value:"weight",label:"Unexplained weight"},{value:"anxiety",label:"Anxiety"},
            {value:"acne",label:"Acne"},{value:"eczema",label:"Eczema"},
            {value:"sinusitis",label:"Sinusitis"},
          ]} selected={data.symptoms || []} onToggle={v => t("symptoms", v)} />
        </QBlock>
        <QBlock label="Average severity (1 = minimal, 10 = debilitating)">
          <ScaleQ value={data.severity_avg} onChange={v => u("severity_avg", v)} labels={["Minimal", "Moderate", "Debilitating"]} />
        </QBlock>
        <QBlock label="How long have you had these symptoms?">
          <SelectQ options={[
            {value:"under1m",label:"Under 1 month",sub:"Recent onset"},
            {value:"1_6m",label:"1–6 months",sub:"Subacute"},
            {value:"6_12m",label:"6–12 months",sub:"Persistent"},
            {value:"1_3y",label:"1–3 years",sub:"Chronic"},
            {value:"3plus",label:"3+ years",sub:"Long-standing"},
          ]} value={data.symptom_duration} onChange={v => u("symptom_duration", v)} />
        </QBlock>
      </>
    ),
    gut: (
      <>
        <SecHeader icon="—" title="Gut health" subtitle="The gut is where immune responses begin." />
        <QBlock label="GI symptoms (select all that apply)">
          <Chips color={S.amber} options={[
            {value:"bloating",label:"Bloating"},{value:"gas",label:"Gas"},
            {value:"constipation",label:"Constipation"},{value:"diarrhea",label:"Diarrhea"},
            {value:"reflux",label:"Reflux / heartburn"},{value:"nausea",label:"Nausea"},
            {value:"stomach_pain",label:"Stomach pain"},{value:"none",label:"None of these"},
          ]} selected={data.gi_symptoms || []} onToggle={v => t("gi_symptoms", v)} />
        </QBlock>
        <QBlock label="Any diagnosed gut conditions?">
          <Chips color={S.amber} options={[
            {value:"ibs",label:"IBS"},{value:"ibd",label:"IBD / Crohn's"},
            {value:"sibo",label:"SIBO"},{value:"candida",label:"Candida overgrowth"},
            {value:"celiac",label:"Coeliac"},{value:"none",label:"No diagnosis"},
          ]} selected={data.gut_diagnoses || []} onToggle={v => t("gut_diagnoses", v)} />
        </QBlock>
      </>
    ),
    sleep: (
      <>
        <SecHeader icon="—" title="Sleep & Energy" subtitle="Cellular recovery happens at night." />
        <QBlock label="Average sleep per night">
          <Chips options={["Under 5h","5–6h","6–7h","7–8h","8–9h","9h+"]} selected={data.sleep_hours ? [data.sleep_hours] : []} onToggle={v => u("sleep_hours", v)} />
        </QBlock>
        <QBlock label="Sleep quality (1 = very poor, 10 = excellent)">
          <ScaleQ value={data.sleep_quality} onChange={v => u("sleep_quality", v)} labels={["Very poor", "Average", "Excellent"]} />
        </QBlock>
        <QBlock label="Energy pattern during the day">
          <SelectQ options={[
            {value:"stable_high",label:"Stable & high",sub:"Consistent throughout"},
            {value:"morning_better",label:"Morning better",sub:"Fades by afternoon"},
            {value:"afternoon_crash",label:"Afternoon crash",sub:"Typical 2–4pm dip"},
            {value:"low_all_day",label:"Low all day",sub:"Fatigue from waking"},
          ]} value={data.energy_pattern} onChange={v => u("energy_pattern", v)} />
        </QBlock>
      </>
    ),
    diet: (
      <>
        <SecHeader icon="—" title="Diet & Cravings" subtitle="Food patterns reveal immune vulnerabilities." />
        <QBlock label="Current dietary pattern">
          <Chips options={[
            {value:"omnivore",label:"Omnivore"},{value:"pescatarian",label:"Pescatarian"},
            {value:"vegetarian",label:"Vegetarian"},{value:"vegan",label:"Vegan"},
            {value:"keto",label:"Keto"},{value:"paleo",label:"Paleo"},
          ]} selected={data.dietary_pattern ? [data.dietary_pattern] : []} onToggle={v => u("dietary_pattern", v)} />
        </QBlock>
        <QBlock label="Which food groups do you eat daily?">
          <Chips color={S.teal} options={[
            {value:"gluten",label:"Gluten / wheat"},{value:"dairy",label:"Dairy"},
            {value:"egg",label:"Eggs"},{value:"sugar",label:"Sugar"},
            {value:"yeast",label:"Bread / fermented"},{value:"nightshade",label:"Nightshades"},
            {value:"legume",label:"Legumes"},{value:"stimulant",label:"Coffee / cacao"},
          ]} selected={data.diet_patterns || []} onToggle={v => t("diet_patterns", v)} />
        </QBlock>
        <QBlock label="Strong cravings (select all that apply)">
          <Chips color={S.teal} options={[
            {value:"bread",label:"Bread / pasta"},{value:"cheese",label:"Cheese"},
            {value:"sugar_sweets",label:"Sugar / sweets"},{value:"coffee",label:"Coffee"},
            {value:"alcohol",label:"Alcohol"},{value:"dairy_other",label:"Milk / yoghurt"},
          ]} selected={data.cravings || []} onToggle={v => t("cravings", v)} />
        </QBlock>
      </>
    ),
    medical: (
      <>
        <SecHeader icon="—" title="Medical history" subtitle="Diagnoses and medications shape the protocol." />

        {/* ── Diagnoses ── */}
        <QBlock label="Existing diagnoses">
          <Chips color="#9B60C0" options={[
            {value:"autoimmune",label:"Autoimmune"},{value:"hypothyroid",label:"Hypothyroidism"},
            {value:"fibromyalgia",label:"Fibromyalgia"},{value:"chronic_fatigue",label:"CFS / ME"},
            {value:"pcos",label:"PCOS"},{value:"psoriasis",label:"Psoriasis"},
            {value:"adhd",label:"ADHD"},{value:"type2_diabetes",label:"Type 2 diabetes"},
            {value:"ibd",label:"IBD / Crohn's"},{value:"endometriosis",label:"Endometriosis"},
            {value:"none",label:"No diagnoses"},
          ]} selected={data.diagnoses || []} onToggle={v => t("diagnoses", v)} />
          <input
            placeholder="Other diagnosis — type here"
            value={data.diagnoses_other || ""}
            onChange={e => u("diagnoses_other", e.target.value)}
            style={{ marginTop: 10, width: "100%", background: S.card, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "9px 12px", color: S.ink, fontSize: 13, fontFamily: S.sans, outline: "none", boxSizing: "border-box" }}
          />
        </QBlock>

        {/* ── Hormonal therapy ── */}
        <QBlock label="Hormonal therapy (HRT / contraception)">
          <Chips color="#D070A0" options={[
            {value:"hrt_estradiol",label:"Estradiol (E2)"},{value:"hrt_estriol",label:"Estriol (E3)"},
            {value:"hrt_progesterone",label:"Progesterone"},{value:"hrt_testosterone",label:"Testosterone"},
            {value:"hrt_dhea",label:"DHEA"},{value:"contraceptive_pill",label:"Contraceptive pill"},
            {value:"contraceptive_iud",label:"Hormonal IUD"},{value:"hrt_none",label:"None"},
          ]} selected={data.hormonal_therapy || []} onToggle={v => t("hormonal_therapy", v)} />
          {(data.hormonal_therapy || []).some(v => v.startsWith("hrt_") && v !== "hrt_none") && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono, letterSpacing: "0.1em", marginBottom: 8 }}>DELIVERY METHOD</div>
              <Chips color="#C06090" options={[
                {value:"delivery_oral",label:"💊 Oral"},{value:"delivery_patch",label:"🩹 Patch"},
                {value:"delivery_gel",label:"🧴 Gel / Cream"},{value:"delivery_injection",label:"💉 Injection"},
                {value:"delivery_sublingual",label:"🍬 Sublingual"},{value:"delivery_vaginal",label:"🕯️ Vaginal"},
                {value:"delivery_pellet",label:"📍 Pellet"},
              ]} selected={data.hrt_delivery || []} onToggle={v => t("hrt_delivery", v)} />
              <input
                placeholder="Brand name + dose — e.g. Divigel 0.5mg daily, Utrogestan 100mg at night"
                value={data.hrt_detail || ""}
                onChange={e => u("hrt_detail", e.target.value)}
                style={{ marginTop: 10, width: "100%", background: S.card, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "9px 12px", color: S.ink, fontSize: 13, fontFamily: S.sans, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}
        </QBlock>

        {/* ── Thyroid medication ── */}
        <QBlock label="Thyroid medication">
          <Chips color={S.teal} options={[
            {value:"levothyroxine",label:"Levothyroxine (T4)"},{value:"liothyronine",label:"Liothyronine (T3)"},
            {value:"ndt",label:"NDT (T3+T4)"},{value:"methimazole",label:"Methimazole"},
            {value:"thyroid_none",label:"None"},
          ]} selected={data.thyroid_meds || []} onToggle={v => t("thyroid_meds", v)} />
          {!(data.thyroid_meds || []).includes("thyroid_none") && (data.thyroid_meds || []).length > 0 && (
            <input
              placeholder="Brand + dose — e.g. Levaxin 75mcg morning fasting"
              value={data.thyroid_detail || ""}
              onChange={e => u("thyroid_detail", e.target.value)}
              style={{ marginTop: 10, width: "100%", background: S.card, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "9px 12px", color: S.ink, fontSize: 13, fontFamily: S.sans, outline: "none", boxSizing: "border-box" }}
            />
          )}
        </QBlock>

        {/* ── Other medications ── */}
        <QBlock label="Other medications">
          <Chips color={S.rust} options={[
            {value:"antibiotics_recent",label:"Antibiotics (last 12mo)"},{value:"ppi",label:"PPIs / Antacids"},
            {value:"nsaids",label:"NSAIDs"},{value:"antidepressants",label:"Antidepressants / SSRIs"},
            {value:"statins",label:"Statins"},{value:"antihistamines",label:"Antihistamines"},
            {value:"immunosuppressants",label:"Immunosuppressants"},{value:"blood_pressure",label:"Blood pressure"},
            {value:"meds_none",label:"None"},
          ]} selected={data.medications || []} onToggle={v => t("medications", v)} />
          <input
            placeholder="List any others — name + dose"
            value={data.medications_other || ""}
            onChange={e => u("medications_other", e.target.value)}
            style={{ marginTop: 10, width: "100%", background: S.card, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "9px 12px", color: S.ink, fontSize: 13, fontFamily: S.sans, outline: "none", boxSizing: "border-box" }}
          />
        </QBlock>

        {/* ── Vitamins & supplements ── */}
        <QBlock label="Current vitamins & supplements">
          <Chips color="#60A870" options={[
            {value:"supp_vitamin_d",label:"Vitamin D"},{value:"supp_magnesium",label:"Magnesium"},
            {value:"supp_b12",label:"B12"},{value:"supp_folate",label:"Folate / B9"},
            {value:"supp_omega3",label:"Omega-3 / Fish oil"},{value:"supp_zinc",label:"Zinc"},
            {value:"supp_iron",label:"Iron"},{value:"supp_coq10",label:"CoQ10"},
            {value:"supp_probiotics",label:"Probiotics"},{value:"supp_nmn",label:"NMN"},
            {value:"supp_collagen",label:"Collagen"},{value:"supp_none",label:"None"},
          ]} selected={data.supplements || []} onToggle={v => t("supplements", v)} />
          <input
            placeholder="Other supplements — brand, dose, frequency"
            value={data.supplements_other || ""}
            onChange={e => u("supplements_other", e.target.value)}
            style={{ marginTop: 10, width: "100%", background: S.card, border: `1.5px solid ${S.border}`, borderRadius: 8, padding: "9px 12px", color: S.ink, fontSize: 13, fontFamily: S.sans, outline: "none", boxSizing: "border-box" }}
          />
        </QBlock>

        {/* ── Prior testing ── */}
        <QBlock label="Prior food sensitivity testing">
          <Chips color={S.teal} options={[
            {value:"alcat_250",label:"ALCAT 250"},{value:"alcat_483",label:"ALCAT 483"},
            {value:"igg_other",label:"IgG food test"},{value:"celiac_test",label:"Coeliac test"},
            {value:"none",label:"No prior testing"},
          ]} selected={data.previous_testing || []} onToggle={v => t("previous_testing", v)} />
        </QBlock>
      </>
    ),
    goals: (
      <>
        <SecHeader icon="—" title="Your goals" subtitle="What does recovery mean to you?" />
        <QBlock label="Primary goal">
          <SelectQ options={[
            {value:"gi",label:"Fix digestion",sub:"Bloating, transit, comfort"},
            {value:"energy",label:"Restore energy",sub:"No afternoon crashes"},
            {value:"weight",label:"Reduce inflammation",sub:"Puffiness, visceral fat"},
            {value:"skin",label:"Clear skin",sub:"Eczema, acne, redness"},
            {value:"sleep",label:"Sleep better",sub:"Fall and stay asleep"},
            {value:"clarity",label:"Mental clarity",sub:"Focus, mood, memory"},
          ]} value={data.primary_goal} onChange={v => u("primary_goal", v)} />
        </QBlock>
        <QBlock label="How committed are you to 21 days?">
          <ScaleQ value={data.readiness} onChange={v => u("readiness", v)} min={1} max={5} labels={["Just curious", "100% committed"]} />
        </QBlock>
        <QBlock label="Email (optional)" sub="Receive a copy of your protocol.">
          <input type="email" placeholder="your@email.com" value={data.email || ""} onChange={e => u("email", e.target.value)}
            style={{ width: "100%", background: S.card, border: `1.5px solid ${data.email ? S.gold : S.border}`, borderRadius: 10, padding: "11px 14px", color: S.ink, fontSize: 14, fontFamily: S.sans, outline: "none", boxShadow: S.shadowSm }} />
        </QBlock>
        <div style={{ padding: "12px 16px", background: S.bgDeep, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 11, color: S.inkDim, fontFamily: S.mono, lineHeight: 1.7 }}>
          🔒 GDPR compliant. Data used solely to generate your protocol. Not sold or shared. Delete: privacy@medibalans.com
        </div>
      </>
    ),
  };
  return map[id] || null;
}

// ─── ONBOARDING FLOW ───────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [idx, setIdx] = useState(-1);
  const [data, setData] = useState({});
  const [anim, setAnim] = useState(true);
  const section = SECTIONS[idx];
  const isLast = idx === SECTIONS.length - 1;
  const update = (k, v) => setData(p => ({ ...p, [k]: v }));
  const toggle = (k, v) => setData(p => ({ ...p, [k]: (p[k] || []).includes(v) ? (p[k] || []).filter(x => x !== v) : [...(p[k] || []), v] }));
  const navigate = (dir) => {
    setAnim(false);
    setTimeout(() => {
      if (dir > 0 && isLast) { onComplete({ formData: data, protocol: computeProtocol(data) }); }
      else { setIdx(i => Math.max(-1, i + dir)); }
      setAnim(true);
    }, 150);
  };
  const progress = idx >= 0 ? ((idx + 1) / SECTIONS.length) * 100 : 0;

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.ink, fontFamily: S.sans }}>
      <style>{GLOBAL_STYLE}</style>

      {/* Subtle texture overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${S.gold}08 0%, transparent 60%)`, zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, borderBottom: `1px solid ${S.border}`, background: `${S.bg}EE`, backdropFilter: "blur(20px)", padding: "14px 32px", display: FX, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: FX, alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${S.gold},${S.goldDark})`, display: FX, alignItems: "center", justifyContent: "center", fontFamily: S.serif, fontSize: 20, color: "#FFF", fontWeight: 600, boxShadow: `0 2px 8px ${S.gold}40` }}>M</div>
          <div>
            <div style={{ fontSize: 16, fontFamily: S.serif, color: S.ink, fontWeight: 500 }}>Meet Mario</div>
            <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.18em" }}>BIOLOGICAL RESET · MEDIBALANS AB</div>
          </div>
        </div>
        {idx >= 0 && (
          <div style={{ display: FX, alignItems: "center", gap: 16 }}>
            <div style={{ width: 140, height: 3, background: S.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,${S.gold},${S.goldLight})`, borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: S.mono, color: S.inkDim }}>{idx + 1}/{SECTIONS.length}</span>
          </div>
        )}
      </div>

      {/* Side nav */}
      {idx >= 0 && (
        <div style={{ position: "fixed", left: 0, top: 65, bottom: 0, width: 188, borderRight: `1px solid ${S.border}`, background: S.bgDeep, padding: "28px 0", zIndex: 10 }}>
          {SECTIONS.map((s, i) => (
            <div key={s.id} onClick={() => i < idx && setIdx(i)} style={{ padding: "9px 20px", display: FX, alignItems: "center", gap: 10, cursor: i < idx ? CP : "default" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: i === idx ? S.gold : i < idx ? S.goldLight : S.border, transition: "background 0.3s", boxShadow: i === idx ? `0 0 0 3px ${S.gold}30` : "none" }} />
              <div style={{ fontSize: 12, fontFamily: S.sans, color: i === idx ? S.gold : i < idx ? S.inkMid : S.inkDim, fontWeight: i === idx ? 700 : 400 }}>{s.label}</div>
            </div>
          ))}
          {/* Patent notice in sidebar */}
          <div style={{ position: "absolute", bottom: 20, left: 16, right: 16, padding: "8px 10px", background: S.goldBg, border: `1px solid ${S.gold}30`, borderRadius: 6 }}>
            <div style={{ fontSize: 8, fontFamily: S.mono, color: S.gold, letterSpacing: "0.1em", lineHeight: 1.6 }}>PATENT PENDING<br />SE 2615203-3</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ marginLeft: idx >= 0 ? 188 : 0, transition: "margin 0.3s ease" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: idx === -1 ? "60px 24px" : "48px 24px 100px", position: "relative", zIndex: 1, opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(8px)", transition: "all 0.15s ease" }}>

          {/* Landing */}
          {idx === -1 && (
            <div style={{ animation: "fadeUp 0.7s ease" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: S.goldBg, border: `1px solid ${S.gold}40`, borderRadius: 24, padding: "6px 18px", fontSize: 10, fontFamily: S.mono, color: S.gold, letterSpacing: "0.14em", marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.sage, display: "inline-block" }} />
                1,042 REAL ALCAT REPORTS · MEDIBALANS AB · STOCKHOLM
              </div>
              <h1 style={{ fontFamily: S.serif, fontSize: 54, fontWeight: 400, lineHeight: 1.05, marginBottom: 22, color: S.ink }}>
                Your body has<br />been speaking.<br />
                <em style={{ color: S.gold }}>We translate it.</em>
              </h1>
              <p style={{ fontSize: 16, color: S.inkMid, lineHeight: 1.85, maxWidth: 480, marginBottom: 44, fontFamily: S.sans, fontWeight: 300 }}>
                A clinical intake powered by population-level ALCAT data. 10 minutes. A personalised 21-day anti-inflammatory protocol.
              </p>
              <div style={{ display: FX, gap: 0, marginBottom: 52, border: `1px solid ${S.border}`, borderRadius: 12, overflow: "hidden", boxShadow: S.shadowMd }}>
                {[["1,042", "ALCAT Reports"], ["21 Days", "Reset Protocol"], ["10 min", "Intake time"], ["7", "Clinical sections"]].map(([n, l], i) => (
                  <div key={l} style={{ flex: 1, padding: "20px 16px", background: S.card, borderRight: i < 3 ? `1px solid ${S.border}` : "none", textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontFamily: S.serif, color: S.gold, marginBottom: 4 }}>{n}</div>
                    <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.1em" }}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(1)} style={{
                display: "block", width: "100%", padding: "18px 0", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg,${S.gold},${S.goldDark})`, color: "#FFF",
                fontSize: 15, fontWeight: 700, fontFamily: S.sans, cursor: CP,
                letterSpacing: "0.06em", boxShadow: `0 4px 20px ${S.gold}40`,
                animation: "glow 3s ease infinite",
              }}>Begin Assessment →</button>
              <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, fontFamily: S.mono, color: S.inkDim }}>~10 minutes · GDPR compliant · No credit card</div>

              <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {SECTIONS.map(s => (
                  <div key={s.id} style={{ padding: "12px 14px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, display: FX, gap: 8, alignItems: "center", boxShadow: S.shadowSm }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.gold, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: S.inkMid, fontFamily: S.sans }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section */}
          {idx >= 0 && section && <div>{renderSection(section.id, data, update, toggle)}</div>}

          {/* Nav */}
          {idx >= 0 && (
            <div style={{ position: "fixed", bottom: 0, left: 188, right: 0, background: `${S.bg}F4`, backdropFilter: "blur(16px)", borderTop: `1px solid ${S.border}`, padding: "16px 32px", display: FX, justifyContent: "space-between", alignItems: "center", zIndex: 20 }}>
              <button onClick={() => navigate(-1)} style={{ background: "none", border: `1.5px solid ${S.border}`, color: S.inkMid, borderRadius: 10, padding: "10px 24px", fontSize: 13, fontFamily: S.sans, cursor: CP, fontWeight: 700 }}>← Back</button>
              <div style={{ display: FX, gap: 5, alignItems: "center" }}>
                {SECTIONS.map((_, i) => (
                  <div key={i} style={{ width: i === idx ? 22 : 7, height: 7, borderRadius: 4, background: i < idx ? S.goldLight : i === idx ? S.gold : S.border, cursor: i < idx ? CP : "default", transition: "all 0.3s ease" }} onClick={() => i < idx && setIdx(i)} />
                ))}
              </div>
              <button onClick={() => navigate(1)} style={{ background: isLast ? `linear-gradient(135deg,${S.sage},${S.sageDark})` : `linear-gradient(135deg,${S.gold},${S.goldDark})`, border: "none", color: "#FFF", borderRadius: 10, padding: "10px 28px", fontSize: 13, fontWeight: 700, fontFamily: S.sans, cursor: CP, boxShadow: `0 2px 12px ${isLast ? S.sage : S.gold}40` }}>
                {isLast ? "Generate My Protocol ✦" : "Continue →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PROTOCOL BRIDGE ──────────────────────────────────────────────────────────
function ProtocolBridge({ formData, protocol, onEnterDashboard }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const name = formData.firstName ? `, ${formData.firstName}` : "";
  const topAvoid = protocol.avoid.filter(f => !f.label).slice(0, 6);
  const safeCount = protocol.safe.length;
  return (
    <div style={{ minHeight: "100vh", background: S.bgDark, color: "#F0EAE0", fontFamily: S.sans, display: FX, alignItems: "center", justifyContent: "center" }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ maxWidth: 580, width: "100%", padding: "52px 32px", textAlign: "center" }}>
        {phase === 0 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ width: 52, height: 52, border: `2px solid ${S.gold}40`, borderTop: `2px solid ${S.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 28px" }} />
            <div style={{ fontFamily: S.mono, fontSize: 11, color: S.goldLight, letterSpacing: "0.18em" }}>COMPUTING YOUR PROTOCOL…</div>
          </div>
        )}
        {phase >= 1 && (
          <div style={{ animation: "fadeUp 0.8s ease" }}>
            <div style={{ display: "inline-block", background: S.sage + "20", border: `1px solid ${S.sage}50`, borderRadius: 24, padding: "5px 18px", fontSize: 10, fontFamily: S.mono, color: "#8AB888", letterSpacing: "0.14em", marginBottom: 28 }}>
              ✓ PROTOCOL GENERATED · {new Date().toLocaleDateString("en-SE")}
            </div>
            <h1 style={{ fontFamily: S.serif, fontSize: 44, fontWeight: 400, marginBottom: 14, lineHeight: 1.1, color: "#F0EAE0" }}>
              Your <em style={{ color: S.goldLight }}>21-Day Biological Reset</em>{name}
            </h1>
            <div style={{ fontSize: 15, color: "#A89870", marginBottom: 6 }}>
              Reactivity profile: <span style={{ color: S.goldLight, fontWeight: 700 }}>{protocol.profile}</span>
            </div>
            <div style={{ fontSize: 12, color: "#786858", fontFamily: S.mono, marginBottom: 40 }}>
              {protocol.symptomCount} symptoms analysed · {safeCount} safe foods identified
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 40, textAlign: "left" }}>
              <div style={{ background: "#2A1A12", border: `1px solid ${S.rust}30`, borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 9, fontFamily: S.mono, color: S.rust, letterSpacing: "0.14em", marginBottom: 10 }}>TOP AVOID FOODS</div>
                {topAvoid.slice(0, 3).map(f => (
                  <div key={f.name} style={{ display: FX, justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#D0C0B0" }}>{f.name}</span>
                    <span style={{ fontSize: 10, fontFamily: S.mono, color: S.rust }}>{Math.round(f.adjusted * 100)}%</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#121A12", border: `1px solid ${S.sage}30`, borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 9, fontFamily: S.mono, color: "#8AB888", letterSpacing: "0.14em", marginBottom: 10 }}>PROTOCOL SUMMARY</div>
                {[["Phase 1", "21-day detox"], ["Phase 2", "4-day rotation"], ["Always avoid", "Seed oils · Oats"]].map(([k, v]) => (
                  <div key={k} style={{ display: FX, justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: S.mono, color: "#786858" }}>{k}</span>
                    <span style={{ fontSize: 11, fontFamily: S.mono, color: "#A0B8A0" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {phase >= 2 && (
              <div style={{ animation: "fadeUp 0.6s ease" }}>
                <button onClick={onEnterDashboard} style={{ display: "block", width: "100%", padding: "18px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${S.gold},${S.goldDark})`, color: "#FFF", fontSize: 15, fontWeight: 700, fontFamily: S.sans, cursor: CP, letterSpacing: "0.06em", boxShadow: `0 4px 24px ${S.gold}50`, animation: "glow 3s ease infinite", marginBottom: 14 }}>
                  Enter Meet Mario Dashboard →
                </button>
                <div style={{ fontSize: 11, fontFamily: S.mono, color: "#584838" }}>
                  MediBalans AB · Karlavägen 89 · Stockholm · <span style={{ color: "#6A4820" }}>Patent Pending SE 2615203-3</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MINI CHART (light theme) ─────────────────────────────────────────────────
function MiniChart({ pts, key_, color, label, unit, height = 64 }) {
  if (!pts || pts.length < 2) return null;
  const vals = pts.map(p => p[key_]);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const W = 220, H = height;
  const px = i => (i / (pts.length - 1)) * W;
  const py = v => H - ((v - min) / range) * (H - 8) - 4;
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(p[key_]).toFixed(1)}`).join(" ");
  const current = vals[vals.length - 1];
  const delta = current - vals[0];
  const isGoodUp = key_ !== "hrv" && key_ !== "spo2";
  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: "12px 14px", boxShadow: S.shadowSm }}>
      <div style={{ display: FX, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.14em", color: S.inkDim, fontFamily: S.mono }}>{label.toUpperCase()}</div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: S.mono }}>{current}</span>
          <span style={{ fontSize: 10, color: S.inkDim, fontFamily: S.mono }}> {unit}</span>
          {Math.abs(delta) > 0 && <div style={{ fontSize: 9, color: (delta > 0) === isGoodUp ? S.rust : S.sage, fontFamily: S.mono }}>{delta > 0 ? "+" : ""}{delta.toFixed(key_ === "temp" ? 2 : 0)}</div>}
        </div>
      </div>
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        <defs><linearGradient id={`g${key_}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.15} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <path d={`${path} L${px(pts.length - 1)},${H} L0,${H} Z`} fill={`url(#g${key_})`} />
        <path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
        <circle cx={px(pts.length - 1)} cy={py(vals[vals.length - 1])} r={4} fill={color} stroke={S.card} strokeWidth={2} />
      </svg>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ patientData, protocol, formData, onReset }) {
  const patientName = formData?.firstName || patientData?.name || "Patient";
  const severe = protocol?.avoid?.filter(f => !f.label && f.adjusted >= 0.6).map(f => f.name) || [];
  const moderate = protocol?.avoid?.filter(f => !f.label && f.adjusted >= 0.25 && f.adjusted < 0.6).map(f => f.name) || [];
  const mild = protocol?.avoid?.filter(f => !f.label && f.adjusted >= 0.18 && f.adjusted < 0.25).map(f => f.name) || [];
  const safeByCategory = protocol?.safeByCategory || {};
  const MARIO_SYS = `You are Meet Mario, AI clinical assistant for MediBalans AB, Stockholm. Patient: ${patientName}. Reactivity profile: ${protocol?.profile || "Mixed Inflammatory"}. Top avoidance foods: ${severe.slice(0, 5).join(", ")}. Safe foods include: ${Object.values(safeByCategory).flat().slice(0, 10).join(", ")}. Rules: No seed oils. No oats. No legumes. Prose only, no bullet points.`;

  const [tab, setTab] = useState("protocol");
  const [rotDay, setRotDay] = useState(1);
  const [cuisine, setCuisine] = useState(null);
  const [genResult, setGenResult] = useState(null);
  const [genLoad, setGenLoad] = useState(false);
  const [foodQ, setFoodQ] = useState("");
  const [chatMsgs, setChatMsgs] = useState([{ role: "assistant", content: `Good day, ${patientName}. Your protocol has been generated — reactivity profile: ${protocol?.profile || "Mixed Inflammatory"}. Where would you like to start?` }]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const [groceryList, setGroceryList] = useState(null);
  const [groceryLoad, setGroceryLoad] = useState(false);
  const [groceryWeek, setGroceryWeek] = useState([1, 2, 3, 4]);
  const [groceryExport, setGroceryExport] = useState(false);
  const [recipeTarget, setRecipeTarget] = useState(null);
  const [recipeSteps, setRecipeSteps] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [monActive, setMonActive] = useState(false);
  const [monTimeline, setMonTimeline] = useState([]);
  const [monSpikes, setMonSpikes] = useState([]);
  const [monTick, setMonTick] = useState(0);
  const [monMealLabel, setMonMealLabel] = useState("Lunch");
  const [monFoods, setMonFoods] = useState([]);
  const [monFoodInput, setMonFoodInput] = useState("");
  const [diary, setDiary] = useState([]);
  const [popup, setPopup] = useState(null);
  const [popupStep, setPopupStep] = useState(0);
  const [popupReactive, setPopupReactive] = useState(null);
  const [popupSymptoms, setPopupSymptoms] = useState([]);
  const [popupSeverity, setPopupSeverity] = useState(null);
  const [popupAnalysis, setPopupAnalysis] = useState("");
  const [popupLoading, setPopupLoading] = useState(false);
  const [expandPh, setExpandPh] = useState(null);
  const chatEnd = useRef(null);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  const allFoodsList = [...severe.map(f => ({ food: f, level: "severe" })), ...moderate.map(f => ({ food: f, level: "moderate" })), ...mild.map(f => ({ food: f, level: "mild" }))];
  const foodResults = foodQ.length > 1 ? allFoodsList.filter(({ food }) => food.toLowerCase().includes(foodQ.toLowerCase())).slice(0, 10) : [];

  const TABS = [
    { id: "protocol", label: "Protocol" }, { id: "rotation", label: "Rotation" },
    { id: "meals", label: "Meals" }, { id: "generate", label: "Generate" },
    { id: "grocery", label: "Grocery" }, { id: "monitor", label: "Monitor" },
    { id: "lookup", label: "Food Check" }, { id: "chat", label: "Ask Mario" },
  ];

  const PHASES = [
    { id: 1, label: "21-Day Detox", range: "Days 1–21", color: S.gold, rules: ["Green list only", "6 meals every 3h", "No sugars/yeast", "No seed oils", "No oats or legumes"], note: "Any deviation restarts the inflammatory clock." },
    { id: 2, label: "Green Phase", range: "Months 1–3", color: S.sage, rules: ["Strict 4-day rotation", "One legume day/week if tolerant", "Continue avoidance"], note: "Rotation prevents new sensitivities forming." },
    { id: 3, label: "Mild Reintroduction", range: "Month 3–4", color: S.sand, rules: ["Up to 3 mild foods/day", "Repeat only after 4 days", "Track reactions"], note: "React → delay 1 month." },
    { id: 4, label: "Moderate Reintro", range: "Month 6", color: S.amber, rules: ["Same rotation method", "Most patients see largest improvements"], note: "Measurable cellular changes expected." },
    { id: 5, label: "Maintenance", range: "Month 9+", color: S.teal, rules: ["Full rotation", "One free day/week"], note: "52 free days per year without affecting outcomes." },
  ];

  const startMonitoring = useCallback(() => {
    const hasReactive = monFoods.some(f => {
      const fu = f.toUpperCase();
      return severe.some(s => fu.includes(s) || s.includes(fu)) || moderate.some(s => fu.includes(s) || s.includes(fu));
    });
    setMonTimeline(simulateMealResponse(hasReactive));
    setMonSpikes([]); setMonTick(0); setMonActive(true); setPopup(null);
  }, [monFoods, severe, moderate]);

  useEffect(() => {
    if (!monActive) return;
    const iv = setInterval(() => {
      setMonTick(t => {
        const next = t + 1;
        if (next >= monTimeline.length) { setMonActive(false); clearInterval(iv); return t; }
        const spks = detectSpikes(monTimeline.slice(0, next + 1));
        setMonSpikes(prev => {
          const newSpikes = spks.filter(s => !prev.find(p => p.m === s.m));
          if (newSpikes.length > 0 && !popup) { setPopup(newSpikes[0]); setPopupStep(0); setPopupReactive(null); setPopupSymptoms([]); setPopupSeverity(null); setPopupAnalysis(""); }
          return spks;
        });
        return next;
      });
    }, 180);
    return () => clearInterval(iv);
  }, [monActive, monTimeline]);

  const visiblePts = monTimeline.slice(0, monTick + 1);
  const currentPt = visiblePts[visiblePts.length - 1];

  const logAndDismiss = async () => {
    setPopupLoading(true);
    const spikeDesc = popup ? `${popup.label} (${popup.val}) at ${popup.min} minutes post-meal` : "biometric spike";
    const prompt = `${patientName} had a post-meal reaction. Foods: ${monFoods.join(", ") || "not logged"}. Spike: ${spikeDesc}. Ate reactive food: ${popupReactive ? "possibly" : "no"}. Symptoms: ${popupSymptoms.join(", ") || "none"}. Severity: ${popupSeverity || "unrated"}. Profile: ${protocol?.profile}. Give: (1) most likely cause, (2) monitor in next 2h, (3) one protocol adjustment, (4) whether to flag clinician. 4 short paragraphs.`;
    let analysis = "";
    try { analysis = await callClaude([{ role: "user", content: prompt }], MARIO_SYS); } catch { analysis = "Analysis unavailable. Contact your MediBalans clinician."; }
    setPopupAnalysis(analysis); setPopupLoading(false);
    const entry = { id: Date.now(), ts: new Date().toISOString(), meal: monMealLabel, foods: [...monFoods], spike: popup, reactive: popupReactive, symptoms: [...popupSymptoms], severity: popupSeverity, analysis, timeline: [...visiblePts], flagClinic: popupSeverity === "severe" || popup?.level === "severe" };
    setDiary(prev => [entry, ...prev]); setPopupStep(3);
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const um = { role: "user", content: chatIn };
    const msgs = [...chatMsgs, um];
    setChatMsgs(msgs); setChatIn(""); setChatLoad(true);
    try { const r = await callClaude(msgs, MARIO_SYS); setChatMsgs([...msgs, { role: "assistant", content: r }]); } catch { setChatMsgs([...msgs, { role: "assistant", content: "Connection error." }]); }
    setChatLoad(false);
  };

  const genMenu = async () => {
    if (!cuisine || genLoad) return;
    setGenLoad(true); setGenResult(null);
    const r = ROT[rotDay];
    const foods = `Grains: ${r.grains.join(", ")}\nVeg: ${r.veg.join(", ")}\nFruit: ${r.fruit.join(", ")}\nProtein: ${r.protein.join(", ")}\nMisc: ${r.misc.join(", ")}`;
    const cu = CUISINES.find(c => c.id === cuisine)?.label;
    const prompt = `Generate a full-day menu in ${cu} style.\nHARD RULES: Day ${rotDay} rotation foods only. No seed oils. No oats. No legumes. No garlic/onion/tomato. CPF every main meal. Fruit only in snacks.\n6 meals: Breakfast (7:00), Snack (10:00), Lunch (13:00), Snack (16:00), Dinner (19:00), Snack (22:00).\nDay ${rotDay} foods:\n${foods}\nFormat: **Dish Name** then one sentence. End with a Notes paragraph.`;
    try { const res = await callClaude([{ role: "user", content: prompt }], "You are a clinical chef at MediBalans."); setGenResult(res); } catch { setGenResult("Error. Please try again."); }
    setGenLoad(false);
  };

  const buildGroceryList = async () => {
    if (groceryLoad) return;
    setGroceryLoad(true); setGroceryList(null);
    const allFL = groceryWeek.map(d => { const r = ROT[d]; return `Day ${d}: Protein: ${r.protein.slice(0, 3).join(", ")} | Veg: ${r.veg.slice(0, 4).join(", ")} | Grains: ${r.grains.slice(0, 2).join(", ")} | Fruit: ${r.fruit.slice(0, 2).join(", ")}`; }).join("\n");
    const prompt = `Generate structured weekly grocery list for ALCAT rotation.\nDays: ${groceryWeek.join(", ")}\n${allFL}\nRules: No seed oils. No oats. No legumes. Wild-caught fish only. Organic where possible. No garlic/onion/tomato.\nSections: **FISH & PROTEIN** **VEGETABLES** **FRUITS** **GRAINS & STARCHES** **OILS & FATS** (tallow, coconut, avocado only) **HERBS & SPICES** **STORE NOTES**\nBe specific with quantities.`;
    try { const r = await callClaude([{ role: "user", content: prompt }], "You are a clinical nutritionist at MediBalans AB."); setGroceryList(r); } catch { setGroceryList("Error. Please try again."); }
    setGroceryLoad(false);
  };

  const fetchRecipeSteps = async (day, protein, base, sides) => {
    setRecipeLoading(true); setRecipeSteps(null);
    const prompt = `Write a clear step-by-step recipe:\nDish: ${protein} — ${base}${sides ? " · " + sides : ""}\nALCAT Day ${day}. No seed oils (tallow/coconut/avocado only). No garlic/onion/tomato. 1 portion.\n\nFormat:\nPREP TIME: X min | COOK TIME: X min | SERVES: 1\nINGREDIENTS:\n- each item\nSTEPS:\n1. step\nCLINICAL NOTE: one sentence.`;
    try { const r = await callClaude([{ role: "user", content: prompt }], "You are a clinical chef at MediBalans AB. No seed oils ever."); setRecipeSteps(r); } catch { setRecipeSteps("Error loading recipe."); }
    setRecipeLoading(false);
  };

  // Spike popup
  const levelColor = popup ? (popup.level === "severe" ? S.rust : S.amber) : S.amber;
  const SpikePopup = () => {
    if (!popup) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(20,15,10,0.6)", zIndex: 1000, display: FX, alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
        <div style={{ background: S.card, border: `1.5px solid ${levelColor}40`, borderRadius: 16, maxWidth: 480, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.20)", overflow: "hidden" }}>
          <div style={{ background: levelColor + "10", borderBottom: `1px solid ${levelColor}20`, padding: "18px 22px" }}>
            <div style={{ display: FX, alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: levelColor, animation: "pulse 1s infinite", flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: levelColor, fontFamily: S.mono, letterSpacing: "0.12em" }}>{popup.level.toUpperCase()} REACTION DETECTED</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>{popup.min}min post-meal</span>
            </div>
            <div style={{ fontSize: 22, color: S.ink, fontWeight: 600, marginTop: 6, fontFamily: S.serif }}>{popup.label} <span style={{ color: levelColor }}>{popup.val}</span></div>
          </div>
          <div style={{ padding: "20px 22px" }}>
            {popupStep === 0 && <>
              <div style={{ fontSize: 14, color: S.inkMid, lineHeight: 1.75, marginBottom: 18 }}>
                Your <strong style={{ color: levelColor }}>{popup.label}</strong> spiked unusually. This pattern can indicate a food reaction.
                {monFoods.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: S.inkDim, fontFamily: S.mono }}>Logged meal: {monFoods.join(", ")}</div>}
              </div>
              <div style={{ fontSize: 13, color: S.gold, fontFamily: S.sans, marginBottom: 14, fontWeight: 700 }}>Did you eat anything outside your safe list?</div>
              <div style={{ display: FX, gap: 10 }}>
                <button onClick={() => { setPopupReactive(true); setPopupStep(1); }} style={{ flex: 1, background: S.rustBg, border: `1.5px solid ${S.rust}40`, borderRadius: 10, padding: "11px", cursor: CP, color: S.rust, fontSize: 13, fontFamily: S.sans, fontWeight: 700 }}>Yes — possibly</button>
                <button onClick={() => { setPopupReactive(false); setPopupStep(1); }} style={{ flex: 1, background: S.bgDeep, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "11px", cursor: CP, color: S.inkMid, fontSize: 13, fontFamily: S.sans }}>No — on protocol</button>
              </div>
            </>}
            {popupStep === 1 && <>
              <div style={{ fontSize: 13, color: S.gold, fontFamily: S.sans, fontWeight: 700, marginBottom: 14 }}>Any symptoms right now?</div>
              {Object.values(SYMPTOM_CATS).map(cat => (
                <div key={cat.label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.12em", color: S.inkDim, fontFamily: S.mono, marginBottom: 6 }}>{cat.icon} {cat.label.toUpperCase()}</div>
                  <div style={{ display: FX, flexWrap: "wrap", gap: 5 }}>
                    {cat.items.map(sym => {
                      const sel = popupSymptoms.includes(sym);
                      return <button key={sym} onClick={() => setPopupSymptoms(prev => sel ? prev.filter(x => x !== sym) : [...prev, sym])} style={{ background: sel ? S.rustBg : S.bg, border: `1px solid ${sel ? S.rust + "60" : S.border}`, borderRadius: 6, padding: "4px 10px", cursor: CP, fontSize: 11, fontFamily: S.sans, color: sel ? S.rust : S.inkMid }}>{sym}</button>;
                    })}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 13, color: S.gold, fontFamily: S.sans, fontWeight: 700, margin: "14px 0 10px" }}>Overall severity?</div>
              <div style={{ display: FX, gap: 8, marginBottom: 18 }}>
                {[["mild", S.sand], ["moderate", S.amber], ["severe", S.rust]].map(([sev, col]) => (
                  <button key={sev} onClick={() => setPopupSeverity(sev)} style={{ flex: 1, background: popupSeverity === sev ? col + "15" : S.bgDeep, border: `1.5px solid ${popupSeverity === sev ? col : S.border}`, borderRadius: 8, padding: "10px", cursor: CP, color: popupSeverity === sev ? col : S.inkMid, fontSize: 12, fontFamily: S.sans, fontWeight: 700, textTransform: "capitalize" }}>{sev}</button>
                ))}
              </div>
              <button onClick={logAndDismiss} disabled={popupLoading} style={{ width: "100%", background: popupLoading ? S.bgDeep : `linear-gradient(135deg,${S.gold},${S.goldDark})`, border: "none", borderRadius: 10, padding: "12px", cursor: popupLoading ? "wait" : CP, color: popupLoading ? S.inkDim : "#FFF", fontSize: 13, fontFamily: S.sans, fontWeight: 700, display: FX, alignItems: "center", justifyContent: "center", gap: 8 }}>
                {popupLoading ? <><span style={{ display: FX, gap: 3 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: S.inkDim, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`, display: "inline-block" }} />)}</span><span>Analysing with Mario…</span></> : "Log reaction & get Mario's analysis →"}
              </button>
            </>}
            {popupStep === 3 && <>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", color: S.teal, fontFamily: S.mono, marginBottom: 10 }}>MARIO'S ANALYSIS</div>
              <div style={{ fontSize: 13, color: S.inkMid, lineHeight: 1.8, fontFamily: S.sans, maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
                {popupAnalysis.split("\n").map((l, i) => l.trim() ? <div key={i} style={{ marginBottom: 8 }}>{l}</div> : null)}
              </div>
              {diary[0]?.flagClinic && <div style={{ background: S.rustBg, border: `1px solid ${S.rust}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: S.rust, fontFamily: S.sans, display: FX, gap: 8, alignItems: "center" }}>⚠️ This reaction has been flagged for clinician review.</div>}
              <button onClick={() => setPopup(null)} style={{ width: "100%", background: S.bgDeep, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: "11px", cursor: CP, color: S.inkMid, fontSize: 13, fontFamily: S.sans }}>Close — logged to diary ✓</button>
            </>}
          </div>
        </div>
      </div>
    );
  };

  // Dot loader helper
  const DotLoader = ({ color = S.gold }) => (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: color, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`, display: "inline-block" }} />)}
    </span>
  );

  // Tab button style
  const tabStyle = (id) => ({
    background: "none", border: "none", cursor: CP,
    padding: "9px 16px", fontSize: 12, fontFamily: S.sans, fontWeight: tab === id ? 700 : 400,
    color: tab === id ? S.gold : S.inkMid,
    borderBottom: `2px solid ${tab === id ? S.gold : "transparent"}`,
    whiteSpace: "nowrap", transition: "all 0.15s",
  });

  // Card style
  const card = (extra = {}) => ({ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, boxShadow: S.shadowSm, ...extra });

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.ink, fontFamily: S.sans }}>
      <style>{GLOBAL_STYLE}</style>
      {popup && <SpikePopup />}

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${S.border}`, background: `${S.card}EE`, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100, padding: "0 24px" }}>
        <div style={{ display: FX, justifyContent: "space-between", alignItems: "center", padding: "14px 0 10px" }}>
          <div style={{ display: FX, alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${S.gold},${S.goldDark})`, display: FX, alignItems: "center", justifyContent: "center", fontFamily: S.serif, fontSize: 20, color: "#FFF", fontWeight: 600, boxShadow: `0 2px 8px ${S.gold}30` }}>M</div>
            <div>
              <div style={{ fontSize: 17, fontFamily: S.serif, fontWeight: 500, color: S.ink }}>meet mario</div>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.16em" }}>MEDIBALANS AB · STOCKHOLM</div>
            </div>
          </div>
          <div style={{ display: FX, gap: 8, alignItems: "center" }}>
            {monActive && <div style={{ background: S.rustBg, border: `1px solid ${S.rust}30`, borderRadius: 20, padding: "4px 12px", display: FX, gap: 6, alignItems: "center" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: S.rust, animation: "pulse 0.8s infinite" }} />
              <span style={{ fontSize: 10, color: S.rust, fontFamily: S.mono, fontWeight: 700 }}>MONITORING</span>
            </div>}
            {diary.length > 0 && <div style={{ background: S.amberBg, border: `1px solid ${S.amber}30`, borderRadius: 20, padding: "4px 12px", fontSize: 10, color: S.amber, fontFamily: S.mono }}>{diary.length} reaction{diary.length > 1 ? "s" : ""}</div>}
            <div style={{ background: S.goldBg, border: `1px solid ${S.gold}30`, borderRadius: 6, padding: "4px 10px" }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.1em" }}>PATENT PENDING · SE 2615203-3</div>
            </div>
            <div style={{ display: FX, alignItems: "center", gap: 6, background: S.goldBg, border: `1px solid ${S.border}`, borderRadius: 8, padding: "6px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: S.sage }} />
              <span style={{ fontSize: 11, fontFamily: S.sans, color: S.inkMid }}>{patientName}</span>
              <span style={{ fontSize: 10, color: S.gold, fontFamily: S.mono, fontWeight: 700 }}>{protocol?.profile?.split("/")[0]?.trim()}</span>
            </div>
            <button onClick={onReset} style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 7, padding: "6px 12px", cursor: CP, fontSize: 11, fontFamily: S.sans, color: S.inkDim }}>← New</button>
          </div>
        </div>
        <div style={{ display: FX, gap: 0, overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(t.id)}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ padding: "28px 24px", maxWidth: 1000, margin: "0 auto" }}>

        {/* ── PROTOCOL TAB ── */}
        {tab === "protocol" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.16em", marginBottom: 8 }}>YOUR PROTOCOL</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.ink, marginBottom: 6 }}>21-Day Biological Reset</h2>
              <div style={{ fontSize: 14, color: S.inkMid }}>Profile: <strong style={{ color: S.gold }}>{protocol?.profile}</strong> · {protocol?.symptomCount} symptoms analysed</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "HIGH PRIORITY AVOID", color: S.rust, bg: S.rustBg, items: severe.slice(0, 8), period: "~6 months" },
                { label: "MODERATE AVOID", color: S.amber, bg: S.amberBg, items: moderate.slice(0, 8), period: "~3 months" },
              ].map(({ label, color, bg, items, period }) => (
                <div key={label} style={{ ...card(), background: bg, borderColor: color + "25", borderLeft: `3px solid ${color}` }}>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: FX, justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 9, fontFamily: S.mono, color, letterSpacing: "0.12em" }}>{label}</div>
                      <div style={{ fontSize: 10, fontFamily: S.mono, color: S.inkDim }}>{period}</div>
                    </div>
                    <div style={{ display: FX, flexWrap: "wrap", gap: 5 }}>
                      {items.map(f => <span key={f} style={{ background: S.card, border: `1px solid ${color}25`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: S.sans, color: S.inkMid }}>{f}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...card(), marginBottom: 20, padding: "14px 16px", borderLeft: `3px solid ${S.sand}` }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.sand, letterSpacing: "0.12em", marginBottom: 10 }}>MILD AVOID · ~2 months</div>
              <div style={{ display: FX, flexWrap: "wrap", gap: 5 }}>
                {mild.map(f => <span key={f} style={{ background: S.sandBg, border: `1px solid ${S.sand}25`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: S.sans, color: S.inkMid }}>{f}</span>)}
              </div>
            </div>

            <div style={{ ...card(), marginBottom: 20, padding: "14px 16px", borderLeft: `3px solid ${S.rust}` }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.rust, letterSpacing: "0.12em", marginBottom: 10 }}>ALWAYS AVOID — CLINICAL FLAGS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[["Seed Oils", "Canola, sunflower, grapeseed, soybean, corn", S.rust], ["Oats", "All forms — avenin cross-reactivity risk", S.amber], ["Legumes", "Soy, chickpea, lentil, all beans — lectins", S.amber]].map(([name, desc, col]) => (
                  <div key={name} style={{ background: col + "08", border: `1px solid ${col}20`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: col, marginBottom: 4 }}>{name}</div>
                    <div style={{ fontSize: 10, color: S.inkDim, fontFamily: S.mono, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 8, fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em" }}>TREATMENT PHASES</div>
            {PHASES.map(ph => (
              <div key={ph.id} style={{ ...card(), marginBottom: 6, overflow: "hidden" }}>
                <button onClick={() => setExpandPh(expandPh === ph.id ? null : ph.id)} style={{ width: "100%", background: expandPh === ph.id ? S.bgDeep : "none", border: "none", cursor: CP, padding: "13px 16px", display: FX, justifyContent: "space-between", alignItems: "center", borderLeft: `3px solid ${ph.color}` }}>
                  <div style={{ display: FX, gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: ph.color, fontWeight: 700, fontFamily: S.sans }}>{ph.label}</span>
                    <span style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>{ph.range}</span>
                  </div>
                  <span style={{ color: S.inkDim, fontSize: 16, fontWeight: 300 }}>{expandPh === ph.id ? "−" : "+"}</span>
                </button>
                {expandPh === ph.id && (
                  <div style={{ padding: "0 16px 14px 19px", borderLeft: `3px solid ${ph.color}` }}>
                    <div style={{ display: FX, flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {ph.rules.map((r, i) => <span key={i} style={{ background: ph.color + "10", border: `1px solid ${ph.color}25`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontFamily: S.sans, color: S.inkMid }}>{r}</span>)}
                    </div>
                    <div style={{ fontSize: 12, color: S.gold, fontFamily: S.mono, fontStyle: "italic" }}>{ph.note}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ROTATION TAB ── */}
        {tab === "rotation" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.16em", marginBottom: 8 }}>4-DAY ROTATION</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.ink }}>Food Rotation Calendar</h2>
            </div>
            <div style={{ display: FX, gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4].map(d => <button key={d} onClick={() => setRotDay(d)} style={{ flex: 1, background: rotDay === d ? S.goldBg : S.card, border: `1.5px solid ${rotDay === d ? S.gold : S.border}`, color: rotDay === d ? S.gold : S.inkMid, borderRadius: 10, padding: "10px 0", cursor: CP, fontSize: 13, fontFamily: S.sans, fontWeight: rotDay === d ? 700 : 400, boxShadow: rotDay === d ? `0 0 0 3px ${S.gold}20` : S.shadowSm }}>Day {d}</button>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[["grains", "🌾", "Grains & Starches"], ["veg", "🥬", "Vegetables"], ["fruit", "🍓", "Fruits"], ["protein", "🐟", "Protein"], ["misc", "🫙", "Nuts, Seeds & Herbs"]].map(([k, em, label]) => (
                <div key={k} style={{ ...card({ padding: "14px 16px", gridColumn: k === "misc" ? "1/-1" : undefined }) }}>
                  <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.12em", marginBottom: 10 }}>{em} {label.toUpperCase()}</div>
                  <div style={{ display: FX, flexWrap: "wrap", gap: 6 }}>
                    {ROT[rotDay][k].map(f => <span key={f} style={{ background: S.bgDeep, border: `1px solid ${S.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontFamily: S.sans, color: S.inkMid }}>{f}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MEALS TAB ── */}
        {tab === "meals" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.16em", marginBottom: 8 }}>DAILY MEALS</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.ink }}>Meal Plan</h2>
            </div>
            <div style={{ display: FX, gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4].map(d => <button key={d} onClick={() => { setRotDay(d); setRecipeTarget(null); setRecipeSteps(null); }} style={{ flex: 1, background: rotDay === d ? S.goldBg : S.card, border: `1.5px solid ${rotDay === d ? S.gold : S.border}`, color: rotDay === d ? S.gold : S.inkMid, borderRadius: 10, padding: "10px 0", cursor: CP, fontSize: 13, fontFamily: S.sans, fontWeight: rotDay === d ? 700 : 400, boxShadow: rotDay === d ? `0 0 0 3px ${S.gold}20` : S.shadowSm }}>Day {d}</button>)}
            </div>
            <div style={{ display: FX, flexDirection: "column", gap: 8 }}>
              {[["🌅", "7:00", "Breakfast", ROT[rotDay].grains[0] + " porridge · " + ROT[rotDay].fruit[0], null, false],
                ["🍓", "10:00", "Snack", ROT[rotDay].fruit[1] + " · " + ROT[rotDay].misc[0], null, false],
                ["🍽️", "13:00", "Lunch", ROT[rotDay].protein[0] + " · " + ROT[rotDay].veg[0] + " · " + ROT[rotDay].grains[0], ROT[rotDay].misc[1], true],
                ["🫙", "16:00", "Snack", ROT[rotDay].fruit[2] + " · " + ROT[rotDay].misc[2], null, false],
                ["🐟", "19:00", "Dinner", ROT[rotDay].protein[1] + " · " + ROT[rotDay].veg[1] + " · " + ROT[rotDay].veg[2], ROT[rotDay].misc[3], true],
                ["🌿", "22:00", "Evening", "Herbal tea · " + ROT[rotDay].misc[0], null, false],
              ].map(([em, time, label, base, sides, isProtein]) => {
                const protein = isProtein ? (label === "Lunch" ? ROT[rotDay].protein[0] : ROT[rotDay].protein[1]) : null;
                const mealKey = `${rotDay}-${label}`;
                const isRecipeOpen = recipeTarget === mealKey;
                return (
                  <div key={label} style={{ ...card({ overflow: "hidden" }) }}>
                    <div style={{ padding: "14px 16px", display: FX, gap: 14, alignItems: "flex-start" }}>
                      <div style={{ display: FX, flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 20 }}>{em}</span>
                        <span style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim }}>{time}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: S.gold, fontWeight: 700, fontFamily: S.mono, letterSpacing: "0.1em", marginBottom: 5 }}>{label.toUpperCase()}</div>
                        <div style={{ fontSize: 14, color: S.ink, lineHeight: 1.6, fontFamily: S.sans }}>
                          {protein && <span style={{ fontWeight: 700 }}>{protein} — </span>}{base}
                          {sides && <span style={{ color: S.inkDim }}> · {sides}</span>}
                        </div>
                        {isProtein && (
                          <div style={{ marginTop: 10 }}>
                            <button onClick={() => { if (isRecipeOpen) { setRecipeTarget(null); setRecipeSteps(null); } else { setRecipeTarget(mealKey); fetchRecipeSteps(rotDay, protein, base, sides); } }} style={{ background: isRecipeOpen ? S.goldBg : "none", border: `1px solid ${isRecipeOpen ? S.gold : S.border}`, borderRadius: 20, padding: "5px 14px", cursor: CP, fontSize: 11, fontFamily: S.mono, color: isRecipeOpen ? S.gold : S.inkDim, display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <span>{isRecipeOpen ? "▾" : "▸"}</span> {isRecipeOpen ? "Hide recipe" : "Step-by-step recipe"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {isProtein && isRecipeOpen && (
                      <div style={{ borderTop: `1px solid ${S.border}`, background: S.bgDeep, padding: "16px 18px" }}>
                        {recipeLoading ? <div style={{ display: FX, gap: 8, alignItems: "center", padding: "6px 0" }}><DotLoader /><span style={{ fontSize: 12, color: S.inkDim, fontFamily: S.mono }}>Writing your recipe…</span></div>
                          : recipeSteps ? (
                            <div style={{ fontSize: 12, fontFamily: S.sans, lineHeight: 1.85, color: S.inkMid }}>
                              {recipeSteps.split("\n").map((line, ri) => {
                                if (!line.trim()) return <div key={ri} style={{ height: 5 }} />;
                                if (line.startsWith("PREP TIME") || line.startsWith("COOK TIME")) return <div key={ri} style={{ fontSize: 10, fontFamily: S.mono, color: S.inkDim, marginBottom: 6 }}>{line}</div>;
                                if (line.startsWith("INGREDIENTS") || line.startsWith("STEPS")) return <div key={ri} style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.14em", fontWeight: 700, marginTop: 12, marginBottom: 6 }}>{line}</div>;
                                if (line.startsWith("CLINICAL NOTE")) return <div key={ri} style={{ marginTop: 12, borderTop: `1px solid ${S.border}`, paddingTop: 10, color: S.sage, fontSize: 11, fontStyle: "italic", fontFamily: S.mono }}>🌿 {line.replace("CLINICAL NOTE:", "").trim()}</div>;
                                if (line.match(/^\d+\./)) return <div key={ri} style={{ display: FX, gap: 10, marginBottom: 6 }}><span style={{ color: S.gold, fontWeight: 700, fontFamily: S.mono, minWidth: 18, flexShrink: 0 }}>{line.match(/^\d+/)[0]}.</span><span style={{ flex: 1 }}>{line.replace(/^\d+\.\s*/, "")}</span></div>;
                                if (line.startsWith("-")) return <div key={ri} style={{ color: S.inkMid, paddingLeft: 14, marginBottom: 3 }}>· {line.slice(1).trim()}</div>;
                                return <div key={ri}>{line}</div>;
                              })}
                            </div>
                          ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── GENERATE TAB ── */}
        {tab === "generate" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.16em", marginBottom: 8 }}>AI MENU GENERATOR</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.ink }}>Generate My Day</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em", marginBottom: 10 }}>ROTATION DAY</div>
                <div style={{ display: FX, gap: 6, marginBottom: 20 }}>
                  {[1, 2, 3, 4].map(d => <button key={d} onClick={() => { setRotDay(d); setGenResult(null); }} style={{ flex: 1, background: rotDay === d ? S.goldBg : S.card, border: `1.5px solid ${rotDay === d ? S.gold : S.border}`, color: rotDay === d ? S.gold : S.inkMid, borderRadius: 8, padding: "9px 0", cursor: CP, fontSize: 12, fontFamily: S.sans, fontWeight: rotDay === d ? 700 : 400 }}>Day {d}</button>)}
                </div>
                <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em", marginBottom: 10 }}>CUISINE STYLE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {CUISINES.map(c => (
                    <button key={c.id} onClick={() => { setCuisine(c.id); setGenResult(null); }} style={{ background: cuisine === c.id ? S.goldBg : S.card, border: `1.5px solid ${cuisine === c.id ? S.gold : S.border}`, borderRadius: 10, padding: "12px 12px", cursor: CP, textAlign: "left", boxShadow: S.shadowSm }}>
                      <div style={{ fontSize: 16, marginBottom: 3 }}>{c.flag}</div>
                      <div style={{ fontSize: 12, color: cuisine === c.id ? S.gold : S.ink, fontWeight: cuisine === c.id ? 700 : 400, fontFamily: S.sans }}>{c.label}</div>
                      <div style={{ fontSize: 10, color: S.inkDim, fontFamily: S.mono }}>{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ ...card({ padding: "16px", marginBottom: 12 }) }}>
                  <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em", marginBottom: 10 }}>TODAY'S ROTATION PREVIEW — DAY {rotDay}</div>
                  {[["🐟", "Protein", ROT[rotDay].protein.join(", ")], ["🥬", "Vegetables", ROT[rotDay].veg.join(", ")], ["🌾", "Grains", ROT[rotDay].grains.join(", ")], ["🍓", "Fruit", ROT[rotDay].fruit.join(", ")]].map(([em, cat, items]) => (
                    <div key={cat} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontFamily: S.mono, color: S.inkDim, marginBottom: 3 }}>{em} {cat}</div>
                      <div style={{ fontSize: 12, color: S.inkMid, fontFamily: S.sans }}>{items}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={genMenu} disabled={!cuisine || genLoad} style={{ width: "100%", background: !cuisine ? S.bgDeep : genLoad ? S.bgDeep : `linear-gradient(135deg,${S.gold},${S.goldDark})`, border: `1px solid ${!cuisine ? S.border : S.gold}`, color: !cuisine || genLoad ? S.inkDim : "#FFF", borderRadius: 12, padding: "14px", cursor: !cuisine ? "not-allowed" : CP, fontSize: 14, fontFamily: S.sans, fontWeight: 700, marginBottom: 20, display: FX, alignItems: "center", justifyContent: "center", gap: 8, boxShadow: !cuisine ? "none" : `0 4px 16px ${S.gold}30` }}>
              {genLoad ? <><DotLoader /><span>Generating…</span></> : !cuisine ? "Select a cuisine above" : `Generate · ${CUISINES.find(c => c.id === cuisine)?.label} · Day ${rotDay}`}
            </button>
            {genResult && (
              <div style={{ ...card({ padding: "20px 22px", animation: "fadeUp 0.3s ease" }) }}>
                <div style={{ display: FX, justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: S.ink }}>{CUISINES.find(c => c.id === cuisine)?.flag} {CUISINES.find(c => c.id === cuisine)?.label} · Day {rotDay}</span>
                  <button onClick={() => setGenResult(null)} style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 6, color: S.inkDim, padding: "4px 10px", cursor: CP, fontSize: 11, fontFamily: S.mono }}>↺ Reset</button>
                </div>
                <div style={{ fontSize: 13, lineHeight: 2, color: S.inkMid, fontFamily: S.sans }}>
                  {genResult.split("\n").map((line, i) => {
                    if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
                    const bm = line.match(/^\*\*(.+)\*\*(.*)$/);
                    if (bm) return <div key={i} style={{ marginTop: i > 0 ? 14 : 0 }}><span style={{ color: S.ink, fontWeight: 700, fontSize: 15, fontFamily: S.serif }}>{bm[1]}</span>{bm[2] && <span style={{ color: S.inkMid }}>{bm[2]}</span>}</div>;
                    if (line.match(/^Notes/i)) return <div key={i} style={{ marginTop: 16, borderTop: `1px solid ${S.border}`, paddingTop: 12, fontSize: 12, color: S.inkDim, fontFamily: S.mono, fontStyle: "italic" }}><strong>Notes · </strong>{line.replace(/^Notes[\s:]*/i, "")}</div>;
                    return <div key={i} style={{ color: S.inkMid, fontSize: 12 }}>{line}</div>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GROCERY TAB ── */}
        {tab === "grocery" && (
          <div>
            <div style={{ display: FX, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.16em", marginBottom: 8 }}>WEEKLY SHOPPING</div>
                <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.ink }}>Smart Grocery List</h2>
                <div style={{ fontSize: 13, color: S.inkMid, marginTop: 4 }}>Built from your rotation. ALCAT-safe · Wild-caught · Organic first.</div>
              </div>
            </div>
            <div style={{ ...card({ padding: "18px", marginBottom: 16 }) }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em", marginBottom: 12 }}>SELECT ROTATION DAYS THIS WEEK</div>
              <div style={{ display: FX, gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {[1, 2, 3, 4].map(d => {
                  const sel = groceryWeek.includes(d);
                  return <button key={d} onClick={() => setGroceryWeek(prev => sel ? prev.filter(x => x !== d) : [...prev, d].sort())} style={{ background: sel ? S.goldBg : S.bgDeep, border: `1.5px solid ${sel ? S.gold : S.border}`, borderRadius: 10, padding: "8px 20px", cursor: CP, fontSize: 13, fontFamily: S.sans, color: sel ? S.gold : S.inkMid, fontWeight: sel ? 700 : 400 }}>Day {d}</button>;
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
                {groceryWeek.map(d => (
                  <div key={d} style={{ background: S.bgDeep, border: `1px solid ${S.border}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, color: S.gold, fontFamily: S.mono, marginBottom: 6, fontWeight: 700 }}>DAY {d}</div>
                    <div style={{ fontSize: 10, color: S.inkDim, fontFamily: S.sans, lineHeight: 1.8 }}>
                      <div>🐟 {ROT[d].protein.slice(0, 2).join(", ")}</div>
                      <div>🥬 {ROT[d].veg.slice(0, 3).join(", ")}</div>
                      <div>🌾 {ROT[d].grains.slice(0, 2).join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={buildGroceryList} disabled={groceryLoad || groceryWeek.length === 0} style={{ width: "100%", background: groceryLoad ? S.bgDeep : groceryWeek.length === 0 ? S.bgDeep : `linear-gradient(135deg,${S.gold},${S.goldDark})`, border: `1px solid ${groceryLoad || groceryWeek.length === 0 ? S.border : S.gold}`, color: groceryLoad || groceryWeek.length === 0 ? S.inkDim : "#FFF", borderRadius: 10, padding: "12px", cursor: groceryLoad || groceryWeek.length === 0 ? "not-allowed" : CP, fontSize: 13, fontFamily: S.sans, fontWeight: 700, display: FX, alignItems: "center", justifyContent: "center", gap: 8, boxShadow: groceryWeek.length > 0 && !groceryLoad ? `0 4px 16px ${S.gold}30` : "none" }}>
                {groceryLoad ? <><DotLoader /><span>Building your list…</span></> : <><span>🛒</span><span>Generate grocery list · Days {groceryWeek.join(", ")}</span></>}
              </button>
            </div>

            {groceryList && (
              <div style={{ ...card({ padding: "20px 22px" }) }}>
                <div style={{ display: FX, justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.12em" }}>YOUR WEEKLY ALCAT GROCERY LIST</div>
                  <div style={{ display: FX, gap: 8 }}>
                    <button onClick={() => { navigator.clipboard?.writeText(groceryList.replace(/\*\*/g, "")); setGroceryExport(true); setTimeout(() => setGroceryExport(false), 2000); }} style={{ background: groceryExport ? S.sageBg : S.bgDeep, border: `1px solid ${groceryExport ? S.sage : S.border}`, borderRadius: 7, padding: "5px 12px", cursor: CP, fontSize: 11, fontFamily: S.mono, color: groceryExport ? S.sage : S.inkDim }}>{groceryExport ? "✓ Copied" : "Copy"}</button>
                    <button onClick={() => setGroceryList(null)} style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 7, color: S.inkDim, padding: "5px 12px", cursor: CP, fontSize: 11, fontFamily: S.mono }}>↺</button>
                  </div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 2.1, color: S.inkMid, fontFamily: S.sans }}>
                  {groceryList.split("\n").map((line, gi) => {
                    if (!line.trim()) return <div key={gi} style={{ height: 7 }} />;
                    const bm = line.match(/^\*\*(.+)\*\*/);
                    if (bm) return <div key={gi} style={{ marginTop: gi > 0 ? 18 : 0, marginBottom: 8, display: FX, alignItems: "center", gap: 10 }}><div style={{ height: 1, flex: 1, background: S.border }} /><span style={{ fontSize: 9, letterSpacing: "0.14em", color: S.gold, fontFamily: S.mono, fontWeight: 700 }}>{bm[1].toUpperCase()}</span><div style={{ height: 1, flex: 1, background: S.border }} /></div>;
                    if (line.startsWith("- ") || line.startsWith("• ")) return <div key={gi} style={{ display: FX, gap: 10, alignItems: "flex-start", marginBottom: 3 }}><span style={{ color: S.goldLight, flexShrink: 0, marginTop: 1 }}>·</span><span style={{ color: S.inkMid, fontSize: 13 }}>{line.slice(2)}</span></div>;
                    if (line.match(/^STORE NOTES/i)) return <div key={gi} style={{ marginTop: 16, borderTop: `1px solid ${S.border}`, paddingTop: 12, fontSize: 10, color: S.gold, fontFamily: S.mono, fontWeight: 700, letterSpacing: "0.12em" }}>STORE NOTES</div>;
                    return <div key={gi} style={{ fontSize: 12, color: S.inkDim, fontFamily: S.mono }}>{line}</div>;
                  })}
                </div>
                <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${S.border}` }}>
                  <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em", marginBottom: 12 }}>ORDER ONLINE</div>
                  <div style={{ display: FX, gap: 8, flexWrap: "wrap" }}>
                    {[{ name: "ICA Online", url: "https://www.ica.se", icon: "🔴", note: "Hemleverans" }, { name: "Matsmart", url: "https://www.matsmart.se", icon: "🟢", note: "Organic discounts" }, { name: "Nordic Superfood", url: "https://nordicsuperfood.se", icon: "🌿", note: "Wild-caught & organic" }, { name: "Willys", url: "https://www.willys.se", icon: "🔵", note: "Budget-friendly" }, { name: "Rohkost.de", url: "https://www.rohkost.de", icon: "🌱", note: "Rare protocol items" }].map(s => (
                      <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ background: S.bgDeep, border: `1px solid ${S.border}`, borderRadius: 8, padding: "10px 14px", textDecoration: "none", display: FX, gap: 8, alignItems: "center", boxShadow: S.shadowSm }}>
                        <span style={{ fontSize: 16 }}>{s.icon}</span>
                        <div><div style={{ fontSize: 12, color: S.ink, fontWeight: 700 }}>{s.name}</div><div style={{ fontSize: 10, color: S.inkDim, fontFamily: S.mono }}>{s.note}</div></div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MONITOR TAB ── */}
        {tab === "monitor" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.rust, letterSpacing: "0.16em", marginBottom: 8 }}>REAL-TIME MONITORING</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.ink }}>Post-Meal Response Tracker</h2>
              <div style={{ fontSize: 13, color: S.inkMid, marginTop: 4 }}>Log your meal, start monitoring, detect immune responses in real time.</div>
            </div>
            {!monActive && monTimeline.length === 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
                <div style={{ ...card({ padding: "20px" }) }}>
                  <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em", marginBottom: 14 }}>LOG YOUR MEAL</div>
                  <div style={{ fontSize: 12, color: S.inkDim, fontFamily: S.mono, marginBottom: 8 }}>MEAL TYPE</div>
                  <div style={{ display: FX, gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
                    {["Breakfast", "Snack", "Lunch", "Dinner", "Post-exercise"].map(m => (
                      <button key={m} onClick={() => setMonMealLabel(m)} style={{ background: monMealLabel === m ? S.goldBg : S.bgDeep, border: `1px solid ${monMealLabel === m ? S.gold : S.border}`, borderRadius: 20, padding: "5px 14px", cursor: CP, fontSize: 11, fontFamily: S.sans, color: monMealLabel === m ? S.gold : S.inkMid, fontWeight: monMealLabel === m ? 700 : 400 }}>{m}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: S.inkDim, fontFamily: S.mono, marginBottom: 8 }}>FOODS EATEN</div>
                  {monFoods.length > 0 && (
                    <div style={{ background: S.sageBg, border: `1px solid ${S.sage}30`, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                      <div style={{ fontSize: 9, color: S.sage, fontFamily: S.mono, marginBottom: 6 }}>✓ LOGGED ({monFoods.length})</div>
                      <div style={{ display: FX, flexWrap: "wrap", gap: 5 }}>
                        {monFoods.map((f, i) => {
                          const fu = f.toUpperCase();
                          const isSev = severe.some(s => fu.includes(s) || s.includes(fu.split(" ")[0]));
                          const isMod = moderate.some(s => fu.includes(s) || s.includes(fu.split(" ")[0]));
                          const col = isSev ? S.rust : isMod ? S.amber : S.sage;
                          return <span key={i} onClick={() => setMonFoods(prev => prev.filter((_, j) => j !== i))} style={{ background: S.card, border: `1px solid ${col}40`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: S.sans, color: col, cursor: CP }}>{f} ×</span>;
                        })}
                      </div>
                    </div>
                  )}
                  <input value={monFoodInput} onChange={e => setMonFoodInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && monFoodInput.trim()) { setMonFoods(prev => [...prev, monFoodInput.trim()]); setMonFoodInput(""); } }} placeholder="Type food + Enter to add" style={{ width: "100%", background: S.bgDeep, border: `1px solid ${S.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 12, color: S.ink, fontFamily: S.sans, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
                  <div style={{ display: FX, gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
                    {ROT[rotDay].protein.concat(ROT[rotDay].veg.slice(0, 3)).map(f => {
                      const added = monFoods.includes(f);
                      return <button key={f} onClick={() => setMonFoods(prev => added ? prev.filter(x => x !== f) : [...prev, f])} style={{ background: added ? S.sageBg : S.bgDeep, border: `1px solid ${added ? S.sage : S.border}`, borderRadius: 20, padding: "4px 10px", cursor: CP, fontSize: 11, fontFamily: S.sans, color: added ? S.sage : S.inkDim, fontWeight: added ? 700 : 400 }}>{added ? "✓ " : ""}{f}</button>;
                    })}
                  </div>
                  <button onClick={startMonitoring} style={{ width: "100%", background: `linear-gradient(135deg,${S.gold},${S.goldDark})`, border: "none", borderRadius: 10, padding: "13px", cursor: CP, color: "#FFF", fontSize: 13, fontFamily: S.sans, fontWeight: 700, boxShadow: `0 4px 16px ${S.gold}30` }}>Start 2-hour post-meal monitoring</button>
                </div>
                <div style={{ ...card({ padding: "18px" }) }}>
                  <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em", marginBottom: 14 }}>DATA SOURCES</div>
                  {[{ name: "Apple Watch", icon: "⌚", streams: "HR · HRV", badge: "HRV" }, { name: "Oura Ring", icon: "💍", streams: "HRV · Temp · SpO2", badge: "HRV · TEMP" }, { name: "Garmin", icon: "🏔️", streams: "HR · HRV · Sleep · Stress", badge: "HRV · SLEEP" }, { name: "Samsung Galaxy", icon: "💎", streams: "HR · HRV · SpO2 · Temp", badge: "HRV · TEMP" }, { name: "Dexcom G7", icon: "📡", streams: "Glucose · 5min intervals", badge: "GLUCOSE" }, { name: "Libre 3", icon: "💠", streams: "Glucose · 1min intervals", badge: "GLUCOSE" }].map(d => (
                    <div key={d.name} style={{ display: FX, alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${S.border}` }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{d.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: FX, alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, color: S.ink, fontFamily: S.sans }}>{d.name}</span>
                          <span style={{ fontSize: 8, background: S.goldBg, border: `1px solid ${S.gold}30`, color: S.gold, borderRadius: 4, padding: "1px 6px", fontFamily: S.mono }}>{d.badge}</span>
                        </div>
                        <div style={{ fontSize: 10, color: S.inkDim, fontFamily: S.mono }}>{d.streams}</div>
                      </div>
                      <div style={{ background: S.bgDeep, border: `1px solid ${S.border}`, borderRadius: 4, padding: "2px 8px", fontSize: 9, color: S.inkDim, fontFamily: S.mono }}>Demo</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: FX, justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ display: FX, alignItems: "center", gap: 10 }}>
                    {monActive ? <><div style={{ width: 10, height: 10, borderRadius: "50%", background: S.rust, animation: "pulse 0.8s infinite" }} /><span style={{ fontSize: 13, color: S.rust, fontFamily: S.mono, fontWeight: 700 }}>LIVE — {monMealLabel} · {currentPt?.min || 0}min</span></>
                      : <><div style={{ width: 10, height: 10, borderRadius: "50%", background: S.sage }} /><span style={{ fontSize: 13, color: S.sage, fontFamily: S.mono, fontWeight: 700 }}>COMPLETE — {monMealLabel} · 120min</span></>}
                  </div>
                  <button onClick={() => { setMonTimeline([]); setMonTick(0); setMonActive(false); setMonFoods([]); setMonSpikes([]); }} style={{ background: "none", border: `1px solid ${S.border}`, borderRadius: 7, padding: "6px 14px", cursor: CP, fontSize: 11, fontFamily: S.mono, color: S.inkDim }}>↺ New session</button>
                </div>
                {monSpikes.length > 0 && <div style={{ marginBottom: 16 }}>
                  {monSpikes.map((sp, i) => (
                    <div key={i} style={{ background: sp.level === "severe" ? S.rustBg : S.amberBg, border: `1px solid ${sp.level === "severe" ? S.rust : S.amber}30`, borderRadius: 8, padding: "10px 16px", marginBottom: 6, display: FX, gap: 10, alignItems: "center" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: sp.level === "severe" ? S.rust : S.amber, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: sp.level === "severe" ? S.rust : S.amber, fontFamily: S.sans, fontWeight: 700 }}>{sp.label} {sp.val}</span>
                      <span style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>at {sp.min}min</span>
                      {!popup && <button onClick={() => { setPopup(sp); setPopupStep(0); setPopupReactive(null); setPopupSymptoms([]); setPopupSeverity(null); setPopupAnalysis(""); }} style={{ marginLeft: "auto", background: "none", border: `1px solid ${sp.level === "severe" ? S.rust : S.amber}50`, borderRadius: 6, padding: "4px 10px", cursor: CP, fontSize: 11, fontFamily: S.mono, color: sp.level === "severe" ? S.rust : S.amber }}>Log →</button>}
                    </div>
                  ))}
                </div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  <MiniChart pts={visiblePts} key_="hr" color={S.rust} label="Heart Rate" unit="bpm" />
                  <MiniChart pts={visiblePts} key_="hrv" color="#9B60C0" label="HRV" unit="ms" />
                  <MiniChart pts={visiblePts} key_="glucose" color={S.amber} label="Glucose" unit="mg/dL" />
                  <MiniChart pts={visiblePts} key_="temp" color={S.gold} label="Body Temp" unit="°C" />
                </div>
                {currentPt && <div style={{ ...card({ padding: "14px 18px", display: FX, gap: 24, flexWrap: "wrap" }) }}>
                  {[["SpO2", currentPt.spo2, "%", S.teal, v => v >= 96], ["HR", currentPt.hr, "bpm", S.rust, v => v < 90], ["HRV", currentPt.hrv, "ms", "#9B60C0", v => v > 35], ["Glucose", currentPt.glucose, "mg/dL", S.amber, v => v < 130], ["Temp", currentPt.temp, "°C", S.gold, v => v < 37.1]].map(([label, val, unit, color, good]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: S.inkDim, fontFamily: S.mono, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: good(val) ? color : S.rust, fontFamily: S.mono }}>{val}</div>
                      <div style={{ fontSize: 9, color: S.inkDim, fontFamily: S.mono }}>{unit}</div>
                    </div>
                  ))}
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: S.inkDim, fontFamily: S.mono }}>Time remaining</div>
                    <div style={{ fontSize: 16, color: S.gold, fontWeight: 700, fontFamily: S.mono }}>{Math.max(0, 120 - (currentPt?.min || 0))}min</div>
                  </div>
                </div>}
                {diary.length > 0 && <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 9, fontFamily: S.mono, color: S.inkDim, letterSpacing: "0.12em", marginBottom: 10 }}>REACTION DIARY</div>
                  {diary.slice(0, 4).map(e => (
                    <div key={e.id} style={{ ...card({ marginBottom: 8, padding: "12px 16px", borderLeft: `3px solid ${e.flagClinic ? S.rust : S.border}` }) }}>
                      <div style={{ display: FX, justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: S.ink, fontWeight: 700 }}>{e.meal}</span>
                        <span style={{ fontSize: 10, color: S.inkDim, fontFamily: S.mono }}>{new Date(e.ts).toLocaleDateString("en-SE")}</span>
                      </div>
                      <div style={{ display: FX, gap: 6, flexWrap: "wrap" }}>
                        {e.spike && <span style={{ fontSize: 11, background: e.spike.level === "severe" ? S.rustBg : S.amberBg, color: e.spike.level === "severe" ? S.rust : S.amber, border: `1px solid ${e.spike.level === "severe" ? S.rust : S.amber}30`, borderRadius: 20, padding: "2px 8px", fontFamily: S.mono }}>{e.spike.label}</span>}
                        {e.flagClinic && <span style={{ fontSize: 11, color: S.rust, fontFamily: S.mono }}>⚠️ Flagged</span>}
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
            )}
          </div>
        )}

        {/* ── FOOD CHECK TAB ── */}
        {tab === "lookup" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.16em", marginBottom: 8 }}>FOOD LOOKUP</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.ink }}>Is this food safe?</h2>
            </div>
            <input value={foodQ} onChange={e => setFoodQ(e.target.value)} placeholder="Search — salmon, quinoa, avocado…" style={{ width: "100%", background: S.card, border: `1.5px solid ${foodQ ? S.gold : S.border}`, borderRadius: 12, padding: "14px 18px", fontSize: 15, color: S.ink, fontFamily: S.sans, outline: "none", boxSizing: "border-box", marginBottom: 16, boxShadow: S.shadowSm }} />
            {foodResults.map(({ food, level }) => {
              const cols = { severe: S.rust, moderate: S.amber, mild: S.sand };
              const bgs = { severe: S.rustBg, moderate: S.amberBg, mild: S.sandBg };
              const periods = { severe: "Avoid ~6 months", moderate: "Avoid ~3 months", mild: "Avoid ~2 months" };
              const c = cols[level]; const bg = bgs[level];
              return (
                <div key={food} style={{ background: bg, border: `1px solid ${c}25`, borderLeft: `3px solid ${c}`, borderRadius: 10, padding: "13px 16px", display: FX, justifyContent: "space-between", marginBottom: 8, boxShadow: S.shadowSm }}>
                  <div><div style={{ fontSize: 15, color: S.ink, fontFamily: S.serif, fontWeight: 500 }}>{food}</div><div style={{ fontSize: 11, color: S.inkMid, fontFamily: S.mono, textTransform: "capitalize", marginTop: 2 }}>{level} reactor</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: c, fontWeight: 700, fontFamily: S.mono }}>AVOID</div><div style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>{periods[level]}</div></div>
                </div>
              );
            })}
            {foodQ.length > 1 && foodResults.length === 0 && (
              <div style={{ background: S.sageBg, border: `1px solid ${S.sage}30`, borderLeft: `3px solid ${S.sage}`, borderRadius: 10, padding: "14px 18px", boxShadow: S.shadowSm }}>
                <div style={{ fontSize: 15, color: S.ink, fontFamily: S.serif, fontWeight: 500, marginBottom: 4 }}>✓ Not in reactive lists</div>
                <div style={{ fontSize: 12, color: S.sage, fontFamily: S.mono }}>"{foodQ}" does not appear in your predicted reactive foods. If it is a whole unprocessed food, it is likely safe for your rotation.</div>
              </div>
            )}
          </div>
        )}

        {/* ── CHAT TAB ── */}
        {tab === "chat" && (
          <div style={{ display: FX, flexDirection: "column", height: "calc(100vh - 200px)" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontFamily: S.mono, color: S.gold, letterSpacing: "0.16em", marginBottom: 6 }}>CLINICAL AI ASSISTANT</div>
              <h2 style={{ fontFamily: S.serif, fontSize: 24, fontWeight: 400, color: S.ink }}>Ask Mario</h2>
            </div>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 14, display: FX, flexDirection: "column", gap: 14 }}>
              {chatMsgs.map((m, i) => (
                <div key={i} style={{ display: FX, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${S.gold},${S.goldDark})`, display: FX, alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 10, marginTop: 2, color: "#FFF", fontFamily: S.serif, fontWeight: 600, boxShadow: `0 2px 8px ${S.gold}30` }}>M</div>
                  )}
                  <div style={{ maxWidth: "72%", background: m.role === "user" ? S.goldBg : S.card, border: `1px solid ${m.role === "user" ? S.gold + "30" : S.border}`, borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px", padding: "13px 16px", fontSize: 13, lineHeight: 1.85, color: S.ink, fontFamily: S.sans, boxShadow: S.shadowSm }}>{m.content}</div>
                </div>
              ))}
              {chatLoad && <div style={{ display: FX, gap: 5, paddingLeft: 40 }}><DotLoader /></div>}
              <div ref={chatEnd} />
            </div>
            <div style={{ display: FX, gap: 8 }}>
              <input value={chatIn} onChange={e => setChatIn(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()} placeholder="Ask about your protocol, foods, symptoms, meal ideas…" style={{ flex: 1, background: S.card, border: `1.5px solid ${chatIn ? S.gold : S.border}`, borderRadius: 10, padding: "13px 16px", fontSize: 13, color: S.ink, fontFamily: S.sans, outline: "none", boxShadow: S.shadowSm }} />
              <button onClick={sendChat} disabled={chatLoad} style={{ background: chatLoad ? S.bgDeep : `linear-gradient(135deg,${S.gold},${S.goldDark})`, border: "none", color: chatLoad ? S.inkDim : "#FFF", borderRadius: 10, padding: "13px 22px", cursor: chatLoad ? "not-allowed" : CP, fontSize: 13, fontFamily: S.sans, fontWeight: 700, boxShadow: chatLoad ? "none" : `0 4px 16px ${S.gold}30` }}>Send</button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${S.border}`, padding: "14px 24px", display: FX, justifyContent: "space-between", alignItems: "center", marginTop: 20, background: S.bgDeep }}>
        <div style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>
          <span style={{ color: S.inkMid, fontWeight: 700 }}>meet mario</span> · MediBalans AB · Karlavägen 89, Stockholm
        </div>
        <div style={{ display: FX, gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: S.gold, fontFamily: S.mono, fontWeight: 700, background: S.goldBg, border: `1px solid ${S.gold}30`, borderRadius: 4, padding: "3px 8px", letterSpacing: "0.1em" }}>PATENT PENDING · SE 2615203-3</span>
          <span style={{ fontSize: 9, color: S.inkDim, fontFamily: S.mono }}>AI-driven clinical decision support · Global Constraint Rule</span>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ─── TEST UPLOAD SCREEN ────────────────────────────────────────────────────────
function UploadScreen({ formData, onComplete }) {
  const [uploads, setUploads] = useState({
    alcat:    { status: "idle", file: null, summary: null, error: null },
    cma:      { status: "idle", file: null, summary: null, error: null },
    genova:   { status: "idle", file: null, summary: null, error: null },
    bloodwork:{ status: "idle", file: null, summary: null, error: null },
    methyldetox:{ status: "idle", file: null, summary: null, error: null },
  });

  const setUpload = (key, patch) => setUploads(p => ({ ...p, [key]: { ...p[key], ...patch } }));

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const parseFile = async (key, file) => {
    setUpload(key, { status: "parsing", file, error: null });
    try {
      const b64 = await toBase64(file);
      const prompts = {
        alcat: "Extract all food reactivity results from this ALCAT report. Return JSON: { severe: [], moderate: [], mild: [], markers: {}, reportDate: '' }. List food names in UPPERCASE. Only return valid JSON, no other text.",
        cma: "Extract all cellular micronutrient results from this CMA report. Return JSON: { nutrients: [{name, level, status, unit}], reportDate: '' }. Status should be 'deficient', 'low', 'normal', or 'high'. Only return valid JSON.",
        genova: "Extract key findings from this Genova Diagnostics report. Return JSON: { tests: [{name, findings: []}], reportDate: '' }. Only return valid JSON.",
        bloodwork: "Extract key blood markers from this report. Return JSON: { markers: [{name, value, unit, range, status}], reportDate: '' }. Status: 'low', 'normal', 'high'. Only return valid JSON.",
        methyldetox: "Extract methylation gene variants from this report. Return JSON: { genes: [{gene, variant, rsid, impact}], reportDate: '' }. Only return valid JSON.",
      };
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
            { type: "text", text: prompts[key] }
          ]}]
        })
      });
      const d = await res.json();
      const text = (d.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setUpload(key, { status: "done", summary: parsed, error: null });
    } catch(e) {
      setUpload(key, { status: "error", error: "Could not parse this file. You can skip and continue.", summary: null });
    }
  };

  const CARDS = [
    { key: "alcat",      icon: "🧬", label: "ALCAT Food Sensitivity", sub: "Cell Science Systems PDF — 250 or 483 foods", color: "#C87030" },
    { key: "cma",        icon: "⚗️",  label: "CMA / CNA",             sub: "Cellular Micronutrient Analysis PDF",         color: "#5080A8" },
    { key: "genova",     icon: "🔬", label: "Genova Diagnostics",    sub: "GI360, DUTCH, NutrEval or similar",           color: "#508060" },
    { key: "bloodwork",  icon: "🩸", label: "Standard Blood Work",   sub: "CBC, thyroid, vitamins, metabolic panel",     color: "#A04040" },
    { key: "methyldetox",icon: "🧠", label: "MethylDetox / Genomics",sub: "38-gene methylation panel or WGS report",     color: "#7060A8" },
  ];

  const doneCount = Object.values(uploads).filter(u => u.status === "done").length;

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.ink, fontFamily: S.sans }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${S.gold}08 0%, transparent 60%)`, zIndex: 0 }} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px 80px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontFamily: S.mono, letterSpacing: "0.2em", color: S.goldDim, marginBottom: 12 }}>STEP 2 OF 2 · TEST RESULTS</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: S.ink, lineHeight: 1.2, marginBottom: 10 }}>Upload your existing results</div>
          <div style={{ fontSize: 15, color: S.inkDim, lineHeight: 1.7 }}>
            If you've already done any of these tests, upload the PDF now. Mario will read them automatically and personalise your protocol accordingly.
            <span style={{ color: S.inkMid }}> All fields are optional — skip anything you don't have.</span>
          </div>
        </div>

        {/* Upload cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {CARDS.map(({ key, icon, label, sub, color }) => {
            const u = uploads[key];
            return (
              <div key={key} style={{ background: S.card, border: `1.5px solid ${u.status === "done" ? color + "60" : u.status === "error" ? "#A04040" : S.border}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                {/* Card header */}
                <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: color + "15", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: S.ink, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>{sub}</div>
                  </div>
                  {/* Status */}
                  {u.status === "idle" && (
                    <label style={{ cursor: "pointer", background: color + "15", border: `1px solid ${color}40`, borderRadius: 8, padding: "7px 14px", fontSize: 12, color, fontWeight: 600, flexShrink: 0 }}>
                      Upload PDF
                      <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => e.target.files[0] && parseFile(key, e.target.files[0])} />
                    </label>
                  )}
                  {u.status === "parsing" && (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: `mm-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                    </div>
                  )}
                  {u.status === "done" && <div style={{ fontSize: 18, color: "#5A9050" }}>✓</div>}
                  {u.status === "error" && (
                    <label style={{ cursor: "pointer", fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>
                      Retry
                      <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => e.target.files[0] && parseFile(key, e.target.files[0])} />
                    </label>
                  )}
                </div>

                {/* Summary on success */}
                {u.status === "done" && u.summary && (
                  <div style={{ borderTop: `1px solid ${S.border}`, padding: "12px 18px", background: S.bgDeep }}>
                    {key === "alcat" && u.summary.severe && (
                      <div style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono, lineHeight: 1.8 }}>
                        <span style={{ color: "#C87030", fontWeight: 600 }}>Severe: </span>{(u.summary.severe || []).slice(0,6).join(", ")}{(u.summary.severe||[]).length > 6 ? ` +${u.summary.severe.length - 6} more` : ""}<br/>
                        <span style={{ color: "#C09030", fontWeight: 600 }}>Moderate: </span>{(u.summary.moderate || []).length} foods &nbsp;·&nbsp;
                        <span style={{ color: "#8A9830", fontWeight: 600 }}>Mild: </span>{(u.summary.mild || []).length} foods
                      </div>
                    )}
                    {key === "cma" && u.summary.nutrients && (
                      <div style={{ fontSize: 11, color: S.inkDim, fontFamily: S.mono, lineHeight: 1.8 }}>
                        {(u.summary.nutrients || []).filter(n => n.status === "deficient" || n.status === "low").slice(0,4).map((n,i) => (
                          <span key={i}><span style={{ color: "#C06050" }}>{n.name}</span> {n.status}{i < 3 ? " · " : ""}</span>
                        ))}
                        {(u.summary.nutrients || []).filter(n => n.status === "deficient" || n.status === "low").length === 0 && <span style={{ color: "#5A9050" }}>No deficiencies detected</span>}
                      </div>
                    )}
                    {(key === "genova" || key === "bloodwork" || key === "methyldetox") && (
                      <div style={{ fontSize: 11, color: "#5A9050", fontFamily: S.mono }}>✓ Parsed successfully — Mario will reference this in your protocol</div>
                    )}
                  </div>
                )}

                {/* Error */}
                {u.status === "error" && (
                  <div style={{ borderTop: `1px solid ${S.border}`, padding: "10px 18px", background: "#180E0E" }}>
                    <div style={{ fontSize: 11, color: "#A06050", fontFamily: S.mono }}>{u.error}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue */}
        <button onClick={() => onComplete(uploads)} style={{ width: "100%", padding: "16px", background: S.gold, border: "none", borderRadius: 12, color: "#0e0c09", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: S.sans, letterSpacing: "-0.01em" }}>
          {doneCount > 0 ? `Continue with ${doneCount} test result${doneCount > 1 ? "s" : ""} →` : "Skip — continue without uploads →"}
        </button>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: S.inkDim, fontFamily: S.mono }}>
          You can always upload results later from the dashboard
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState("onboarding");
  const [patientProtocol, setPatientProtocol] = useState(null);
  const [patientFormData, setPatientFormData] = useState(null);
  const [patientUploads, setPatientUploads] = useState(null);
  const handleOnboardingComplete = ({ formData, protocol }) => {
    setPatientFormData(formData); setPatientProtocol(protocol); setStage("upload");
  };
  const handleUploadsComplete = (uploads) => {
    setPatientUploads(uploads); setStage("bridge");
  };
  const handleEnterDashboard = () => setStage("dashboard");
  const handleReset = () => { setStage("onboarding"); setPatientProtocol(null); setPatientFormData(null); setPatientUploads(null); };
  if (stage === "onboarding") return <Onboarding onComplete={handleOnboardingComplete} />;
  if (stage === "upload") return <UploadScreen formData={patientFormData} onComplete={handleUploadsComplete} />;
  if (stage === "bridge") return <ProtocolBridge formData={patientFormData} protocol={patientProtocol} onEnterDashboard={handleEnterDashboard} />;
  return <Dashboard patientData={{ uploads: patientUploads }} protocol={patientProtocol} formData={patientFormData} onReset={handleReset} />;
}
