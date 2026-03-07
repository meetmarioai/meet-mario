"use client";
import { useState } from "react";

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:   "#FAF8F4",
  w1:   "#F5F0E8",
  w3:   "#E8E0D4",
  w4:   "#C8BBA8",
  w5:   "#9A8570",
  w7:   "#2C2C2C",
  gold: "#9A7240",
  rg:   "#C4887A",
  ok:   "#5A8A6A",
  err:  "#C4544A",
};

const fonts = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', Arial, sans-serif",
  mono:  "'IBM Plex Mono', 'Courier New', monospace",
};

// ── Population risk data (top reactors for predicted profile) ────────────────
const POP_RISK = [
  { name: "Walnut",     severe: 36.1, n: 180 },
  { name: "Almond",     severe: 35.0, n: 506 },
  { name: "Sugar",      severe: 34.9, n: 195 },
  { name: "Sunflower",  severe: 34.1, n: 182 },
  { name: "Yeast",      severe: 30.8, n: 506 },
  { name: "Hazelnut",   severe: 30.6, n: 291 },
  { name: "Brazil nut", severe: 28.9, n: 485 },
  { name: "Capers",     severe: 26.8, n: 456 },
  { name: "Sesame",     severe: 25.8, n: 178 },
  { name: "Cumin",      severe: 24.5, n: 506 },
  { name: "Cocoa",      severe: 23.7, n: 447 },
  { name: "Beef",       severe: 21.6, n: 501 },
  { name: "Corn",       severe: 21.6, n: 505 },
  { name: "Garlic",     severe: 20.9, n: 297 },
  { name: "Chickpea",   severe: 20.1, n: 502 },
  { name: "Broccoli",   severe: 18.4, n: 1028 },
  { name: "Coconut",    severe: 18.2, n: 413 },
  { name: "Coffee",     severe: 13.2, n: 371 },
  { name: "Mushroom",   severe: 13.4, n: 506 },
  { name: "Salmon",     severe: 11.6, n: 502 },
];

// Symptom -> likely reactors mapping
function getPredictedReactors(symptoms, diet) {
  let scores = {};
  POP_RISK.forEach(f => { scores[f.name] = f.severe; });

  // Boost based on symptoms
  if (symptoms.includes("gut"))       { scores["Yeast"] += 15; scores["Garlic"] += 10; scores["Corn"] += 8; }
  if (symptoms.includes("skin"))      { scores["Walnut"] += 10; scores["Almond"] += 10; scores["Cocoa"] += 8; }
  if (symptoms.includes("brain_fog")) { scores["Sugar"] += 12; scores["Yeast"] += 10; scores["Beef"] += 6; }
  if (symptoms.includes("fatigue"))   { scores["Sugar"] += 10; scores["Gluten"] = 20; scores["Corn"] += 8; }
  if (symptoms.includes("weight"))    { scores["Sugar"] += 15; scores["Corn"] += 10; scores["Beef"] += 8; }
  if (symptoms.includes("hormonal"))  { scores["Soy"] = 25; scores["Corn"] += 12; scores["Sugar"] += 10; }

  // Boost based on diet history
  if (diet.includes("high_meat"))     { scores["Beef"] += 10; }
  if (diet.includes("vegetarian"))    { scores["Soy"] = (scores["Soy"] || 0) + 15; scores["Almond"] += 8; }
  if (diet.includes("high_dairy"))    { scores["Yeast"] += 8; }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, severe]) => {
      const pop = POP_RISK.find(f => f.name === name);
      return { name, severe: Math.min(severe, 99), n: pop?.n || 200 };
    });
}

// ── Components ───────────────────────────────────────────────────────────────
function Wordmark() {
  return (
    <div style={{ fontFamily: fonts.serif, fontSize: 20, letterSpacing: "0.04em", color: T.w7 }}>
      meet <span style={{ color: T.rg }}>&#9673;</span> mario
      <span style={{ display: "block", fontSize: 11, color: T.gold, letterSpacing: "0.1em", marginTop: 2, fontFamily: fonts.mono }}>
        MEDIBALANS AB
      </span>
    </div>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div style={{ width: "100%", height: 2, background: T.w3, borderRadius: 1, margin: "24px 0 8px" }}>
      <div style={{ height: "100%", width: `${(step / total) * 100}%`, background: T.rg, borderRadius: 1, transition: "width 0.4s ease" }} />
    </div>
  );
}

function StepLabel({ step, total, label }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.w4, letterSpacing: "0.1em" }}>
        STEP {step} OF {total}
      </span>
      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: T.gold, letterSpacing: "0.08em" }}>
        {label}
      </span>
    </div>
  );
}

function Q({ children }) {
  return <h2 style={{ fontFamily: fonts.serif, fontSize: 22, fontWeight: "normal", color: T.w7, margin: "0 0 8px", lineHeight: 1.4 }}>{children}</h2>;
}

function Sub({ children }) {
  return <p style={{ fontFamily: fonts.sans, fontSize: 14, color: T.w5, margin: "0 0 28px", lineHeight: 1.6 }}>{children}</p>;
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.w5, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          border: "none", borderBottom: `1px solid ${T.w3}`,
          background: "transparent", padding: "10px 0",
          fontFamily: fonts.serif, fontSize: 16, color: T.w7,
          outline: "none",
        }}
      />
    </div>
  );
}

function ChipGroup({ options, selected, onToggle, single }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
      {options.map(opt => {
        const active = single ? selected === opt.id : selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            style={{
              padding: "9px 16px", borderRadius: 20,
              border: `1px solid ${active ? T.gold : T.w3}`,
              background: active ? T.gold : "transparent",
              color: active ? "#FAF8F4" : T.w5,
              fontFamily: fonts.sans, fontSize: 13, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function NextBtn({ onClick, label = "Continue", disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "16px",
        background: disabled ? T.w3 : T.gold,
        color: disabled ? T.w4 : "#FAF8F4",
        border: "none", borderRadius: 2,
        fontFamily: fonts.serif, fontSize: 15,
        letterSpacing: "0.04em", cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s",
      }}
    >
      {label}
    </button>
  );
}

// ── Main onboarding component ─────────────────────────────────────────────────
export default function OnboardingPage() {
  const TOTAL_STEPS = 7;
  const [step, setStep]       = useState(1);
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  // Form state
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [dob, setDob]             = useState("");
  const [symptoms, setSymptoms]   = useState([]);
  const [diet, setDiet]           = useState([]);
  const [tests, setTests]         = useState([]);
  const [meds, setMeds]           = useState("");
  const [supplements, setSupps]   = useState("");
  const [goals, setGoals]         = useState([]);
  const [consent, setConsent]     = useState(false);

  const toggleArr = (arr, setArr, id) => {
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  };

  const SYMPTOM_OPTS = [
    { id: "fatigue",   label: "Fatigue / low energy" },
    { id: "gut",       label: "Gut / bloating / IBS" },
    { id: "skin",      label: "Skin / eczema / rash" },
    { id: "weight",    label: "Weight / metabolism" },
    { id: "brain_fog", label: "Brain fog / focus" },
    { id: "hormonal",  label: "Hormonal / thyroid" },
    { id: "joints",    label: "Joint / muscle pain" },
    { id: "sleep",     label: "Sleep / recovery" },
    { id: "mood",      label: "Mood / anxiety" },
    { id: "autoimmune",label: "Autoimmune condition" },
  ];

  const DIET_OPTS = [
    { id: "standard",    label: "Standard / mixed" },
    { id: "vegetarian",  label: "Vegetarian" },
    { id: "vegan",       label: "Vegan" },
    { id: "high_meat",   label: "High meat / carnivore" },
    { id: "high_dairy",  label: "High dairy" },
    { id: "gluten_free", label: "Gluten-free" },
    { id: "low_carb",    label: "Low carb / keto" },
    { id: "mediterranean", label: "Mediterranean" },
  ];

  const TEST_OPTS = [
    { id: "alcat",      label: "ALCAT (previous)" },
    { id: "bloodwork",  label: "Standard bloodwork" },
    { id: "genetic",    label: "Genetic / DNA test" },
    { id: "microbiome", label: "Microbiome / GI-MAP" },
    { id: "dutch",      label: "DUTCH hormone panel" },
    { id: "werlabs",    label: "Werlabs / Unilabs" },
    { id: "none",       label: "None yet" },
  ];

  const GOAL_OPTS = [
    { id: "weight",      label: "Weight management" },
    { id: "energy",      label: "Energy & vitality" },
    { id: "longevity",   label: "Longevity / anti-aging" },
    { id: "autoimmune",  label: "Autoimmune reduction" },
    { id: "gut_healing", label: "Gut healing" },
    { id: "hormones",    label: "Hormonal balance" },
    { id: "cognition",   label: "Cognition / brain" },
    { id: "athletics",   label: "Athletic performance" },
  ];

  async function submit() {
    if (!consent) return;
    setSaving(true);
    setError("");

    const predictedReactors = getPredictedReactors(symptoms, diet);
    const purgeAfter = new Date();
    purgeAfter.setDate(purgeAfter.getDate() + 30);

    try {
      // Save onboarding to Supabase
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email,
          dob,
          symptoms,
          diet_history: diet,
          previous_tests: tests,
          medications: meds,
          supplements,
          goals,
          predicted_reactors: predictedReactors,
          purge_after: purgeAfter.toISOString(),
          consent_gdpr: true,
          consent_at: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      // Trigger email sequence
      await fetch("/api/email/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: data.patient_id || null,
          patient_email: email,
          patient_name: name,
          predicted_reactors: predictedReactors,
          symptom_profile: { symptoms, goals, diet },
        }),
      });

      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    const firstName = name.split(" ")[0];
    const predicted = getPredictedReactors(symptoms, diet);
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <Wordmark />
          <div style={{ marginTop: 48 }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.ok, letterSpacing: "0.12em", marginBottom: 16 }}>INTAKE COMPLETE</div>
            <h2 style={{ fontFamily: fonts.serif, fontSize: 26, fontWeight: "normal", color: T.w7, margin: "0 0 16px" }}>
              {firstName}, your clinical profile is ready.
            </h2>
            <p style={{ fontFamily: fonts.sans, fontSize: 15, color: T.w5, lineHeight: 1.7, margin: "0 0 32px" }}>
              Based on your profile, I have cross-referenced your symptoms against our database of 1,042 ALCAT patient reports. Your personalised protocol starts today.
            </p>

            <div style={{ background: T.w1, borderRadius: 4, padding: "24px 28px", marginBottom: 28 }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: T.gold, letterSpacing: "0.1em", marginBottom: 16 }}>
                YOUR PREDICTED HIGH-REACTIVITY FOODS
              </div>
              {predicted.slice(0, 6).map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.w3}`, fontSize: 13 }}>
                  <span style={{ fontFamily: fonts.sans, color: T.w7 }}>{f.name}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: T.rg }}>{f.severe}% severe reactivity</span>
                </div>
              ))}
              <div style={{ fontFamily: fonts.sans, fontSize: 11, color: T.w4, marginTop: 12 }}>
                Population data only. ALCAT testing confirms your personal profile.
              </div>
            </div>

            <div style={{ background: "#FDF6EC", borderLeft: `3px solid ${T.gold}`, padding: "16px 20px", marginBottom: 32, borderRadius: 2 }}>
              <div style={{ fontFamily: fonts.sans, fontSize: 14, color: "#5C4A2A", lineHeight: 1.7 }}>
                Check your inbox at <strong>{email}</strong>. You will receive your full protocol and clinical guidance over the next 21 days.
              </div>
            </div>

            <a
              href="/dashboard"
              style={{
                display: "block", width: "100%", boxSizing: "border-box",
                padding: "16px", textAlign: "center",
                background: T.gold, color: "#FAF8F4",
                textDecoration: "none", borderRadius: 2,
                fontFamily: fonts.serif, fontSize: 15, letterSpacing: "0.04em",
              }}
            >
              Open your dashboard
            </a>

            <div style={{ fontFamily: fonts.sans, fontSize: 11, color: T.w4, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
              Your personal data will be anonymised after 30 days per GDPR Article 89.<br />
              To request immediate deletion, email info@medibalans.se.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step renderer ────────────────────────────────────────────────────────
  const STEP_LABELS = ["", "IDENTITY", "SYMPTOMS", "DIET HISTORY", "PREVIOUS TESTS", "MEDICATIONS", "GOALS", "CONSENT"];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <Wordmark />
        <ProgressBar step={step} total={TOTAL_STEPS} />
        <StepLabel step={step} total={TOTAL_STEPS} label={STEP_LABELS[step]} />

        {/* STEP 1 — Identity */}
        {step === 1 && (
          <div>
            <Q>Who are you?</Q>
            <Sub>Your personal information is stored securely and anonymised after 30 days.</Sub>
            <Input label="FULL NAME" value={name} onChange={e => setName(e.target.value)} placeholder="Christina Wohltahrt" />
            <Input label="EMAIL ADDRESS" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com" />
            <Input label="DATE OF BIRTH" value={dob} onChange={e => setDob(e.target.value)} type="date" />
            <NextBtn onClick={() => setStep(2)} disabled={!name || !email || !dob} />
          </div>
        )}

        {/* STEP 2 — Symptoms */}
        {step === 2 && (
          <div>
            <Q>What brings you here?</Q>
            <Sub>Select all symptoms you experience regularly. This shapes your predicted reactivity profile.</Sub>
            <ChipGroup options={SYMPTOM_OPTS} selected={symptoms} onToggle={id => toggleArr(symptoms, setSymptoms, id)} />
            <NextBtn onClick={() => setStep(3)} disabled={symptoms.length === 0} />
          </div>
        )}

        {/* STEP 3 — Diet */}
        {step === 3 && (
          <div>
            <Q>How do you currently eat?</Q>
            <Sub>Your diet history helps us identify likely sensitisation patterns.</Sub>
            <ChipGroup options={DIET_OPTS} selected={diet} onToggle={id => toggleArr(diet, setDiet, id)} />
            <NextBtn onClick={() => setStep(4)} disabled={diet.length === 0} />
          </div>
        )}

        {/* STEP 4 — Previous tests */}
        {step === 4 && (
          <div>
            <Q>Have you done any of these tests?</Q>
            <Sub>Previous results help us calibrate your protocol starting point.</Sub>
            <ChipGroup options={TEST_OPTS} selected={tests} onToggle={id => toggleArr(tests, setTests, id)} />
            <NextBtn onClick={() => setStep(5)} disabled={tests.length === 0} />
          </div>
        )}

        {/* STEP 5 — Medications & supplements */}
        {step === 5 && (
          <div>
            <Q>Current medications and supplements?</Q>
            <Sub>List anything you take regularly. Certain medications interact with elimination protocols.</Sub>
            <Input label="MEDICATIONS" value={meds} onChange={e => setMeds(e.target.value)} placeholder="e.g. levothyroxine 50mcg, metformin" />
            <Input label="SUPPLEMENTS" value={supplements} onChange={e => setSupps(e.target.value)} placeholder="e.g. vitamin D3, magnesium, omega-3" />
            <NextBtn onClick={() => setStep(6)} label="Continue" />
          </div>
        )}

        {/* STEP 6 — Goals */}
        {step === 6 && (
          <div>
            <Q>What are your primary goals?</Q>
            <Sub>Your goals determine how we weight the protocol recommendations.</Sub>
            <ChipGroup options={GOAL_OPTS} selected={goals} onToggle={id => toggleArr(goals, setGoals, id)} />
            <NextBtn onClick={() => setStep(7)} disabled={goals.length === 0} />
          </div>
        )}

        {/* STEP 7 — Consent */}
        {step === 7 && (
          <div>
            <Q>One last thing.</Q>
            <Sub>We need your consent before we can process your clinical data.</Sub>

            <div style={{ background: T.w1, borderRadius: 4, padding: "20px 24px", marginBottom: 28, fontSize: 13, fontFamily: fonts.sans, color: T.w5, lineHeight: 1.8 }}>
              <strong style={{ color: T.w7, display: "block", marginBottom: 8 }}>Data processing agreement</strong>
              MediBalans AB will store your personal data for up to 30 days to deliver your clinical protocol and email sequence. After 30 days, your name and email will be permanently deleted. Anonymised clinical patterns (symptoms, diet, goals) may be retained for medical research under GDPR Article 89. You may request immediate deletion at any time by emailing info@medibalans.se.
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: 32 }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                style={{ marginTop: 3, accentColor: T.gold, width: 16, height: 16 }}
              />
              <span style={{ fontFamily: fonts.sans, fontSize: 14, color: T.w7, lineHeight: 1.6 }}>
                I consent to MediBalans AB processing my data as described above, and I confirm I am 18 years or older.
              </span>
            </label>

            {error && (
              <div style={{ background: "#FEF0EF", border: `1px solid ${T.err}`, borderRadius: 4, padding: "12px 16px", marginBottom: 20, fontFamily: fonts.sans, fontSize: 13, color: T.err }}>
                {error}
              </div>
            )}

            <NextBtn
              onClick={submit}
              label={saving ? "Processing..." : "Start my protocol"}
              disabled={!consent || saving}
            />
          </div>
        )}

        {/* Back navigation */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", fontFamily: fonts.sans, fontSize: 13, color: T.w4, cursor: "pointer" }}
          >
            &larr; Back
          </button>
        )}
      </div>
    </div>
  );
}
