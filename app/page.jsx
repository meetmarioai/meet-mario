"use client"
import { useState, useRef, useEffect, useCallback } from "react";
import { buildMarioSystemPrompt } from "../lib/marioSystemPrompt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── DESIGN SYSTEM ─────────────────────────────────────────────────────────────
const T = {
  w:    "#F7F4F0", w1: "#F1EDE7", w2: "#E8E2DA", w3: "#D8D0C4",
  w4:   "#B8ACA0", w5: "#8A7E72", w6: "#4A4038", w7: "#1C1510",
  rg:   "#C4887A", rg2: "#9A6255", rg3: "#DEB0A4", rgBg: "#F8F0EE",
  err:  "#B85040", ok: "#6A9060", warn: "#B88040",
  dark: "#18120E", dark2: "#221A14",
};
const fonts = {
  brand: "'EB Garamond', Georgia, serif",
  serif: "'EB Garamond', Georgia, serif",
  sans:  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono:  "'SF Mono', ui-monospace, Menlo, 'Fira Code', monospace",
};

// ── GEO-ADAPTIVE STORES ────────────────────────────────────────────────────────
const STORES = {
  SE: [
    { name:"ICA",             url:"https://www.ica.se/handla",       search:"https://www.ica.se/handla/search?q=" },
    { name:"Matsmart",        url:"https://www.matsmart.se",          search:"https://www.matsmart.se/search?q=" },
    { name:"Willys",          url:"https://www.willys.se",            search:"https://www.willys.se/search?q=" },
    { name:"Coop",            url:"https://www.coop.se/handla",       search:"https://www.coop.se/handla/sok?q=" },
    { name:"Nordic Superfood",url:"https://nordicsuperfood.se",       search:"https://nordicsuperfood.se/?s=" },
  ],
  US: [
    { name:"Whole Foods",     url:"https://www.wholefoodsmarket.com", search:"https://www.wholefoodsmarket.com/search?text=" },
    { name:"Thrive Market",   url:"https://thrivemarket.com",         search:"https://thrivemarket.com/search?keywords=" },
    { name:"Amazon Fresh",    url:"https://www.amazon.com/fmc/m/30000649", search:"https://www.amazon.com/s?k=" },
    { name:"Instacart",       url:"https://www.instacart.com",        search:"https://www.instacart.com/products/search?q=" },
  ],
  GB: [
    { name:"Ocado",           url:"https://www.ocado.com",            search:"https://www.ocado.com/search?entry=" },
    { name:"Waitrose",        url:"https://www.waitrose.com",         search:"https://www.waitrose.com/ecom/products/search?searchTerm=" },
    { name:"Holland & Barrett",url:"https://www.hollandandbarrett.com",search:"https://www.hollandandbarrett.com/shop/search?q=" },
  ],
  DE: [
    { name:"Rohkost.de",      url:"https://www.rohkost.de",           search:"https://www.rohkost.de/search?q=" },
    { name:"Rewe",            url:"https://www.rewe.de",              search:"https://www.rewe.de/suche/?search=" },
    { name:"Amazon.de",       url:"https://www.amazon.de",            search:"https://www.amazon.de/s?k=" },
  ],
};

// ── CLINICAL DATA ──────────────────────────────────────────────────────────────
const SYMPTOM_CATS = {
  digestive: { label:"Digestive",   items:["Bloating","Cramping","Nausea","Gas","Reflux","Loose stools","Stomach pain"] },
  skin:      { label:"Skin",        items:["Flushing","Itching","Rash","Hives","Puffiness","Swelling"] },
  neuro:     { label:"Neurological",items:["Brain fog","Headache","Dizziness","Fatigue spike","Mood drop","Anxiety"] },
  joints:    { label:"Joints/Muscles",items:["Joint stiffness","Muscle aches","Back pain","Neck tension","Swollen fingers"] },
  cardiac:   { label:"Cardiac/Resp",items:["Heart racing","Shortness of breath","Chest tightness","Sinus congestion","Runny nose"] },
};

const CUISINES = [
  { id:"mediterranean", label:"Mediterranean", desc:"Olive oil · herbs · fish" },
  { id:"french",        label:"French",        desc:"Bistro — duck, lentils" },
  { id:"swedish",       label:"Swedish",       desc:"Nordic fish, root veg" },
  { id:"japanese",      label:"Japanese",      desc:"Clean minimal, fish" },
  { id:"middle_eastern",label:"Middle Eastern",desc:"Spiced meats, herbs" },
  { id:"scandinavian",  label:"Scandinavian",  desc:"Cured fish, forest" },
];

const EAT_PATS = [
  { id:"standard",label:"Standard",   desc:"6 meals every 3h",         fasting:false },
  { id:"if16_8",  label:"IF 16:8",    desc:"16h fast · 8h window",     fasting:true, detail:"Window 12:00–20:00" },
  { id:"if18_6",  label:"IF 18:6",    desc:"18h fast · 6h window",     fasting:true, detail:"Window 13:00–19:00" },
  { id:"if5_2",   label:"5:2",        desc:"5 normal · 2 low-cal days", fasting:true, detail:"~500 kcal fasting days" },
];

const PHASES = [
  { id:1, label:"21-Day Detox",            range:"Days 1–21",  color:T.rg,   rules:["Green list only","6 meals every 3h","No sugars/yeast","No dairy"],       note:"Any deviation resets the inflammatory clock." },
  { id:2, label:"Green Phase",             range:"Months 1–3", color:T.ok,   rules:["Strict 4-day rotation","One legume day/week","Candida rules continue"],   note:"Rotation prevents new sensitivities forming." },
  { id:3, label:"Mild Reintroduction",     range:"Month 3–4",  color:T.warn, rules:["Up to 3 mild foods/day","Repeat only after 4 days","Watch for reactions"],note:"React — delay 1 month." },
  { id:4, label:"Moderate Reintroduction", range:"Month 6",    color:"#C87030", rules:["Same as mild method","Whey restriction ends"],                          note:"Most patients see largest improvements here." },
  { id:5, label:"Maintenance",             range:"Month 9+",   color:"#6A9E8E", rules:["Full rotation","One free day/week"],                                    note:"52 free days per year without affecting outcomes." },
];

// ── API UTILITIES ──────────────────────────────────────────────────────────────
// Android-safe file → base64. FileReader fails on content:// URIs returned by Android file picker.
// arrayBuffer() resolves the URI properly before reading.
async function fileToBase64(file) {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}

async function callClaude(messages, system, extra = {}) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages, ...extra }),
  });
  const d = await res.json();
  return (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
}

// Dante Labs stub
const danteStub = { projectId: 'prjWem9WBYg200IIAG', ready: false };
// VitaminLab stub
const vitaminLabStub = { ready: false };

function simulateTimeline(hadReactive) {
  const pts = [];
  for (let m = 0; m <= 120; m += 3) {
    const t = m / 120, curve = t < 0.3 ? t / 0.3 : t < 0.6 ? 1 : Math.max(0, (1 - t) / 0.4);
    const rx = hadReactive ? 2.2 + Math.random() * 0.6 : 1, n = () => (Math.random() - 0.5) * 2;
    pts.push({ min:m, hr:Math.round(68+14*rx*curve+n()), hrv:Math.round(55-(hadReactive?22:6)*curve+n()), temp:+((36.5+(hadReactive?0.6:0.08)*curve+n()*0.015)).toFixed(2), glucose:Math.round(82+(hadReactive?58:22)*curve+n()), spo2:+((98-(hadReactive?1.8:0.2)*curve+n()*0.05)).toFixed(1) });
  }
  return pts;
}
function detectSpikes(pts) {
  if (!pts || pts.length < 4) return [];
  const b = pts[0], spikes = [];
  pts.forEach((p, i) => {
    if (i < 3) return;
    if (p.hr - b.hr >= 22 && !spikes.find(s => s.m === 'hr')) spikes.push({ min:p.min, m:'hr', label:'Heart Rate spike', val:`+${p.hr - b.hr} bpm`, level:p.hr-b.hr>=32?'severe':'moderate' });
    if (b.hrv - p.hrv >= 18 && !spikes.find(s => s.m === 'hrv')) spikes.push({ min:p.min, m:'hrv', label:'HRV drop', val:`-${b.hrv - p.hrv} ms`, level:b.hrv-p.hrv>=28?'severe':'moderate' });
    if (p.temp - b.temp >= 0.45 && !spikes.find(s => s.m === 'temp')) spikes.push({ min:p.min, m:'temp', label:'Temperature rise', val:`+${(p.temp-b.temp).toFixed(2)}°C`, level:p.temp-b.temp>=0.65?'severe':'moderate' });
    if (p.glucose - b.glucose >= 38 && !spikes.find(s => s.m === 'glucose')) spikes.push({ min:p.min, m:'glucose', label:'Glucose spike', val:`+${p.glucose - b.glucose} mg/dL`, level:p.glucose-b.glucose>=55?'severe':'moderate' });
  });
  return spikes;
}

// ── PRIMITIVES ─────────────────────────────────────────────────────────────────
const Nav = ({ onBabyBalans }) => (
  <div style={{ position:'sticky',top:0,zIndex:200,height:58,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 44px',background:'rgba(247,244,240,0.92)',backdropFilter:'blur(24px) saturate(180%)',WebkitBackdropFilter:'blur(24px) saturate(180%)',borderBottom:`1px solid ${T.w3}` }}>
    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
      <div style={{ width:9,height:9,borderRadius:'50%',background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,0.40)`,flexShrink:0 }}/>
      <span style={{ fontFamily:"'EB Garamond', Georgia, serif",fontSize:18,fontWeight:400,color:T.w7,letterSpacing:'0.01em' }}>meet mario</span>
    </div>
    <div style={{ display:'flex',alignItems:'center',gap:18 }}>
      <button onClick={onBabyBalans} style={{ background:'none',border:'none',cursor:'pointer',fontFamily:fonts.mono,fontSize:11,color:T.rg2,letterSpacing:'0.14em',textTransform:'uppercase',padding:'4px 10px',borderRadius:4,transition:'all .15s' }}>
        Baby Balans
      </button>
      <span style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,border:`1px solid ${T.w3}`,borderRadius:3,padding:'3px 8px',letterSpacing:'0.14em' }}>PATENT PENDING · SE 2615203-3</span>
    </div>
  </div>
);

const Panel = ({ children, style }) => (
  <div style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:12,padding:'24px 26px',marginBottom:28,boxShadow:`inset 0 1px 3px rgba(100,80,60,0.06), 0 1px 0 rgba(255,255,255,0.88)`,...style }}>
    {children}
  </div>
);

const Chip = ({ label, on, onClick }) => (
  <button onClick={onClick} style={{ padding:'7px 16px',borderRadius:50,fontSize:12.5,fontFamily:fonts.sans,fontWeight:on?500:400,border:`1px solid ${on?T.rg:T.w3}`,background:on?T.rgBg:T.w,color:on?T.rg2:T.w5,cursor:'pointer',userSelect:'none',letterSpacing:'-0.01em',transition:'all .18s',boxShadow:on?`0 2px 10px rgba(160,104,88,0.12),inset 0 1px 0 rgba(255,255,255,0.95)`:`0 1px 3px rgba(100,80,60,0.06)` }}>{label}</button>
);

const BtnPrimary = ({ children, onClick, disabled, loading, small }) => (
  <button onClick={onClick} disabled={disabled||loading} style={{ display:'inline-flex',alignItems:'center',gap:10,padding:small?'10px 28px':'15px 44px',borderRadius:12,border:'none',cursor:disabled?'not-allowed':'pointer',fontFamily:fonts.sans,fontSize:small?11.5:13,fontWeight:500,letterSpacing:'0.08em',textTransform:'uppercase',position:'relative',overflow:'hidden',background:disabled?T.w2:`linear-gradient(140deg,${T.rg3} 0%,${T.rg} 22%,${T.rg2} 52%,#B88070 72%,${T.rg3} 92%,${T.rg} 100%)`,backgroundSize:'200% auto',color:disabled?T.w4:'rgba(255,255,255,0.97)',boxShadow:disabled?'none':`0 4px 20px rgba(154,98,85,0.28),inset 0 1px 0 rgba(255,255,255,0.24)`,transition:'all .2s',opacity:loading?0.7:1 }}>
    <div style={{ position:'absolute',top:0,left:'8%',right:'8%',height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.30) 50%,transparent)' }}/>
    <span style={{ position:'relative',zIndex:1 }}>{loading?'…':children}</span>
  </button>
);

const FieldLabel = ({ children }) => (
  <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4,letterSpacing:'0.22em',textTransform:'uppercase',marginBottom:12 }}>{children}</div>
);
const Eyebrow = ({ children }) => (
  <div style={{ fontFamily:fonts.mono,fontSize:11,color:`rgba(196,136,122,0.60)`,letterSpacing:'0.24em',textTransform:'uppercase',marginBottom:12 }}>{children}</div>
);
const SectionTitle = ({ children }) => (
  <h2 style={{ fontFamily:fonts.serif,fontSize:32,fontWeight:400,color:T.w7,letterSpacing:'-0.01em',lineHeight:1.16,marginBottom:32 }}>{children}</h2>
);
const RuledInput = ({ placeholder, value, onChange, style, multiline, rows }) => {
  const base = { width:'100%',background:'transparent',border:'none',borderBottom:`1px solid ${T.w3}`,outline:'none',padding:'7px 0',fontSize:13,fontFamily:fonts.sans,fontWeight:300,color:T.w7,resize:'none',...style };
  return multiline
    ? <textarea rows={rows||3} placeholder={placeholder} value={value} onChange={onChange} style={base}/>
    : <input type="text" placeholder={placeholder} value={value} onChange={onChange} style={base}/>;
};

const EmptyState = ({ title, sub }) => (
  <div style={{ padding:'48px 0',textAlign:'center' }}>
    <div style={{ width:36,height:1,background:T.w3,margin:'0 auto 20px' }}/>
    <div style={{ fontFamily:fonts.serif,fontSize:20,color:T.w5,fontWeight:400,marginBottom:8 }}>{title}</div>
    {sub && <div style={{ fontFamily:fonts.sans,fontSize:12,color:T.w4,fontWeight:300,maxWidth:280,margin:'0 auto',lineHeight:1.7 }}>{sub}</div>}
  </div>
);

// ── ONBOARDING COMPONENT ───────────────────────────────────────────────────────
// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuthed }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'

  const handleSubmit = async () => {
    if (!email.trim() || loading) return;
    setLoading(true); setError('');
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true,
        },
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const isValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  return (
    <div style={{ minHeight:'100vh', background:T.w, fontFamily:fonts.sans, display:'flex', flexDirection:'column' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');*{box-sizing:border-box}input::placeholder{color:${T.w4};font-style:italic;font-weight:300}`}</style>

      {/* Nav */}
      <div style={{ padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${T.w2}` }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:9,height:9,borderRadius:'50%',background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,0.40)`,flexShrink:0 }}/>
          <span style={{ fontFamily:"'EB Garamond', Georgia, serif",fontSize:18,fontWeight:400,color:T.w7,letterSpacing:'0.01em' }}>meet mario</span>
        </div>
        <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.w4, letterSpacing:'0.16em' }}>MEDIBALANS AB · STOCKHOLM</div>
      </div>

      {/* Content */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ maxWidth:440, width:'100%' }}>

          {!sent ? (
            <>
              {/* Header */}
              <div style={{ textAlign:'center', marginBottom:40 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.rg, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>
                  {mode === 'login' ? 'Welcome back' : 'Reset access'}
                </div>
                <div style={{ fontFamily:fonts.serif, fontSize:36, fontWeight:400, color:T.w7, lineHeight:1.15, marginBottom:12 }}>
                  {mode === 'login' ? <>Your biology<br/>awaits.</> : <>Check your<br/>inbox.</>}
                </div>
                <div style={{ fontFamily:fonts.sans, fontSize:13, color:T.w4, fontWeight:300, lineHeight:1.7 }}>
                  {mode === 'login'
                    ? 'Enter your email. We send a secure login link — no password needed.'
                    : 'Enter your email and we will send you a fresh access link.'}
                </div>
              </div>

              {/* Form */}
              <div style={{ background:'#fff', borderRadius:14, padding:'32px 28px', boxShadow:`0 2px 20px ${T.w3}60`, border:`1px solid ${T.w2}` }}>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.w5, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>Email address</div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && isValid && handleSubmit()}
                    placeholder="your@email.com"
                    autoFocus
                    style={{
                      width:'100%', border:`1px solid ${T.w3}`, borderRadius:8,
                      padding:'12px 16px', fontFamily:fonts.sans, fontSize:14,
                      background:T.w, color:T.w7, outline:'none',
                      transition:'border-color .2s',
                    }}
                  />
                </div>

                {error && (
                  <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.err, marginBottom:14, padding:'8px 12px', background:`${T.err}10`, borderRadius:6 }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!isValid || loading}
                  style={{
                    width:'100%', background: isValid ? T.rg : T.w3,
                    color: isValid ? '#fff' : T.w4,
                    border:'none', borderRadius:9, padding:'13px',
                    fontFamily:fonts.sans, fontSize:14, fontWeight:700,
                    cursor: isValid ? 'pointer' : 'default',
                    transition:'all .2s', letterSpacing:'0.04em',
                  }}>
                  {loading ? 'Sending…' : mode === 'login' ? 'Send login link' : 'Send reset link'}
                </button>

                <div style={{ textAlign:'center', marginTop:16 }}>
                  <button
                    onClick={() => { setMode(m => m === 'login' ? 'forgot' : 'login'); setError(''); }}
                    style={{ background:'none', border:'none', cursor:'pointer', fontFamily:fonts.mono, fontSize:11, color:T.w4, letterSpacing:'0.1em', textDecoration:'underline' }}>
                    {mode === 'login' ? 'Forgot / no access?' : '← Back to login'}
                  </button>
                </div>
              </div>

              {/* Trust signals */}
              <div style={{ marginTop:28, display:'flex', justifyContent:'center', gap:24 }}>
                {['GDPR · Frankfurt servers','No password stored','Magic link · 15 min expiry'].map(t => (
                  <div key={t} style={{ fontFamily:fonts.mono, fontSize:10, color:T.w4, letterSpacing:'0.1em', textAlign:'center' }}>{t}</div>
                ))}
              </div>
            </>
          ) : (
            /* Sent state */
            <div style={{ textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:`${T.ok}15`, border:`1px solid ${T.ok}40`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:24 }}>
                ✓
              </div>
              <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.ok, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:14 }}>Link sent</div>
              <div style={{ fontFamily:fonts.serif, fontSize:28, color:T.w7, marginBottom:12 }}>Check your email.</div>
              <div style={{ fontFamily:fonts.sans, fontSize:13, color:T.w4, fontWeight:300, lineHeight:1.8, maxWidth:320, margin:'0 auto 32px' }}>
                We sent a secure link to <span style={{ color:T.w6, fontWeight:500 }}>{email}</span>.<br/>
                Click it to enter your dashboard. Link expires in 15 minutes.
              </div>
              <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4, letterSpacing:'0.1em', marginBottom:16 }}>
                No email? Check your spam folder.
              </div>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{ background:'none', border:`1px solid ${T.w3}`, borderRadius:8, padding:'9px 20px', cursor:'pointer', fontFamily:fonts.mono, fontSize:11, color:T.w5, letterSpacing:'0.1em' }}>
                Try different email
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'16px 32px', borderTop:`1px solid ${T.w2}`, textAlign:'center' }}>
        <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.w4, letterSpacing:'0.1em', marginBottom:6 }}>
          MediBalans AB · Karlavägen 89, Stockholm · Patent Pending SE 2615203-3
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill={T.rg} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span style={{ fontFamily:fonts.mono, fontSize:10, color:T.w5, letterSpacing:'0.06em' }}>4.87 on Reco · #1 rated health clinic in Sweden</span>
          <span style={{ color:T.w3 }}>·</span>
          <a href="https://medibalans.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily:fonts.mono, fontSize:10, color:T.rg2, textDecoration:'none' }}>medibalans.com</a>
        </div>
      </div>
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name:'', dob:'', sex:'', hormonalStatus:'',
    geographyOfOrigin:'', yearsInCurrentCountry:'',
    symptoms:[], tests:[],
    medications:'', supplements:'', conditions:'', goals:[],
    alcat_severe:[], alcat_moderate:[], alcat_mild:[], alcat_raw:'',
  });
  const [labFile, setLabFile] = useState(null);
  const [labFileName, setLabFileName] = useState('');
  const [labFiles, setLabFiles] = useState([]); // track multiple uploads
  const [labParsing, setLabParsing] = useState(false);
  const [labParsed, setLabParsed] = useState(false);
  const [labParseError, setLabParseError] = useState(false);

  const parseLabFile = async (file, isAdditional = false) => {
    if (!file) return;
    setLabParsing(true); setLabParsed(false); setLabParseError(false);
    setLabFileName(file.name);

    // Detect file type — fall back to extension if browser doesn't set MIME
    const ext = (file.name || '').split('.').pop().toLowerCase();
    const isPDF = file.type === 'application/pdf' || ext === 'pdf';
    const isImage = file.type.startsWith('image/') || ['jpg','jpeg','png','gif','webp','heic','heif','bmp','tiff'].includes(ext);
    const isVCF = ext === 'vcf' || ext === 'txt' || file.type === 'text/plain';
    const imageMediaType = file.type.startsWith('image/') ? file.type : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    console.log('[Lab parse] File:', file.name, '| type:', file.type, '| ext:', ext, '| isPDF:', isPDF, '| isImage:', isImage, '| isVCF:', isVCF, '| size:', (file.size/1024).toFixed(0)+'KB');

    try {
      let content;

      if (isVCF) {
        // VCF / plain-text — read as string, truncate to ~120 KB to stay within token limits
        const rawText = await file.text();
        const truncated = rawText.length > 120000 ? rawText.slice(0, 120000) + '\n...[truncated]' : rawText;
        console.log('[Lab parse] Sending VCF text, chars:', truncated.length);
        content = [
          { type: 'text', text: `This is a genomic VCF (Variant Call Format) file. Extract all clinically significant variants.\n\nFile contents:\n\`\`\`\n${truncated}\n\`\`\`` },
          { type: 'text', text: `Return ONLY this JSON (no markdown):\n{"report_type":"VCF","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[]}\n\nMap variants to arrays by clinical significance: pathogenic/likely pathogenic → "severe", variant of uncertain significance → "moderate", benign/likely benign → "mild". Use HGVS notation or gene+variant name. Lowercase.` }
        ];
      } else {
        const base64 = await fileToBase64(file);

        // Build content — PDFs use document type (native Anthropic support), images use image type
        const fileBlock = isPDF
          ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
          : { type: 'image', source: { type: 'base64', media_type: imageMediaType, data: base64 } };

        console.log('[Lab parse] Sending', isPDF ? 'document' : 'image', 'block, base64 length:', base64.length);

        content = [
          fileBlock,
          { type: 'text', text: `This is a medical lab test result. Identify the report type and extract ALL data.

REPORT TYPE 1 — ALCAT (food immune reactivity):
Extract every food/substance with a reactivity level.
- Red / Class 3-4 / SEVERE → "severe" array
- Orange / Class 2 / MODERATE → "moderate" array
- Yellow / Class 1 / MILD → "mild" array
- Green / Class 0 / ACCEPTABLE → omit

REPORT TYPE 2 — CMA / CNA (Cell Science Systems intracellular micronutrient analysis):
This report tests ~55 micronutrients including vitamins, minerals, amino acids, antioxidants, fatty acids, and metabolites. Extract EVERY nutrient tested.
- Any nutrient marked DEFICIENT, VERY LOW, or critically below range → "severe"
- Any nutrient marked LOW, BORDERLINE, or below optimal → "moderate"
- Any nutrient in ADEQUATE / NORMAL / within range → "mild"
- Also extract: "cma_deficiencies" for all below-range nutrients, "cma_adequate" for all in-range

REPORT TYPE 3 — Blood work / other:
Extract any out-of-range markers into "moderate", normal into "mild".

Return ONLY this JSON (no markdown):
{"report_type":"ALCAT|CMA|LAB","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[]}
Lowercase English names. Translate Swedish to English. Include EVERY nutrient found.` }
        ];
      } // end else (PDF / image)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 4000,
          system: 'You extract structured data from medical lab results. Return only valid JSON, nothing else — no preamble, no explanation.',
          messages: [{ role: 'user', content }],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[Lab parse] HTTP', res.status, errText.slice(0, 500));
        throw new Error('API returned ' + res.status);
      }

      const d = await res.json();
      if (d.error) {
        console.error('[Lab parse] API error:', d.error);
        throw new Error(d.error);
      }
      const text = (Array.isArray(d.content) ? d.content : [])
        .filter(b => b.type === 'text').map(b => b.text).join('');

      console.log('[Lab parse] Raw response:', text.slice(0, 300));

      let json = { severe:[], moderate:[], mild:[] };
      try {
        json = JSON.parse(text.replace(/```json|```/g,'').trim());
      } catch {
        const match = text.match(/\{[\s\S]*?"severe"[\s\S]*?\}/);
        if (match) { try { json = JSON.parse(match[0]); } catch {} }
      }

      const norm = arr => (Array.isArray(arr) ? arr : []).map(f => String(f).toLowerCase().trim()).filter(Boolean);
      const newSevere = norm(json.severe);
      const newModerate = norm(json.moderate);
      const newMild = norm(json.mild);

      if (isAdditional) {
        u('alcat_severe', [...new Set([...(data.alcat_severe||[]), ...newSevere])]);
        u('alcat_moderate', [...new Set([...(data.alcat_moderate||[]), ...newModerate])]);
        u('alcat_mild', [...new Set([...(data.alcat_mild||[]), ...newMild])]);
      } else {
        u('alcat_severe', newSevere);
        u('alcat_moderate', newModerate);
        u('alcat_mild', newMild);
      }
      u('alcat_raw', text);
      setLabFiles(prev => [...prev.filter(f => f !== file.name), file.name]);

      const hasResults = newSevere.length > 0 || newModerate.length > 0 || newMild.length > 0;
      console.log('[Lab parse] Results:', { severe: newSevere.length, moderate: newModerate.length, mild: newMild.length });
      if (!hasResults) {
        setLabParseError('API returned OK but 0 foods extracted. Raw: ' + text.slice(0, 150));
      }

      // ── Save to Supabase alcat_results ──────────────────────────────────────
      if (hasResults && authUser?.id) {
        try {
          // Detect report type from filename
          const fn = file.name.toLowerCase();
          const reportType = fn.includes('cna') || fn.includes('cma') ? 'CMA'
            : fn.includes('alc') || fn.includes('alcat') ? 'ALCAT'
            : 'LAB';

          // Merge with any existing results if isAdditional
          const finalSevere = isAdditional
            ? [...new Set([...(data.alcat_severe||[]), ...newSevere])]
            : newSevere;
          const finalModerate = isAdditional
            ? [...new Set([...(data.alcat_moderate||[]), ...newModerate])]
            : newModerate;
          const finalMild = isAdditional
            ? [...new Set([...(data.alcat_mild||[]), ...newMild])]
            : newMild;

          await supabase.from('alcat_results').upsert({
            patient_id: authUser.id,
            severe: finalSevere,
            moderate: finalModerate,
            mild: finalMild,
            test_date: new Date().toISOString().split('T')[0],
            lab_id: file.name,
            raw_report_url: reportType,
            created_at: new Date().toISOString(),
          }, { onConflict: 'patient_id' });

          // Also update onboarding_intake reactive lists
          await supabase.from('onboarding_intake').upsert({
            user_id: authUser.id,
            alcat_severe: finalSevere,
            alcat_moderate: finalModerate,
            alcat_mild: finalMild,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          // And profiles.patient_data
          const { data: profRow } = await supabase
            .from('profiles')
            .select('patient_data')
            .eq('id', authUser.id)
            .single();
          if (profRow?.patient_data) {
            const pd = typeof profRow.patient_data === 'string'
              ? JSON.parse(profRow.patient_data) : profRow.patient_data;
            pd.alcat_severe = finalSevere;
            pd.alcat_moderate = finalModerate;
            pd.alcat_mild = finalMild;
            await supabase.from('profiles').upsert({
              id: authUser.id,
              patient_data: JSON.stringify(pd),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          }

          console.log('[Lab upload] Saved to DB:', reportType, finalSevere.length + finalModerate.length + finalMild.length, 'items');
        } catch(dbErr) {
          console.error('[Lab upload] DB save error:', dbErr);
          // Non-fatal — user can still continue
        }
      }
      // ───────────────────────────────────────────────────────────────────────

      setLabParsed(true);
    } catch(err) {
      console.error('Lab parse error:', err);
      setLabParseError(err.message || 'Unknown error');
      setLabParsed(true);
    }
    setLabParsing(false);
  };

  const u = (k, v) => setData(p => ({ ...p, [k]:v }));
  const toggle = (k, v) => setData(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));

  const STEPS = [
    {
      title:"Your Identity", sub:"The foundation of your personalised protocol.",
      render:() => (
        <div>
          <div style={{ marginBottom:20 }}>
            <FieldLabel>Full name</FieldLabel>
            <RuledInput value={data.name} onChange={e=>u('name',e.target.value)} placeholder="Your name"/>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20 }}>
            <div>
              <FieldLabel>Date of birth</FieldLabel>
              <RuledInput value={data.dob} onChange={e=>u('dob',e.target.value)} placeholder="DD/MM/YYYY"/>
            </div>
            <div>
              <FieldLabel>Biological sex</FieldLabel>
              <div style={{ display:'flex',gap:8,marginTop:4 }}>
                {['Female','Male','Other'].map(s=>(
                  <Chip key={s} label={s} on={data.sex===s} onClick={()=>u('sex',s)}/>
                ))}
              </div>
            </div>
          </div>
          <FieldLabel>Hormonal status</FieldLabel>
          <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
            {['Pre-menopausal','Peri-menopausal','Post-menopausal','On HRT','Male – standard','Male – on TRT','Not applicable'].map(s=>(
              <Chip key={s} label={s} on={data.hormonalStatus===s} onClick={()=>u('hormonalStatus',s)}/>
            ))}
          </div>
        </div>
      ),
    },
    {
      title:"Your Origins", sub:"Ancestral food history shapes your immune system's molecular pattern library.",
      render:() => (
        <div>
          <div style={{ marginBottom:24 }}>
            <FieldLabel>Country of origin</FieldLabel>
            <RuledInput value={data.geographyOfOrigin} onChange={e=>u('geographyOfOrigin',e.target.value)} placeholder="e.g. Sweden, Turkey, Iran, India…"/>
          </div>
          <div>
            <FieldLabel>Years living in current country</FieldLabel>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginTop:4 }}>
              {['Under 1','1–3','4–10','11–20','Over 20','Lifetime'].map(y=>(
                <Chip key={y} label={y} on={data.yearsInCurrentCountry===y} onClick={()=>u('yearsInCurrentCountry',y)}/>
              ))}
            </div>
          </div>
          <div style={{ marginTop:24 }}>
            <FieldLabel>Primary health goals</FieldLabel>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginTop:4 }}>
              {['Energy restoration','Gut healing','Weight management','Hormonal balance','Brain clarity','Sleep quality','Skin health','Athletic performance','Longevity'].map(g=>(
                <Chip key={g} label={g} on={data.goals.includes(g)} onClick={()=>toggle('goals',g)}/>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title:"Your Symptoms", sub:"Identify patterns. Your protocol intensity is calibrated to your symptom burden.",
      render:() => (
        <div>
          {Object.values(SYMPTOM_CATS).map(cat=>(
            <div key={cat.label} style={{ marginBottom:20 }}>
              <FieldLabel>{cat.label}</FieldLabel>
              <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>
                {cat.items.map(s=>(
                  <Chip key={s} label={s} on={data.symptoms.includes(s)} onClick={()=>toggle('symptoms',s)}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title:"Your Diagnostics", sub:"Which tests have you completed? Your data will be integrated automatically.",
      render:() => (
        <div>
          <FieldLabel>Tests completed</FieldLabel>
          <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginBottom:28 }}>
            {['ALCAT 250','ALCAT 483','CMA','MethylDetox','GI-MAP','DUTCH','Werlabs','WGS','RNA Transcriptomics','Proteomics','BioAge'].map(t=>(
              <Chip key={t} label={t} on={data.tests.includes(t)} onClick={()=>toggle('tests',t)}/>
            ))}
          </div>
          <FieldLabel>Other tests or diagnostics (free text)</FieldLabel>
          <RuledInput multiline rows={2} value={data.conditions} onChange={e=>u('conditions',e.target.value)} placeholder="List any other relevant tests, diagnoses, or clinical findings…"/>
        </div>
      ),
    },
    {
      title:"Upload Your Lab Results", sub:"Upload your ALCAT, blood work, or any test results. Mario reads them automatically and builds your reactive food profile.",
      render:() => (
        <div>
          <div style={{ border:`2px dashed ${labParsed?T.ok:T.w3}`, borderRadius:12, padding:'32px 24px', textAlign:'center', background:labParsed?`${T.ok}08`:T.w1, transition:'all 0.3s', marginBottom:20 }}>
            {!labParsed && !labParsing && (
              <>
                <div style={{ fontFamily:fonts.serif, fontSize:18, color:T.w6, marginBottom:8 }}>Drop your ALCAT results here</div>
                <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w4, marginBottom:20 }}>Photo of your results, PDF, or screenshot — Mario reads it automatically</div>
                <label style={{ cursor:'pointer' }}>
                  <input type="file" accept="image/*,application/pdf" style={{ display:'none' }}
                    onChange={e=>{ const f=e.target.files[0]; if(f){ setLabFile(f); parseLabFile(f); } }}/>
                  <div style={{ background:T.rg, color:'#fff', borderRadius:8, padding:'11px 28px', display:'inline-block', fontFamily:fonts.sans, fontSize:13, fontWeight:700 }}>
                    Choose file
                  </div>
                </label>
                <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4, marginTop:12, letterSpacing:'0.1em' }}>
                  ALCAT · CMA · BLOOD WORK · ANY FORMAT
                </div>
              </>
            )}
            {labParsing && (
              <div>
                <div style={{ fontFamily:fonts.serif, fontSize:16, color:T.w6, marginBottom:16 }}>Reading your results...</div>
                <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                  {[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:'50%',background:T.rg,animation:`pulse 1.2s ${i*0.2}s infinite` }}/>)}
                </div>
              </div>
            )}
            {labParsed && (
              <div>
                {/* Uploaded files list */}
                {labFiles.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    {labFiles.map(fn => (
                      <div key={fn} style={{ display:'inline-flex', alignItems:'center', gap:6, background:T.w2, borderRadius:6, padding:'4px 10px', marginRight:6, marginBottom:6 }}>
                        <span style={{ fontFamily:fonts.mono, fontSize:10, color:T.ok }}>✓</span>
                        <span style={{ fontFamily:fonts.sans, fontSize:11, color:T.w6, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fn}</span>
                      </div>
                    ))}
                  </div>
                )}

                {labParseError ? (
                  <div style={{ padding:'12px 16px', background:`${T.warn}15`, border:`1px solid ${T.warn}40`, borderRadius:8, marginBottom:14 }}>
                    <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.warn, letterSpacing:'0.12em', marginBottom:6 }}>COULD NOT READ REACTIVE FOODS</div>
                    <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w5 }}>Mario couldn't extract the food list from this file. Try a clearer photo, or upload the other page of the report. You can also skip and add results manually in the Protocol tab.</div>
                    {typeof labParseError === 'string' && labParseError !== 'true' && (
                      <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4, marginTop:6 }}>{labParseError}</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.ok, letterSpacing:'0.14em', marginBottom:12 }}>
                      EXTRACTED — {(data.alcat_severe||[]).length + (data.alcat_moderate||[]).length + (data.alcat_mild||[]).length} reactive foods found
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, textAlign:'left', marginBottom:14 }}>
                      {[['Severe',data.alcat_severe,T.err],['Moderate',data.alcat_moderate,T.warn],['Mild',data.alcat_mild,T.w5]].map(([label,items,color])=>(
                        <div key={label} style={{ background:'#fff', borderRadius:8, padding:'10px 12px', border:`1px solid ${color}30` }}>
                          <div style={{ fontFamily:fonts.mono, fontSize:10, color, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>{label} · {items.length}</div>
                          {items.slice(0,8).map(f=>(
                            <div key={f} style={{ fontFamily:fonts.sans, fontSize:11, color:T.w6, padding:'2px 0', borderBottom:`1px solid ${T.w1}` }}>{f}</div>
                          ))}
                          {items.length > 8 && <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4, marginTop:4 }}>+{items.length-8} more</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <label style={{ cursor:'pointer' }}>
                    <input type="file" accept="image/*,application/pdf" style={{ display:'none' }}
                      onChange={e=>{ const f=e.target.files[0]; if(f){ setLabFile(f); parseLabFile(f, true); } }}/>
                    <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.rg, letterSpacing:'0.1em', textDecoration:'underline', cursor:'pointer' }}>+ Add another file (CMA / page 2)</div>
                  </label>
                  <label style={{ cursor:'pointer' }}>
                    <input type="file" accept="image/*,application/pdf" style={{ display:'none' }}
                      onChange={e=>{ const f=e.target.files[0]; if(f){ setLabFile(f); setLabFiles([]); setLabParsed(false); parseLabFile(f, false); } }}/>
                    <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4, letterSpacing:'0.1em', textDecoration:'underline', cursor:'pointer' }}>Replace with different file</div>
                  </label>
                </div>
              </div>
            )}
          </div>
          <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.w4, textAlign:'center', letterSpacing:'0.1em' }}>
            No results yet? Skip and upload later in the Protocol tab.
          </div>
        </div>
      ),
    },
    {
      title:"Medications & Supplements", sub:"Your full protocol — free text. Hormonal therapies, micronutrients, pharmaceutical medications, herbal supplements, anything relevant.",
      render:() => (
        <div>
          <div style={{ marginBottom:24 }}>
            <FieldLabel>Current medications (pharmaceutical)</FieldLabel>
            <RuledInput multiline rows={3} value={data.medications} onChange={e=>u('medications',e.target.value)} placeholder="e.g. Levothyroxine 50mcg, Estradiol patch 50mcg/24h, Metformin 500mg…"/>
          </div>
          <div>
            <FieldLabel>Supplements & nutraceuticals</FieldLabel>
            <RuledInput multiline rows={3} value={data.supplements} onChange={e=>u('supplements',e.target.value)} placeholder="e.g. Magnesium glycinate 400mg, Vitamin D3 5000IU, Omega-3, CoQ10, NMN…"/>
          </div>
        </div>
      ),
    },
  ];

  const current = STEPS[step];
  const canAdvance = step === 0 ? data.name.length > 1 : true;

  const handleComplete = () => {
    onComplete({
      ...data,
      profileComplete: true,
      protocol: 'Option A — 21-day universal detox',
      phase: 1, dayInProtocol: 1,
      severe: data.alcat_severe || [],
      moderate: data.alcat_moderate || [],
      mild: data.alcat_mild || [],
      alsoAvoid:{ candida:[], whey:[] },
      markers:[],
      rotation:{ 1:{grains:[],veg:[],fruit:[],protein:[],misc:[]}, 2:{grains:[],veg:[],fruit:[],protein:[],misc:[]}, 3:{grains:[],veg:[],fruit:[],protein:[],misc:[]}, 4:{grains:[],veg:[],fruit:[],protein:[],misc:[]} },
      meals:{},
    });
  };

  return (
    <div style={{ minHeight:'100vh',background:T.w,fontFamily:fonts.sans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');*{box-sizing:border-box}input::placeholder,textarea::placeholder{color:${T.w4};font-style:italic;font-weight:300}`}</style>
      <Nav onBabyBalans={()=>window.open('/pregnancy','_blank')} onSignOut={async()=>{ await supabase.auth.signOut(); setAuthUser(null); setPatient({}); setShowAuth(true); setShowLanding(false); setShowOnboarding(false); }}/>
      <div style={{ maxWidth:640,margin:'0 auto',padding:'64px 32px 80px' }}>
        {/* Progress */}
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:48 }}>
          {STEPS.map((_,i)=>(
            <div key={i} style={{ flex:1,height:2,background:i<=step?T.rg:T.w3,borderRadius:2,transition:'background .3s' }}/>
          ))}
          <span style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4,letterSpacing:'0.14em',whiteSpace:'nowrap',marginLeft:8 }}>{step+1} / {STEPS.length}</span>
        </div>
        {/* Header */}
        <div style={{ marginBottom:36 }}>
          <Eyebrow>21-day biological reset · meet mario</Eyebrow>
          <div style={{ fontFamily:fonts.serif,fontSize:34,fontWeight:400,color:T.w7,lineHeight:1.14,marginBottom:10 }}>{current.title}</div>
          <div style={{ fontFamily:fonts.sans,fontSize:14,color:T.w4,fontWeight:300,lineHeight:1.7 }}>{current.sub}</div>
        </div>
        {/* Step content */}
        <Panel style={{ marginBottom:32 }}>
          {current.render()}
        </Panel>
        {/* Navigation */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          {step > 0
            ? <button onClick={()=>setStep(s=>s-1)} style={{ background:'none',border:`1px solid ${T.w3}`,borderRadius:9,padding:'11px 24px',cursor:'pointer',fontSize:12,fontFamily:fonts.sans,color:T.w5 }}>Back</button>
            : <div/>
          }
          {step < STEPS.length - 1
            ? <BtnPrimary onClick={()=>canAdvance&&setStep(s=>s+1)} disabled={!canAdvance}>Continue</BtnPrimary>
            : <BtnPrimary onClick={handleComplete}>Enter My Dashboard</BtnPrimary>
          }
        </div>
        {/* Protocol note */}
        <div style={{ marginTop:32,borderTop:`1px solid ${T.w2}`,paddingTop:20 }}>
          <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.14em',lineHeight:2 }}>
            Your data is stored securely on GDPR-compliant servers in Frankfurt, Germany. MediBalans AB · Karlavägen 89, Stockholm · Patent Pending SE 2615203-3
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
export default function MeetMario({ patient: patientProp }) {
  const [patient, setPatient] = useState(patientProp || {});
  const [showLanding, setShowLanding] = useState(!patientProp?.name);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showBES, setShowBES] = useState(false);
  const [besScore, setBesScore] = useState(null);
  const [showDiet, setShowDiet] = useState(false);
  const [dietPlan, setDietPlan] = useState('');
  const [dietLoading, setDietLoading] = useState(false);

  // Reusable diet generator — can be called from BES screen, dashboard, or after lab upload
  const generateDiet = async (pd) => {
    if (!pd) pd = patient;
    setDietLoading(true); setDietPlan('');
    const severe = (pd.severe||[]).join(', ') || 'none uploaded yet';
    const mild = (pd.mild||[]).join(', ') || 'none';
    const origin = pd.geographyOfOrigin || 'not specified';
    const symptoms = (pd.symptoms||[]).join(', ') || 'not specified';
    const cmaD = (pd.cmaDeficiencies||[]).join(', ') || 'not tested';
    const cmaAll = (pd.cmaNutrients||[]).filter(n=>n.status==='deficient'||n.status==='low').map(n=>`${n.name}: ${n.value}${n.unit?' '+n.unit:''} [${n.status}]`).join(', ') || '';
    const redox = pd.redoxScore != null ? pd.redoxScore : 'not tested';
    const antioxidants = (pd.cmaAntioxidants||[]).map(a=>`${a.name}: ${a.status}${a.value!=null?' ('+a.value+')':''}`).join(', ') || '';
    const snpsByDomain = {};
    (pd.genomicSnps||[]).forEach(s => { const d = s.domain||'other'; if(!snpsByDomain[d]) snpsByDomain[d]=[]; snpsByDomain[d].push(s); });
    const snpDetail = Object.entries(snpsByDomain).map(([domain, snps]) =>
      `[${domain.toUpperCase()}] ${snps.map(s=>`${s.gene} ${s.rsid} ${s.genotype} [${s.status}]: ${s.impact}`).join(' | ')}`
    ).join('\n') || 'not tested';
    const prompt = `Generate a complete 21-day GCR elimination diet plan. This must read like a real human meal plan — food people actually enjoy cooking and eating. Not theoretical. Not a nutrient list. Real dishes, real flavours, real life.

═══ THE PATIENT ═══
- Name: ${pd.name || 'Patient'}
- Ancestral origin: ${origin}
- Symptoms: ${symptoms}
- Day ${pd.dayInProtocol || 1} of protocol

═══ LAYER 1: IMMUNE REACTIVITY (ALCAT) ═══
- EXCLUDE (severe — 9 months): ${severe}
- EXCLUDE (mild — 3 months): ${mild}

═══ LAYER 2: INTRACELLULAR MICRONUTRIENTS (CMA) ═══
- Deficiencies to correct: ${cmaD}
${cmaAll ? `- Values: ${cmaAll}` : ''}
${antioxidants ? `- Antioxidants: ${antioxidants}` : ''}
- REDOX: ${redox}/100

═══ LAYER 3: GENETICS (${(pd.genomicSnps||[]).length} actionable SNPs) ═══
${snpDetail}

═══ DESIGN RULES ═══
1. REAL FOOD: Write dishes a normal person would enjoy. "Pan-seared salmon with roasted sweet potato and wilted spinach in garlic olive oil" — not "omega-3 fatty acid source with complex carbohydrate and methylfolate provider."
2. VARIETY: No two days should feel the same. Different proteins, different vegetables, different preparations. Rotate cooking methods — grilled, baked, pan-seared, steamed, raw salads, soups.
3. FLAVOUR: Use herbs, spices, lemon, garlic, ginger liberally. This diet should taste good.
4. CITE THE DATA: After each day's meals, add a brief CLINICAL NOTE (2-3 sentences) explaining which specific genes (cite rsID), CMA values, or ALCAT exclusions drove the food choices that day. This is how the patient learns their own biology.
5. RESPECT ALL LAYERS: Every meal must avoid ALCAT reactors, target CMA deficiencies, and account for genetic variants.
6. PRACTICAL: Include prep tips. "Batch-cook the lamb on Sunday." "Keep frozen berries for quick breakfasts."

═══ UNIVERSAL RULES ═══
No seed oils (olive oil, coconut oil, ghee, tallow only) · No dairy · No yeast/fermented/vinegar · No sugar (Manuka UMF 10+ 1 tsp morning only) · No oats · No legumes during detox · No grapes · Wild-caught fish only · CPF every meal · Fresh whole fruit daily

═══ MEAL TIMING ═══
06:30 Breakfast | 09:30 Mid-morning | 12:30 Lunch | 15:30 Snack | 19:00 Dinner
Meals every 3 hours. Nothing after 21:30.

═══ WEEKLY ROTATION ═══
Mon: grains/starch | Tue: soup | Wed: legumes (day 22+, skip during detox) | Thu: white protein | Fri: vegetarian | Sat: fish | Sun: red meat

Generate all 21 days. Format: Day number, then each meal as **Meal Name** followed by a one-line description. End each day with a Clinical Note citing specific patient data. Keep it warm and human — this is their roadmap to feeling like themselves again.`;
    try {
      const res = await fetch('/api/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:4000, system:buildMarioSystemPrompt(pd), messages:[{role:'user',content:prompt}] })
      });
      const d = await res.json();
      setDietPlan((d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join(''));
    } catch { setDietPlan('Generation failed. Use the Generate tab to create your meal plan.'); }
    setDietLoading(false);
  };
  const [tab, setTab] = useState('today');
  const [country, setCountry] = useState('SE');
  const [sheet, setSheet] = useState(null); // 'reactive'|'cma'|'wgs'|'meal'|'supplements'
  const [protocolSub, setProtocolSub] = useState('protocol'); // 'protocol'|'rotation'|'meals'|'generate'|'grocery'
  const [logSub, setLogSub] = useState('plate'); // 'plate'|'gut'|'outcomes'|'lookup'

  // Monitor state
  const [monActive, setMonActive] = useState(false);
  const [monTimer, setMonTimer] = useState(0);
  const [monFoods, setMonFoods] = useState([]);
  const [monFoodInput, setMonFoodInput] = useState('');
  const [monTimeline, setMonTimeline] = useState([]);
  const [monMealLabel, setMonMealLabel] = useState('Lunch');
  const [monSpikes, setMonSpikes] = useState([]);
  const [clinView, setClinView] = useState(false);
  const [popup, setPopup] = useState(null);
  const [popupStep, setPopupStep] = useState(0);
  const [popupReactive, setPopupReactive] = useState(null);
  const [popupSymptoms, setPopupSymptoms] = useState([]);
  const [popupSeverity, setPopupSeverity] = useState('');
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupAnalysis, setPopupAnalysis] = useState('');
  const [showDoctorPopup, setShowDoctorPopup] = useState(false);
  const [showDietBasis, setShowDietBasis] = useState(false);
  const [diary, setDiary] = useState([]);

  // Rotation / Meals
  const [rotDay, setRotDay] = useState(1);
  const [proteins, setProteins] = useState({});
  const [picker, setPicker] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeSteps, setRecipeSteps] = useState(null);
  const [activeRecipe, setActiveRecipe] = useState(null);

  // Generate
  const [genPhase, setGenPhase] = useState('detox');
  const [mealScope, setMealScope] = useState('full_day');
  const [eatPat, setEatPat] = useState('standard');
  const [cuisine, setCuisine] = useState('');
  const [genLoad, setGenLoad] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [ifResearch, setIfResearch] = useState(null);
  const [ifLoad, setIfLoad] = useState(false);

  // Grocery
  const [groceryWeek, setGroceryWeek] = useState([1,2,3,4]);
  const [groceryLoad, setGroceryLoad] = useState(false);
  const [groceryList, setGroceryList] = useState(null);
  const [groceryStore, setGroceryStore] = useState(0);

  // Food check
  const [foodQ, setFoodQ] = useState('');

  // Ask Mario chat
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatIn, setChatIn] = useState('');
  const [chatLoad, setChatLoad] = useState(false);
  const chatEndRef = useRef(null);
  const labFileRef = useRef(null);
  const labFileAddRef = useRef(null);
  const plateFileRef = useRef(null);
  const gutFileRef = useRef(null);
  const suppLabelRef = useRef(null);

  // Outcomes
  const [outcomes, setOutcomes] = useState({ baseline:null, checkins:[] });
  const [outSymptoms, setOutSymptoms] = useState([]);
  const [outEnergy, setOutEnergy] = useState(5);
  const [outNotes, setOutNotes] = useState('');

  // GutCheck
  const [gutLogs, setGutLogs] = useState([]);
  const [gutType, setGutType] = useState(null);
  const [gutNotes, setGutNotes] = useState('');
  const [gutPhoto, setGutPhoto] = useState(null);
  const [gutPhotoB64, setGutPhotoB64] = useState(null);
  const [gutAnalysis, setGutAnalysis] = useState('');
  const [gutAnalysisLoad, setGutAnalysisLoad] = useState(false);

  // PlateCheck
  const [plateDesc, setPlateDesc] = useState('');
  const [plateResult, setPlateResult] = useState(null);
  const [plateLoad, setPlateLoad] = useState(false);
  const [platePhoto, setPlatePhoto] = useState(null);
  const [platePhotoB64, setPlatePhotoB64] = useState(null);

  // Medications
  const [medRx, setMedRx] = useState(patient?.medications || '');
  const [medSupp, setMedSupp] = useState(patient?.supplements || '');
  const [suppScanLoad, setSuppScanLoad] = useState(false);
  const [medNotes, setMedNotes] = useState('');
  const [medAnalysis, setMedAnalysis] = useState('');
  const [medLoad, setMedLoad] = useState(false);

  // Lab uploads (dashboard)
  const [dashLabFile, setDashLabFile] = useState(null);
  const [dashLabParsing, setDashLabParsing] = useState(false);
  const [dashLabError, setDashLabError] = useState(false);
  const [dashLabSuccess, setDashLabSuccess] = useState(false);
  const [dashLabFiles, setDashLabFiles] = useState([]);
  const [uploadedLabFiles, setUploadedLabFiles] = useState([]); // [{name, type, size, uploadedAt, storagePath}]

  // Persist full patient data + upload raw file to Supabase Storage
  const persistLabData = async (updatedPatient, file) => {
    if (!authUser?.id) return;
    try {
      // 1. Save parsed data to profiles.patient_data
      const pd = { ...updatedPatient };
      await supabase.from('profiles').upsert({
        id: authUser.id,
        patient_data: JSON.stringify(pd),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      // Update sessionStorage cache
      try { sessionStorage.setItem('mm_profile_' + authUser.id, JSON.stringify(pd)); } catch {}
    } catch (e) { console.error('[persistLabData] profile save error:', e); }

    if (!file) return;
    try {
      // 2. Upload raw file to Supabase Storage
      const path = `${authUser.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: uploadErr } = await supabase.storage
        .from('lab-files')
        .upload(path, file, { upsert: false });
      if (uploadErr) {
        console.warn('[persistLabData] storage upload:', uploadErr.message);
        // Bucket may not exist yet — file metadata still saved in patient_data
      }

      // 3. Track file metadata in patient state
      const fileMeta = {
        name: file.name,
        type: file.type || 'unknown',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        storagePath: path,
      };
      setUploadedLabFiles(prev => [...prev, fileMeta]);
      // Also persist file list to patient_data
      const updatedPd = { ...updatedPatient, uploadedLabFiles: [...(updatedPatient.uploadedLabFiles || []), fileMeta] };
      await supabase.from('profiles').upsert({
        id: authUser.id,
        patient_data: JSON.stringify(updatedPd),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      try { sessionStorage.setItem('mm_profile_' + authUser.id, JSON.stringify(updatedPd)); } catch {}
    } catch (e) { console.error('[persistLabData] file upload error:', e); }
  };

  const dashParseFile = async (file, isAdditional = false) => {
    if (!file) return;
    setDashLabParsing(true); setDashLabError(false); setDashLabSuccess(false);

    // Android can return file.type = "" for camera photos and some file picker sources.
    // Always fall back to extension-based detection.
    const rawName = file.name || '';
    const ext = rawName.includes('.') ? rawName.split('.').pop().toLowerCase() : '';
    const mimeType = file.type || '';
    const isPDF = mimeType === 'application/pdf' || ext === 'pdf';
    const imageExts = ['jpg','jpeg','png','gif','webp','heic','heif','bmp','tiff'];
    const isImage = mimeType.startsWith('image/') || imageExts.includes(ext)
      // Android camera fallback: empty MIME, no known non-image extension → treat as image
      || (mimeType === '' && !['pdf','vcf','txt','doc','docx','zip','csv','tsv'].includes(ext) && file.size > 1024);
    const isVCF = ext === 'vcf' || ext === 'txt';
    const isWord = ext === 'doc' || ext === 'docx';
    const isZip = ext === 'zip' || mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed';
    const imageMediaType = mimeType.startsWith('image/') ? mimeType : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    try {
      // ZIP files — extract and process each file inside
      if (isZip) {
        const arrayBuffer = await file.arrayBuffer();
        // Parse ZIP directory (minimal ZIP reader — handles standard ZIP files)
        const view = new DataView(arrayBuffer);
        const files = [];
        // Find end of central directory
        let eocdOffset = -1;
        for (let i = arrayBuffer.byteLength - 22; i >= Math.max(0, arrayBuffer.byteLength - 65557); i--) {
          if (view.getUint32(i, true) === 0x06054b50) { eocdOffset = i; break; }
        }
        if (eocdOffset >= 0) {
          const cdOffset = view.getUint32(eocdOffset + 16, true);
          const cdEntries = view.getUint16(eocdOffset + 10, true);
          let pos = cdOffset;
          for (let i = 0; i < cdEntries && pos < arrayBuffer.byteLength; i++) {
            if (view.getUint32(pos, true) !== 0x02014b50) break;
            const compMethod = view.getUint16(pos + 10, true);
            const compSize = view.getUint32(pos + 20, true);
            const uncompSize = view.getUint32(pos + 24, true);
            const nameLen = view.getUint16(pos + 28, true);
            const extraLen = view.getUint16(pos + 30, true);
            const commentLen = view.getUint16(pos + 32, true);
            const localOffset = view.getUint32(pos + 42, true);
            const name = new TextDecoder().decode(new Uint8Array(arrayBuffer, pos + 46, nameLen));
            pos += 46 + nameLen + extraLen + commentLen;
            if (name.endsWith('/') || compSize === 0) continue; // skip directories
            // Read local file header to find data start
            const localNameLen = view.getUint16(localOffset + 26, true);
            const localExtraLen = view.getUint16(localOffset + 28, true);
            const dataStart = localOffset + 30 + localNameLen + localExtraLen;
            const rawData = new Uint8Array(arrayBuffer, dataStart, compSize);
            let fileData;
            if (compMethod === 0) { fileData = rawData; }
            else if (compMethod === 8) {
              try { const ds = new DecompressionStream('deflate-raw'); const w = ds.writable.getWriter(); const rr = ds.readable.getReader(); w.write(rawData); w.close(); const chunks = []; let done = false; while (!done) { const { value, done: d } = await rr.read(); if (value) chunks.push(value); done = d; } fileData = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0)); let off = 0; for (const c of chunks) { fileData.set(c, off); off += c.length; } } catch { continue; }
            } else continue;
            const fileExt = name.split('.').pop().toLowerCase();
            if (['vcf','txt','csv','tsv'].includes(fileExt)) {
              files.push({ name, text: new TextDecoder().decode(fileData), type: 'text' });
            } else if (['pdf'].includes(fileExt)) {
              files.push({ name, data: fileData, type: 'pdf' });
            } else if (['jpg','jpeg','png','gif','webp'].includes(fileExt)) {
              files.push({ name, data: fileData, type: 'image', ext: fileExt });
            }
          }
        }
        if (files.length === 0) { setDashLabError('No readable files found in ZIP'); setDashLabParsing(false); return; }
        // Process each extracted file
        for (const zf of files) {
          if (zf.type === 'text') {
            const blob = new Blob([zf.text], { type: 'text/plain' });
            const extracted = new File([blob], zf.name, { type: 'text/plain' });
            await dashParseFile(extracted, isAdditional || files.indexOf(zf) > 0);
          } else if (zf.type === 'pdf') {
            const blob = new Blob([zf.data], { type: 'application/pdf' });
            const extracted = new File([blob], zf.name, { type: 'application/pdf' });
            await dashParseFile(extracted, isAdditional || files.indexOf(zf) > 0);
          } else if (zf.type === 'image') {
            const mtype = zf.ext === 'png' ? 'image/png' : zf.ext === 'webp' ? 'image/webp' : 'image/jpeg';
            const blob = new Blob([zf.data], { type: mtype });
            const extracted = new File([blob], zf.name, { type: mtype });
            await dashParseFile(extracted, isAdditional || files.indexOf(zf) > 0);
          }
        }
        setDashLabParsing(false);
        return;
      }

      // VCF genetic files — stream line-by-line to avoid OOM on large files (23andMe = 25MB, Dante = 400MB)
      if (isVCF) {
        // ── STREAMING VCF READER — never loads full file into memory ──
        // Only SNPs where we can intervene via supplementation, diet, training, hormesis, circadian, or lifestyle
        const clinicalRsIds = new Set([
          // ── METHYLATION & FOLATE CYCLE ──
          'rs1801133','rs1801131', // MTHFR C677T, A1298C — folate metabolism
          'rs1805087',  // MTR A2756G — B12-dependent remethylation
          'rs1801394',  // MTRR A66G — methionine synthase reductase
          'rs234706',   // CBS — transsulfuration, sulfur/ammonia balance
          'rs1979277',  // SHMT1 — serine→glycine, folate pool
          'rs1006737',  // CACNA1C — calcium channel, mood/methylation link
          'rs7946',     // PEMT — choline synthesis (phosphatidylcholine, acetylcholine, bile)
          'rs12325817', // FOLR1 — folate receptor
          'rs602662','rs601338', // FUT2 — B12 absorption, gut Bifidobacterium
          'rs1801198',  // TCN2 — transcobalamin, B12 cellular delivery
          // ── DETOX & GLUTATHIONE ──
          'rs1695','rs1138272', // GSTP1 — Phase II glutathione conjugation
          'rs1056806',  // GSTM1 — glutathione S-transferase mu
          'rs1138272',  // GSTP1 Ile105Val
          'rs4880',     // SOD2 (MnSOD) — mitochondrial superoxide dismutase
          'rs1001179',  // CAT — catalase, H2O2 clearance
          'rs7943316',  // HMOX1 — heme oxygenase, oxidative stress response
          'rs2066853',  // AHR — aryl hydrocarbon receptor, xenobiotic detox
          'rs1048943','rs4646903', // CYP1A1 — Phase I detox, polycyclic aromatic hydrocarbons
          'rs762551',   // CYP1A2 — caffeine metabolism, circadian impact
          'rs1799853','rs1057910', // CYP2C9 — drug/toxin metabolism
          'rs4244285',  // CYP2C19 — drug metabolism (PPIs, SSRIs)
          'rs3892097',  // CYP2D6 — drug metabolism (beta-blockers, antidepressants)
          'rs4149056',  // SLCO1B1 — hepatic transporter, statin clearance
          // ── INFLAMMATION & IMMUNITY ──
          'rs1800795',  // IL6 — interleukin-6 promoter, inflammatory response
          'rs1800629',  // TNF-α — tumor necrosis factor, systemic inflammation
          'rs1143634',  // IL1B — interleukin-1β, inflammatory cascade
          'rs1800896',  // IL10 — anti-inflammatory cytokine capacity
          'rs20417',    // COX2/PTGS2 — prostaglandin synthesis, pain/inflammation
          'rs2241880',  // ATG16L1 — autophagy, gut immune homeostasis
          'rs3135388',  // HLA-DRB1 — adaptive immunity, autoimmune risk
          'rs2476601',  // PTPN22 — T-cell activation threshold
          // ── LONGEVITY PATHWAYS (SIRT1, AMPK, mTOR, telomeres) ──
          'rs7895833','rs7069102','rs2273773', // SIRT1 — silent information regulator, longevity
          'rs2249105',  // PRKAA2/AMPK — energy sensor, autophagy activation
          'rs1801282',  // PPARγ — metabolic regulation, insulin sensitivity, fat storage
          'rs9939609','rs1421085','rs17817449', // FTO — appetite, obesity, exercise epigenetics
          'rs7903146',  // TCF7L2 — strongest T2D genetic risk, GLP-1 secretion
          'rs1050450',  // GPX1 — glutathione peroxidase, selenium-dependent antioxidant
          'rs10936599', // TERC — telomerase RNA component, telomere length
          'rs2736100',  // TERT — telomerase reverse transcriptase, cellular ageing
          'rs11568820','rs2228570','rs1544410','rs7975232', // VDR — vitamin D receptor, immune modulation, longevity
          'rs10741657','rs2060793', // CYP2R1 — vitamin D activation
          'rs429358','rs7412', // APOE — lipid metabolism, neurodegeneration, longevity
          'rs1800562','rs1799945', // HFE — iron overload, Fenton reaction damage
          // ── NUTRIENT METABOLISM ──
          'rs4588','rs7041', // GC/VDBP — vitamin D binding protein
          'rs12934922','rs7501331', // BCMO1 — beta-carotene→retinol conversion
          'rs174547','rs174546','rs174570', // FADS1/2 — omega-3/6 desaturation (ALA→EPA→DHA)
          'rs4654748',  // NBPF3 — vitamin B6 metabolism
          'rs1801198',  // TCN2 — B12 transport
          'rs4680','rs4633','rs4818', // COMT — catecholamine clearance, polyphenol metabolism
          'rs1799998',  // CYP11B2 — aldosterone, sodium/potassium balance
          'rs1800588',  // LIPC — hepatic lipase, HDL metabolism
          'rs328',      // LPL — lipoprotein lipase, triglyceride clearance
          // ── CIRCADIAN RHYTHM & SLEEP ──
          'rs57875989', // PER2 — period circadian clock, sleep timing
          'rs12649507', // CLOCK — circadian locomotor output cycles kaput
          'rs2287161',  // CRY1 — cryptochrome, delayed sleep phase
          'rs73598374', // ADA — adenosine deaminase, deep sleep quality
          'rs5751876',  // ADORA2A — adenosine receptor, caffeine sensitivity + sleep pressure
          'rs228697',   // PER3 — period 3, morning/evening chronotype
          // ── SYMPATHETIC / PARASYMPATHETIC / VAGUS / ANS ──
          'rs6323',     // MAOA — monoamine oxidase A, serotonin/NE/dopamine breakdown
          'rs1042713','rs1042714', // ADRB2 — beta-2 adrenergic receptor, catecholamine sensitivity
          'rs1800544',  // ADRA2A — alpha-2 adrenergic, sympathetic regulation
          'rs53576','rs2254298', // OXTR — oxytocin receptor, social bonding, parasympathetic
          'rs1800497',  // DRD2/ANKK1 — dopamine D2 receptor density, reward system
          'rs4570625',  // TPH2 — tryptophan hydroxylase 2, serotonin synthesis in brain
          'rs6295',     // HTR1A — serotonin 1A receptor, anxiety, vagal tone
          'rs25531',    // SLC6A4 (5-HTTLPR) — serotonin transporter, stress resilience
          'rs165599',   // COMT 3'UTR — additional COMT regulation variant
          // ── EXERCISE & HORMESIS RESPONSE ──
          'rs1815739',  // ACTN3 — alpha-actinin-3, fast-twitch muscle (power vs endurance)
          'rs8192678',  // PPARGC1A (PGC-1α) — mitochondrial biogenesis, endurance capacity
          'rs1042713',  // ADRB2 — exercise heart rate response
          'rs4253778',  // PPARα — fat oxidation during exercise
          'rs699',      // AGT — angiotensinogen, blood pressure response to exercise
          'rs5443',     // GNB3 — G-protein β3, exercise blood pressure response
          'rs1800169',  // BDNF — brain-derived neurotrophic factor, exercise-brain link
          'rs6265',     // BDNF Val66Met — neuroplasticity, exercise mental health benefit
          'rs1800012',  // COL1A1 — collagen type I, tendon/ligament injury risk
          'rs12722',    // COL5A1 — collagen type V, flexibility and injury risk
          'rs1799752',  // ACE I/D — angiotensin converting enzyme, endurance vs power
          // ── SUN / SKIN / UV RESPONSE ──
          'rs1805007','rs1805008','rs1805009', // MC1R — melanocortin receptor, UV sensitivity, vitamin D synthesis efficiency
          'rs16891982', // SLC45A2 — skin pigmentation, UV damage susceptibility
          'rs12913832', // HERC2/OCA2 — eye/skin colour, UV tolerance
        ]);

        // ── STREAM the file line-by-line — never loads full VCF into RAM ──
        const relevantLines = [];
        let lastHeaderLine = '';
        let totalDataLines = 0;
        let done = false;

        try {
          const streamReader = file.stream().getReader();
          const decoder = new TextDecoder();
          let lineBuffer = '';

          while (!done) {
            const { value, done: streamDone } = await streamReader.read();
            done = streamDone;
            lineBuffer += decoder.decode(value || new Uint8Array(), { stream: !done });
            // Process all complete lines in buffer
            let nlIdx;
            while ((nlIdx = lineBuffer.indexOf('\n')) >= 0) {
              const line = lineBuffer.slice(0, nlIdx).trimEnd();
              lineBuffer = lineBuffer.slice(nlIdx + 1);
              if (!line) continue;
              if (line.startsWith('#')) { lastHeaderLine = line; continue; }
              totalDataLines++;
              const rsMatch = line.match(/rs\d+/g);
              if (rsMatch && rsMatch.some(rs => clinicalRsIds.has(rs))) {
                relevantLines.push(line);
                if (relevantLines.length >= 500) { done = true; streamReader.cancel(); break; }
              }
            }
          }
          // Process any remaining buffered text
          if (lineBuffer.trim() && !lineBuffer.startsWith('#')) {
            totalDataLines++;
            const rsMatch = lineBuffer.match(/rs\d+/g);
            if (rsMatch && rsMatch.some(rs => clinicalRsIds.has(rs))) relevantLines.push(lineBuffer.trim());
          }
        } catch (streamErr) {
          // Fallback for browsers without stream() — read whole file (may be slow on large files)
          console.warn('[VCF] stream() unavailable, falling back to file.text():', streamErr.message);
          const textContent = await file.text();
          const allLines = textContent.split('\n');
          for (const line of allLines) {
            if (!line.trim()) continue;
            if (line.startsWith('#')) { lastHeaderLine = line; continue; }
            totalDataLines++;
            const rsMatch = line.match(/rs\d+/g);
            if (rsMatch && rsMatch.some(rs => clinicalRsIds.has(rs))) {
              relevantLines.push(line);
              if (relevantLines.length >= 500) break;
            }
          }
        }

        // Fallback: if no clinical matches, grab first 300 lines with any rsID
        if (relevantLines.length === 0 && totalDataLines > 0) {
          try {
            const slice = await file.slice(0, 500000).text();
            for (const line of slice.split('\n')) {
              if (!line.trim() || line.startsWith('#')) continue;
              if (/rs\d+/.test(line)) { relevantLines.push(line); if (relevantLines.length >= 300) break; }
            }
          } catch {}
        }

        const filteredContent = [lastHeaderLine, ...relevantLines].filter(Boolean).join('\n');
        const snpCount = relevantLines.length;

        if (snpCount === 0 && totalDataLines === 0) {
          setDashLabError('No genetic data found in this file. Is it a valid VCF?');
          setDashLabParsing(false);
          return;
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            max_tokens: 4000,
            system: 'You are a clinical genomics analyst specialising in actionable SNPs. Extract variants from VCF/genetic files and return structured JSON. ONLY include variants where a specific intervention exists (supplementation, diet, training type, hormesis protocol, circadian adjustment, or lifestyle change). Discard benign/normal variants and anything without a clear clinical action.',
            messages: [{ role: 'user', content: `This is genetic data (VCF or similar format) with ${snpCount} pre-filtered lines out of ${totalDataLines} total variants.

TASK: For each variant, extract:
- rsid (e.g. rs1801133) — from ID column or anywhere in the line
- gene (e.g. MTHFR) — infer from rsID if not in file
- genotype (e.g. CT, TT, CC) — from GT field, ALT/REF, or genotype columns
- status: "risk" (homozygous variant), "carrier" (heterozygous), or "normal" (wild type)
- domain: one of "methylation", "detox", "inflammation", "longevity", "nutrients", "circadian", "ans" (autonomic nervous system), "exercise", "sun"
- impact: one sentence — MUST state the specific intervention (e.g. "Supplement methylfolate 400-800mcg, prioritise dark leafy greens" or "Avoid HIIT in Phase 1, zone 2 cardio preferred" or "Hard caffeine cutoff 10:00, melatonin onset delayed")

RULES:
- ONLY include variants where genotype differs from wild-type reference OR where even carrier status is clinically relevant
- Skip variants with status "normal" UNLESS the normal status itself is clinically useful (e.g. fast COMT = can tolerate polyphenols freely)
- The data may use tabs, spaces, or commas as delimiters
- If genotype cannot be determined, still include the variant with genotype "unknown" if the rsID is clinically important

Return ONLY this JSON (no markdown, no explanation):
{"snps":[{"rsid":"rs1801133","gene":"MTHFR","genotype":"CT","status":"carrier","domain":"methylation","impact":"Folate cycle ~35% reduced. Supplement methylfolate 400mcg, prioritise dark leafy greens, avoid folic acid."}]}

Data:
${filteredContent.slice(0, 30000)}` }],
          }),
        });
        if (!res.ok) throw new Error('API returned ' + res.status);
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
        let json = {};
        const cleanText = text.replace(/```json|```/g, '').trim();
        try { json = JSON.parse(cleanText); } catch {
          // Find the outermost JSON object containing "snps"
          const start = cleanText.indexOf('{"snps"');
          const start2 = cleanText.indexOf('{ "snps"');
          const idx = start >= 0 ? start : start2;
          if (idx >= 0) {
            let depth = 0; let end = idx;
            for (let i = idx; i < cleanText.length; i++) {
              if (cleanText[i] === '{') depth++;
              else if (cleanText[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
            }
            try { json = JSON.parse(cleanText.slice(idx, end)); } catch {}
          }
          // Last resort — try to find any JSON with snps array
          if (!json.snps) {
            const m = cleanText.match(/\{[\s\S]*"snps"\s*:\s*\[[\s\S]*\]\s*[\s\S]*\}/);
            if (m) try { json = JSON.parse(m[0]); } catch {}
          }
        }
        if (json.snps?.length) {
          const updatedSnps = [...(patient.genomicSnps || []).filter(s => !json.snps.find(n => n.rsid === s.rsid)), ...json.snps];
          setPatient(p => { const updated = { ...p, genomicSnps: updatedSnps }; persistLabData(updated, file); return updated; });
        }
        setDashLabFiles(prev => [...prev.filter(f => f !== file.name), file.name]);
        const hasData = (json.snps?.length || 0) > 0;
        if (hasData) {
          setDashLabSuccess(true);
        } else {
          setDashLabError('No clinically relevant SNPs found in this VCF file');
        }
        setDashLabParsing(false);
        return;
      }

      // Word / text files — file.text() handles Android content:// URIs; FileReader does not
      if (isWord) {
        const textContent = await file.text();
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            max_tokens: 4000,
            system: 'You extract structured data from medical lab results. Return only valid JSON.',
            messages: [{ role: 'user', content: `This is a document with lab results. Extract any relevant health data.\n\nExtract reactive foods:\n{"severe":[],"moderate":[],"mild":[]}\n\nFile contents:\n${textContent.slice(0, 50000)}` }],
          }),
        });
        if (!res.ok) throw new Error('API returned ' + res.status);
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
        let json = { severe: [], moderate: [], mild: [] };
        try { json = JSON.parse(text.replace(/```json|```/g, '').trim()); } catch {}
        const norm = arr => (Array.isArray(arr) ? arr : []).map(f => String(f).toLowerCase().trim()).filter(Boolean);
        const newS = norm(json.severe), newM = norm(json.moderate), newMi = norm(json.mild);
        if (newS.length || newM.length || newMi.length) {
          if (isAdditional) {
            setPatient(p => ({
              ...p,
              severe: [...new Set([...(p.severe||[]), ...newS])],
              moderate: [...new Set([...(p.moderate||[]), ...newM])],
              mild: [...new Set([...(p.mild||[]), ...newMi])],
            }));
          } else {
            setPatient(p => ({ ...p, severe: newS, moderate: newM, mild: newMi }));
          }
        }
        setDashLabFiles(prev => [...prev.filter(f => f !== file.name), file.name]);
        setDashLabSuccess(true);
        setDashLabParsing(false);
        return;
      }

      // PDF / Image — arrayBuffer() handles Android content:// URIs; FileReader does not
      const base64 = await fileToBase64(file);
      const fileBlock = isPDF
        ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
        : { type: 'image', source: { type: 'base64', media_type: imageMediaType, data: base64 } };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 4000,
          system: 'You extract structured data from medical lab results. Return only valid JSON, nothing else.',
          messages: [{ role: 'user', content: [
            fileBlock,
            { type: 'text', text: `This is a medical lab test result. Identify the report type and extract ALL data.

REPORT TYPE 1 — ALCAT (food immune reactivity):
Extract every food/substance with a reactivity level.
- Red / Class 3-4 / SEVERE → "severe" array
- Orange / Class 2 / MODERATE → "moderate" array
- Yellow / Class 1 / MILD → "mild" array
- Green / Class 0 / ACCEPTABLE → omit

REPORT TYPE 2 — CMA / CNA (Cell Science Systems intracellular micronutrient analysis):
This report tests ~55 micronutrients including vitamins, minerals, amino acids, antioxidants, fatty acids, and metabolites. Extract EVERY nutrient tested with its actual value.

For the summary arrays:
- Any nutrient marked DEFICIENT, VERY LOW, or critically below range → "severe"
- Any nutrient marked LOW, BORDERLINE, or below optimal → "moderate"
- Any nutrient in ADEQUATE / NORMAL / within range → "mild"

Also extract the FULL detailed data:
- "cma_deficiencies": array of below-range nutrient names
- "cma_adequate": array of in-range nutrient names
- "cma_nutrients": array of objects for EVERY nutrient: [{"name":"vitamin d","value":32,"unit":"ng/mL","range_low":30,"range_high":100,"status":"adequate|low|deficient"}]
- "redox_score": the REDOX / Spectrox / Total Antioxidant Function score if present (numeric)
- "cma_antioxidants": array of antioxidant nutrients specifically: [{"name":"glutathione","value":...,"status":"adequate|low|deficient"}]
- "cma_categories": group nutrients by category if visible: {"vitamins":[],"minerals":[],"amino_acids":[],"antioxidants":[],"fatty_acids":[],"metabolites":[]}

REPORT TYPE 3 — Blood work / other:
Extract any out-of-range markers into "moderate", normal into "mild".

Return ONLY this JSON (no markdown):
{"report_type":"ALCAT|CMA|LAB","severe":[],"moderate":[],"mild":[],"cma_deficiencies":[],"cma_adequate":[],"cma_nutrients":[],"redox_score":null,"cma_antioxidants":[],"cma_categories":{}}
Lowercase English names. Translate Swedish to English. Include EVERY nutrient found — do not skip any.` }
          ] }],
        }),
      });

      if (!res.ok) throw new Error('API returned ' + res.status);
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');

      let json = { severe: [], moderate: [], mild: [] };
      try { json = JSON.parse(text.replace(/```json|```/g, '').trim()); }
      catch { const m = text.match(/\{[\s\S]*?"severe"[\s\S]*?\}/); if (m) try { json = JSON.parse(m[0]); } catch {} }

      const norm = arr => (Array.isArray(arr) ? arr : []).map(f => String(f).toLowerCase().trim()).filter(Boolean);
      const newS = norm(json.severe), newM = norm(json.moderate), newMi = norm(json.mild);
      const isCMA = json.report_type === 'CMA' || norm(json.cma_deficiencies).length > 0 || norm(json.cma_adequate).length > 0;
      const cmaDef = norm(json.cma_deficiencies);
      const cmaAdeq = norm(json.cma_adequate);
      const cmaNutrients = Array.isArray(json.cma_nutrients) ? json.cma_nutrients : [];
      const redoxScore = json.redox_score != null ? Number(json.redox_score) : null;
      const cmaAntioxidants = Array.isArray(json.cma_antioxidants) ? json.cma_antioxidants : [];
      const cmaCategories = json.cma_categories && typeof json.cma_categories === 'object' ? json.cma_categories : {};

      if (isCMA) {
        // CMA/CNA report — store full nutrient data separately, don't overwrite ALCAT food reactivity
        setPatient(p => {
          const updated = {
            ...p,
            cmaDeficiencies: [...new Set([...(p.cmaDeficiencies||[]), ...cmaDef, ...newS, ...newM])],
            cmaAdequate: [...new Set([...(p.cmaAdequate||[]), ...cmaAdeq, ...newMi])],
            cmaAllNutrients: [...new Set([...(p.cmaAllNutrients||[]), ...cmaDef, ...cmaAdeq, ...newS, ...newM, ...newMi])],
            cmaNutrients: [...(p.cmaNutrients||[]).filter(n => !cmaNutrients.find(cn => cn.name === n.name)), ...cmaNutrients],
            redoxScore: redoxScore ?? p.redoxScore,
            cmaAntioxidants: [...(p.cmaAntioxidants||[]).filter(n => !cmaAntioxidants.find(cn => cn.name === n.name)), ...cmaAntioxidants],
            cmaCategories: { ...(p.cmaCategories||{}), ...cmaCategories },
          };
          persistLabData(updated, file);
          return updated;
        });
      } else if (isAdditional) {
        setPatient(p => {
          const updated = {
            ...p,
            severe: [...new Set([...(p.severe||[]), ...newS])],
            moderate: [...new Set([...(p.moderate||[]), ...newM])],
            mild: [...new Set([...(p.mild||[]), ...newMi])],
            alcat_severe: [...new Set([...(p.alcat_severe||[]), ...newS])],
            alcat_moderate: [...new Set([...(p.alcat_moderate||[]), ...newM])],
            alcat_mild: [...new Set([...(p.alcat_mild||[]), ...newMi])],
          };
          persistLabData(updated, file);
          return updated;
        });
      } else {
        setPatient(p => {
          const updated = {
            ...p,
            severe: newS, moderate: newM, mild: newMi,
            alcat_severe: newS, alcat_moderate: newM, alcat_mild: newMi,
          };
          persistLabData(updated, file);
          return updated;
        });
      }

      setDashLabFiles(prev => [...prev.filter(f => f !== file.name), file.name]);
      const totalItems = newS.length + newM.length + newMi.length + cmaDef.length + cmaAdeq.length;
      const hasResults = totalItems > 0;
      if (!hasResults) { setDashLabError('0 items extracted — try a clearer file or different page'); }
      else {
        setDashLabSuccess(true);
        // Also save ALCAT to dedicated table for backwards compat
        if (authUser?.id && !isCMA) {
          try {
            const p = patient;
            const finalS = isAdditional ? [...new Set([...(p.severe||[]), ...newS])] : newS;
            const finalM = isAdditional ? [...new Set([...(p.moderate||[]), ...newM])] : newM;
            const finalMi = isAdditional ? [...new Set([...(p.mild||[]), ...newMi])] : newMi;
            await supabase.from('alcat_results').upsert({
              patient_id: authUser.id, severe: finalS, moderate: finalM, mild: finalMi,
              test_date: new Date().toISOString().split('T')[0], lab_id: file.name,
              created_at: new Date().toISOString(),
            }, { onConflict: 'patient_id' });
          } catch {}
        }
      }
    } catch (err) {
      console.error('[Lab upload]', err);
      setDashLabError(err.message || 'Upload failed');
    }
    setDashLabParsing(false);
  };

  const monIntervalRef = useRef(null);

  // Load profile from Supabase for a given user
  const loadProfile = async (user) => {
    if (!user) return null;
    // 1. Check sessionStorage first (instant, no network, set on onboarding complete)
    try {
      const local = sessionStorage.getItem('mm_profile_' + user.id);
      if (local) {
        const pd = JSON.parse(local);
        if (pd?.name) { console.log('[profile] from sessionStorage'); return pd; }
      }
    } catch {}
    // 2. Try profiles.patient_data (primary source — camelCase JSON blob)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, patient_data, onboarding_complete')
        .eq('id', user.id)
        .single();
      if (!error && data?.onboarding_complete && data?.patient_data) {
        const pd = typeof data.patient_data === 'string'
          ? JSON.parse(data.patient_data)
          : data.patient_data;
        // Accept profile if it has either a name inside patient_data OR a full_name in the profiles row
        if (!pd?.name && data?.full_name) {
          // patient_data exists but name field is missing — patch it from full_name
          if (pd) pd.name = data.full_name;
          else { return { name: data.full_name }; }
        }
        if (pd?.name) {
          console.log('[profile] from profiles.patient_data');
          // Also load ALCAT results if not already in patient_data
          if (!(pd.alcat_severe?.length || pd.alcat_moderate?.length || pd.alcat_mild?.length)) {
            try {
              const { data: alcat } = await supabase
                .from('alcat_results')
                .select('severe, moderate, mild')
                .eq('patient_id', user.id)
                .single();
              if (alcat) {
                pd.alcat_severe = alcat.severe || [];
                pd.alcat_moderate = alcat.moderate || [];
                pd.alcat_mild = alcat.mild || [];
                pd.severe = alcat.severe || [];
                pd.moderate = alcat.moderate || [];
                pd.mild = alcat.mild || [];
              }
            } catch {}
          }
          // Cache to sessionStorage for next time
          try { sessionStorage.setItem('mm_profile_' + user.id, JSON.stringify(pd)); } catch {}
          return pd;
        }
      }
      if (!error && data?.full_name) return { name: data.full_name };
    } catch (e) { console.error('[profile] profiles query failed:', e); }
    // 3. Try onboarding_intake (fallback — map snake_case → camelCase)
    try {
      const { data, error } = await supabase
        .from('onboarding_intake')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data?.name) {
        console.log('[profile] from onboarding_intake (mapping snake_case)');
        const pd = {
          name: data.name,
          dob: data.dob,
          sex: data.sex,
          hormonalStatus: data.hormonal_status || data.hormonalStatus || '',
          geographyOfOrigin: data.geography_of_origin || data.geographyOfOrigin || '',
          yearsInCurrentCountry: data.years_in_current_country || data.yearsInCurrentCountry || '',
          symptoms: data.symptoms || [],
          tests: data.tests || [],
          medications: data.medications || '',
          supplements: data.supplements || '',
          conditions: data.conditions || '',
          goals: data.goals || [],
          alcat_severe: data.alcat_severe || [],
          alcat_moderate: data.alcat_moderate || [],
          alcat_mild: data.alcat_mild || [],
          severe: data.alcat_severe || [],
          moderate: data.alcat_moderate || [],
          mild: data.alcat_mild || [],
          profileComplete: true,
          protocol: 'Option A — 21-day universal detox',
          phase: 1, dayInProtocol: 1,
          alsoAvoid: { candida: [], whey: [] },
          markers: [],
        };
        // Also check alcat_results table
        try {
          const { data: alcat } = await supabase
            .from('alcat_results')
            .select('severe, moderate, mild')
            .eq('patient_id', user.id)
            .single();
          if (alcat) {
            pd.alcat_severe = alcat.severe || pd.alcat_severe;
            pd.alcat_moderate = alcat.moderate || pd.alcat_moderate;
            pd.alcat_mild = alcat.mild || pd.alcat_mild;
            pd.severe = alcat.severe || pd.severe;
            pd.moderate = alcat.moderate || pd.moderate;
            pd.mild = alcat.mild || pd.mild;
          }
        } catch {}
        // Cache to sessionStorage
        try { sessionStorage.setItem('mm_profile_' + user.id, JSON.stringify(pd)); } catch {}
        // Backfill profiles table so next login is faster
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: pd.name,
            onboarding_complete: true,
            patient_data: JSON.stringify(pd),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch {}
        return pd;
      }
    } catch (e) { console.error('[profile] onboarding_intake query failed:', e); }
    return null;
  };

  // Auth state on mount
  useEffect(() => {
    // Safety timeout — never stay stuck on LOADING
    const authTimeout = setTimeout(() => {
      setAuthChecked(prev => { if (!prev) console.warn('[auth] timeout — forcing authChecked'); return true; });
    }, 5000);

    // Check existing session and load profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user || null;
      setAuthUser(user);
      if (user) {
        const profile = await loadProfile(user);
        if (profile?.name) {
          // Returning user — hydrate patient and go straight to dashboard
          setPatient(p => ({ ...p, ...profile, profileComplete: true }));
          if (profile.uploadedLabFiles?.length) {
            setUploadedLabFiles(profile.uploadedLabFiles);
            setDashLabFiles(profile.uploadedLabFiles.map(f => f.name));
            setDashLabSuccess(true);
          }
          setShowLanding(false);
          setShowOnboarding(false);
          setShowAuth(false);
        } else {
          // Profile not found — could be a page reload after camera/app switch on Android.
          // A signed-in user has ALREADY completed onboarding at some point.
          // Don't force them back — retry once after a short delay.
          setTimeout(async () => {
            const retryProfile = await loadProfile(user);
            if (retryProfile?.name) {
              setPatient(p => ({ ...p, ...retryProfile, profileComplete: true }));
              if (retryProfile.uploadedLabFiles?.length) {
                setUploadedLabFiles(retryProfile.uploadedLabFiles);
                setDashLabFiles(retryProfile.uploadedLabFiles.map(f => f.name));
                setDashLabSuccess(true);
              }
              setShowLanding(false);
              setShowOnboarding(false);
              setShowAuth(false);
            } else {
              // Still no profile — show landing so they can start fresh, but don't force onboarding
              setShowLanding(true);
              setShowOnboarding(false);
            }
          }, 1500);
        }
      }
      clearTimeout(authTimeout);
      setAuthChecked(true);
    }).catch(err => {
      console.error('[auth] getSession failed:', err);
      clearTimeout(authTimeout);
      setAuthChecked(true);
    });

    // Listen for auth changes (magic link click)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setAuthUser(user);
      if (event === 'SIGNED_IN' && user) {
        setShowAuth(false);
        const profile = await loadProfile(user);
        if (profile?.name) {
          setPatient(p => ({ ...p, ...profile, profileComplete: true }));
          if (profile.uploadedLabFiles?.length) {
            setUploadedLabFiles(profile.uploadedLabFiles);
            setDashLabFiles(profile.uploadedLabFiles.map(f => f.name));
            setDashLabSuccess(true);
          }
          setShowLanding(false);
          setShowOnboarding(false);
        } else {
          // Signed-in user with no profile found — could be a transient load failure.
          // Don't force onboarding: stay on landing so they can choose.
          setShowLanding(true);
          setShowOnboarding(false);
        }
      }
      if (event === 'SIGNED_OUT') {
        setShowAuth(true);
        setShowLanding(false);
        setPatient({});
      }
    });
    return () => { subscription.unsubscribe(); clearTimeout(authTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Geo detection on mount
  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r=>r.json()).then(d=>{
      const cc = d.country_code;
      if (cc === 'SE' || cc === 'US' || cc === 'GB' || cc === 'DE') setCountry(cc);
    }).catch(()=>{});
  }, []);

  // Scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatMsgs]);

  // Monitor interval
  useEffect(() => {
    if (monActive) {
      monIntervalRef.current = setInterval(() => setMonTimer(t => t + 1), 1000);
    } else clearInterval(monIntervalRef.current);
    return () => clearInterval(monIntervalRef.current);
  }, [monActive]);

  const startMonitoring = () => {
    const tl = simulateTimeline(monFoods.some(f => [...(patient.severe||[]),...(patient.moderate||[])].some(s => f.toUpperCase().includes(s))));
    setMonTimeline(tl); setMonActive(true); setMonTimer(0); setMonSpikes([]);
    setTimeout(() => {
      const sp = detectSpikes(tl);
      setMonSpikes(sp);
      if (sp.length > 0) { setPopup(sp[0]); setPopupStep(0); setPopupSymptoms([]); setPopupSeverity(''); setPopupAnalysis(''); }
    }, 8000);
  };

  const logAndDismiss = async () => {
    setPopupLoading(true);
    const sys = buildMarioSystemPrompt(patient);
    const prompt = `The patient just had a ${popup.label} (${popup.val}) ${popup.min} minutes after eating ${monFoods.join(', ')}. They reported ${popupReactive?'possible reactive food':'strict protocol'} and symptoms: ${popupSymptoms.join(', ')||'none noted'}. Severity: ${popupSeverity||'unspecified'}. Give a brief, human, clinical explanation and next action. 3-4 sentences max.`;
    try {
      const analysis = await callClaude([{ role:'user',content:prompt }], sys);
      setPopupAnalysis(analysis);
      const flagClinic = popup.level === 'severe' || popupSeverity === 'severe';
      setDiary(d => [{ id:Date.now(), ts:new Date(), meal:monMealLabel, foods:[...monFoods], spike:popup, symptoms:[...popupSymptoms], severity:popupSeverity, reactive:popupReactive, analysis, flagClinic }, ...d]);
      setPopupStep(3);
    } catch { setPopupAnalysis('Unable to connect. Reaction logged locally.'); setPopupStep(3); }
    setPopupLoading(false);
  };

  const genMenu = async () => {
    if (!cuisine || genLoad) return; setGenLoad(true); setGenResult(null);
    const rot = (patient.rotation||{})[rotDay] || {};
    const cu = CUISINES.find(c => c.id === cuisine)?.label;
    const ep = EAT_PATS.find(e => e.id === eatPat);
    const foods = rot.grains ? `Grains: ${rot.grains.join(', ')}\nVeg: ${rot.veg.join(', ')}\nFruit: ${rot.fruit.join(', ')}\nProtein: ${rot.protein.join(', ')}\nMisc: ${rot.misc.join(', ')}` : 'Patient rotation not yet loaded.';
    const pInstr = eatPat === 'standard' ? 'Standard 6 meals every 3h.' : ep?.detail || 'Intermittent fasting protocol.';
    const severe = (patient.severe||[]).join(', ');
    const cmaD = (patient.cmaDeficiencies||[]).join(', ');
    const snpNotes = (patient.genomicSnps||[]).filter(s=>s.status!=='normal').slice(0,20).map(s=>`${s.gene} ${s.rsid} [${s.status}]: ${s.impact}`).join('; ');
    const prompt = `Generate a ${mealScope === 'full_day' ? 'full day' : mealScope} menu in ${cu} style.\nHARD RULES: Day ${rotDay} foods only. Avoid: ${severe}. No sugars/yeast/vinegar. No seed oils. CPF every main meal. Fruit only with protein/fat in snacks.\nDay ${rotDay}:\n${foods}\n${pInstr}${cmaD ? `\nCMA deficiencies to correct: ${cmaD}` : ''}${patient.redoxScore!=null ? `\nREDOX: ${patient.redoxScore}/100` : ''}${snpNotes ? `\nKey genetic variants: ${snpNotes}` : ''}\nFormat: **Dish Name** then one sentence description citing which gene/nutrient it targets. End with a Clinical Notes paragraph referencing specific SNPs, CMA values, and ALCAT exclusions that drove the choices.`;
    try { const r = await callClaude([{ role:'user',content:prompt }], buildMarioSystemPrompt(patient)); setGenResult(r); } catch { setGenResult('Error. Please try again.'); }
    setGenLoad(false);
  };

  const fetchRecipeSteps = async (day, mealKey, protein, base, sides) => {
    setRecipeLoading(true); setRecipeSteps(null);
    const prompt = `Write a step-by-step recipe:\nDish: ${protein} — ${base}${sides ? ' · ' + sides : ''}\nALCAT Day ${day} rotation. No seed oils. Avoid: ${(patient.severe||[]).join(', ')}. 1 person.\n\nFormat:\nPREP TIME: X min | COOK TIME: X min | SERVES: 1\n\nINGREDIENTS:\n- [ingredient with amount]\n\nSTEPS:\n1. [step]\n(max 8 steps)\n\nCLINICAL NOTE: One sentence on ALCAT relevance.`;
    try { const r = await callClaude([{ role:'user',content:prompt }], buildMarioSystemPrompt(patient)); setRecipeSteps(r); } catch { setRecipeSteps('Error loading recipe.'); }
    setRecipeLoading(false);
  };

  const buildGroceryList = async () => {
    if (groceryLoad) return; setGroceryLoad(true); setGroceryList(null);
    const rot = patient.rotation || {};
    const days = groceryWeek;
    const allFoodsList = days.map(d => {
      const r = rot[d] || {};
      return `Day ${d}: Grains: ${(r.grains||[]).slice(0,3).join(', ')} | Veg: ${(r.veg||[]).slice(0,5).join(', ')} | Protein: ${(r.protein||[]).slice(0,3).join(', ')} | Fruit: ${(r.fruit||[]).slice(0,3).join(', ')} | Misc: ${(r.misc||[]).slice(0,3).join(', ')}`;
    }).join('\n');
    const prompt = `Generate a structured weekly grocery list for the ALCAT rotation protocol.\nRotation days: ${days.join(', ')}\n${allFoodsList}\nRules: No seed oils. Avoid: ${(patient.severe||[]).join(', ')}. No sugar/yeast. No dairy. Organic where possible. Wild-caught fish only.\n\nFormat:\n**FISH & PROTEIN**\n**VEGETABLES**\n**FRUITS**\n**GRAINS & STARCHES**\n**OILS & FATS**\n**HERBS & SPICES**\n**STORE NOTES** (2-3 sentences)`;
    try { const r = await callClaude([{ role:'user',content:prompt }], buildMarioSystemPrompt(patient)); setGroceryList(r); } catch { setGroceryList('Error generating list.'); }
    setGroceryLoad(false);
  };

  // Build compact patient data context for chat messages
  const buildPatientContext = () => {
    const p = patient;
    const parts = [];
    if (p.severe?.length) parts.push(`ALCAT severe (avoid): ${p.severe.join(', ')}`);
    if (p.moderate?.length) parts.push(`ALCAT moderate: ${p.moderate.join(', ')}`);
    if (p.cmaDeficiencies?.length) parts.push(`CMA deficiencies: ${p.cmaDeficiencies.join(', ')}`);
    if (p.cmaNutrients?.length) {
      const low = p.cmaNutrients.filter(n=>n.status==='deficient'||n.status==='low');
      if (low.length) parts.push(`CMA low values: ${low.map(n=>`${n.name}: ${n.value}${n.unit?' '+n.unit:''} [${n.status}]`).join(', ')}`);
    }
    if (p.redoxScore!=null) parts.push(`REDOX: ${p.redoxScore}/100`);
    if (p.cmaAntioxidants?.length) parts.push(`Antioxidants: ${p.cmaAntioxidants.map(a=>`${a.name}: ${a.status}${a.value!=null?' ('+a.value+')':''}`).join(', ')}`);
    if (p.genomicSnps?.length) {
      const risk = p.genomicSnps.filter(s=>s.status==='risk'||s.status==='carrier');
      if (risk.length) parts.push(`Key genetic variants (${risk.length}):\n${risk.map(s=>`  ${s.gene} ${s.rsid} ${s.genotype} [${s.status}]: ${s.impact}`).join('\n')}`);
    }
    if (p.dayInProtocol) parts.push(`Day ${p.dayInProtocol} of protocol`);
    return parts.length ? `\n\n[PATIENT DATA — cite specific values in your response]\n${parts.join('\n')}` : '';
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const userMsg = chatIn.trim();
    const msgs = [...chatMsgs, { role:'user', content: userMsg }];
    setChatMsgs(msgs); setChatIn(''); setChatLoad(true);
    try {
      // Inject patient data context into the first user message so Claude always has it
      const contextNote = buildPatientContext();
      const apiMsgs = msgs.map((m, i) => {
        if (i === msgs.length - 1 && m.role === 'user' && contextNote) {
          return { ...m, content: m.content + contextNote };
        }
        return m;
      });
      const r = await callClaude(apiMsgs, buildMarioSystemPrompt(patient), { max_tokens: 2000 });
      setChatMsgs([...msgs, { role:'assistant', content:r }]);
    } catch { setChatMsgs(m => [...m, { role:'assistant', content:'Connection error. Please try again.' }]); }
    setChatLoad(false);
  };

  const runPlateCheck = async () => {
    if (!plateDesc.trim() && !platePhotoB64) return;
    setPlateLoad(true); setPlateResult(null);
    const severe = (patient.severe||[]).join(', ') || 'none on file';
    const moderate = (patient.moderate||[]).join(', ') || 'none on file';
    const rulesSuffix = `\nPatient severe reactors (AVOID): ${severe}\nPatient moderate reactors (AVOID): ${moderate}\nAlso flag: seed oils, canola, sunflower oil, garlic, onion, tomato, yeast, fermented foods, dairy, sugar, oats, legumes if detox phase.\nOutput format:\nCOMPLIANCE: PASS / REVIEW / FAIL\nFLAGS: [list reactive ingredients]\nSUBSTITUTIONS: [safer swaps if needed]\nVERDICT: [one sentence clinical note]`;
    try {
      let content;
      if (platePhotoB64) {
        content = [
          { type:'image', source:{ type:'base64', media_type:'image/jpeg', data:platePhotoB64 }},
          { type:'text', text:`Identify all foods visible in this meal photo. Then assess protocol compliance.${rulesSuffix}${plateDesc ? '\nAdditional context: ' + plateDesc : ''}` }
        ];
      } else {
        content = `Analyse this meal: "${plateDesc}".${rulesSuffix}`;
      }
      const res = await fetch('/api/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:600, system:buildMarioSystemPrompt(patient), messages:[{ role:'user', content }] })
      });
      const d = await res.json();
      setPlateResult((d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join(''));
    } catch { setPlateResult('Error. Please try again.'); }
    setPlateLoad(false);
  };

  const scanSuppLabel = async (file) => {
    if (!file) return;
    setSuppScanLoad(true);
    try {
      const base64 = await fileToBase64(file);
      const mtype = file.type.startsWith('image/') ? file.type : 'image/jpeg';
      const d = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 600,
          system: 'Extract supplement information from product label photos. Return a clean plain-text list only.',
          messages: [{ role:'user', content: [
            { type:'image', source:{ type:'base64', media_type: mtype, data: base64 }},
            { type:'text', text: 'Read this supplement label. Extract: product name, active ingredients with doses, and serving instructions. Return as a plain text list — one supplement per line in the format: "Name Dose – Frequency". No markdown, no bullet points, no preamble.' },
          ]}],
        }),
      }).then(r => r.json());
      const extracted = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      if (extracted) setMedSupp(prev => prev ? prev + '\n' + extracted : extracted);
    } catch (e) { console.error('[suppScan]', e); }
    setSuppScanLoad(false);
  };

  const analyzeInteractions = async () => {
    if (!medRx && !medSupp) return; setMedLoad(true); setMedAnalysis('');
    const prompt = `Briefly review the following for clinically relevant interactions with the MediBalans ALCAT elimination protocol, methylation support, and gut healing:\nMedications: ${medRx || 'none listed'}\nSupplements: ${medSupp || 'none listed'}\nFocus on: nutrient depletions, timing considerations, contraindications with specific foods in the rotation protocol. Be concise — 3-5 sentences. Flag anything requiring Dr Mario's direct review.`;
    try { const r = await callClaude([{ role:'user',content:prompt }], buildMarioSystemPrompt(patient)); setMedAnalysis(r); } catch { setMedAnalysis('Error. Please try again.'); }
    setMedLoad(false);
  };

  const logOutcome = () => {
    const entry = { ts:new Date(), symptoms:[...outSymptoms], energy:outEnergy, notes:outNotes, day:patient.dayInProtocol||1 };
    if (!outcomes.baseline) {
      setOutcomes({ baseline:entry, checkins:[] });
    } else {
      setOutcomes(p => ({ ...p, checkins:[...p.checkins, entry] }));
    }
    setOutSymptoms([]); setOutEnergy(5); setOutNotes('');
  };

  const logGut = async () => {
    if (gutType === null && !gutPhotoB64) return;
    setGutAnalysisLoad(true); setGutAnalysis('');
    try {
      let content;
      if (gutPhotoB64) {
        content = [
          { type:'image', source:{ type:'base64', media_type:'image/jpeg', data:gutPhotoB64 }},
          { type:'text', text:`Analyse this stool sample photo using the Bristol Stool Scale (1-7). Identify: (1) Bristol type, (2) colour, (3) consistency, (4) any clinically notable features. The patient is on day ${P?.dayInProtocol||1} of the ALCAT elimination protocol. Provide a brief clinical interpretation relevant to gut healing progress. 3-4 sentences. No emojis.` }
        ];
      } else {
        content = `Patient logged Bristol Type ${gutType}. Day ${P?.dayInProtocol||1} of protocol. Notes: ${gutNotes||'none'}. Severe reactors on file: ${(P?.severe||[]).slice(0,5).join(', ')||'none'}. Give a brief 2-sentence clinical interpretation for gut repair context.`;
      }
      const sys = buildMarioSystemPrompt(P);
      const msgs = [{ role:'user', content }];
      const res = await fetch('/api/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:400, system:sys, messages:msgs })
      });
      const d = await res.json();
      const analysis = (d.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('');
      setGutAnalysis(analysis);
      setGutLogs(prev => [{ id:Date.now(), ts:new Date(), type:gutType, notes:gutNotes, photo:gutPhotoB64?true:false, analysis }, ...prev]);
    } catch { setGutAnalysis('Analysis unavailable. Entry logged.'); }
    setGutAnalysisLoad(false);
    setGutType(null); setGutNotes(''); setGutPhoto(null); setGutPhotoB64(null);
  };

  const allFoods = [
    ...(patient.severe||[]).map(f=>({food:f,level:'severe'})),
    ...(patient.moderate||[]).map(f=>({food:f,level:'moderate'})),
    ...(patient.mild||[]).map(f=>({food:f,level:'mild'})),
    ...(patient.alsoAvoid?.candida||[]).map(f=>({food:f,level:'candida'})),
    ...(patient.alsoAvoid?.whey||[]).map(f=>({food:f,level:'whey'})),
  ];
  const foodResults = foodQ.length > 1 ? allFoods.filter(({food})=>food.toLowerCase().includes(foodQ.toLowerCase())).slice(0,12) : [];

  const getP = (d,k) => proteins[`${d}-${k}`] || (patient.meals?.[d]?.[k]?.defaultP) || '';
  const setP = (d,k,p) => { setProteins(prev=>({...prev,[`${d}-${k}`]:p})); setPicker(null); };

  const BOTTOM_TABS = [
    { id:'today', label:'Today', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
    { id:'mario', label:'Mario', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id:'me',    label:'Me',    icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  const P = patient;
  const ROT = patient.rotation || {};
  const MEALS_DATA = patient.meals || {};
  const stores = STORES[country] || STORES.SE;

  // ── SPIKE POPUP ──────────────────────────────────────────────────────────────
  const SpikePopup = () => {
    if (!popup) return null;
    const lc = popup.level === 'severe' ? T.err : T.warn;
    return (
      <div style={{ position:'fixed',inset:0,background:'rgba(28,20,16,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24,backdropFilter:'blur(8px)' }}>
        <div style={{ background:T.w,border:`1px solid ${lc}40`,borderRadius:16,maxWidth:480,width:'100%',boxShadow:`0 24px 64px rgba(28,20,16,0.22)` }}>
          <div style={{ borderBottom:`1px solid ${T.w3}`,padding:'18px 24px 16px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:lc,boxShadow:`0 0 10px ${lc}` }}/>
              <span style={{ fontFamily:fonts.mono,fontSize:11,letterSpacing:'0.18em',color:lc,textTransform:'uppercase' }}>{popup.level} reaction detected · {popup.min}min post-meal</span>
            </div>
            <div style={{ fontFamily:fonts.serif,fontSize:22,color:T.w7,fontWeight:400 }}>{popup.label} {popup.val}</div>
          </div>
          <div style={{ padding:'20px 24px' }}>
            {popupStep === 0 && <>
              <p style={{ fontSize:13,color:T.w6,lineHeight:1.7,marginBottom:16,fontFamily:fonts.sans,fontWeight:300 }}>
                Your <strong style={{ color:lc,fontWeight:500 }}>{popup.label}</strong> spiked unusually.
                {monFoods.length > 0 && <span style={{ display:'block',marginTop:6,fontSize:11,color:T.w4,fontFamily:fonts.mono }}>Meal logged: {monFoods.join(', ')}</span>}
              </p>
              <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.rg2,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:12 }}>Did you eat anything outside your green list?</div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>{setPopupReactive(true);setPopupStep(1);}} style={{ flex:1,background:T.rgBg,border:`1px solid ${T.rg}`,borderRadius:9,padding:'11px',cursor:'pointer',color:T.rg2,fontSize:12,fontFamily:fonts.sans,fontWeight:500 }}>Yes — possibly</button>
                <button onClick={()=>{setPopupReactive(false);setPopupStep(1);}} style={{ flex:1,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:9,padding:'11px',cursor:'pointer',color:T.w5,fontSize:12,fontFamily:fonts.sans }}>No — on protocol</button>
              </div>
            </>}
            {popupStep === 1 && <>
              <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.rg2,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:14 }}>Symptoms right now</div>
              {Object.values(SYMPTOM_CATS).map(cat=>(
                <div key={cat.label} style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6 }}>{cat.label}</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                    {cat.items.map(s=>{const sel=popupSymptoms.includes(s);return(
                      <button key={s} onClick={()=>setPopupSymptoms(p=>sel?p.filter(x=>x!==s):[...p,s])} style={{ background:sel?T.rgBg:T.w,border:`1px solid ${sel?T.rg:T.w3}`,borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:11,fontFamily:fonts.sans,color:sel?T.rg2:T.w5 }}>{s}</button>
                    );})}
                  </div>
                </div>
              ))}
              <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.rg2,letterSpacing:'0.16em',textTransform:'uppercase',margin:'14px 0 10px' }}>Overall severity</div>
              <div style={{ display:'flex',gap:7,marginBottom:18 }}>
                {['mild','moderate','severe'].map(sev=>{const c=sev==='severe'?T.err:sev==='moderate'?T.warn:T.ok;return(
                  <button key={sev} onClick={()=>setPopupSeverity(sev)} style={{ flex:1,background:popupSeverity===sev?c+'18':T.w1,border:`1px solid ${popupSeverity===sev?c:T.w3}`,borderRadius:8,padding:'9px',cursor:'pointer',color:popupSeverity===sev?c:T.w5,fontSize:12,fontFamily:fonts.sans,fontWeight:500,textTransform:'capitalize' }}>{sev}</button>
                );})}
              </div>
              <BtnPrimary onClick={logAndDismiss} loading={popupLoading}>Log reaction — get Mario's analysis</BtnPrimary>
            </>}
            {popupStep === 3 && <>
              <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.rg2,letterSpacing:'0.20em',textTransform:'uppercase',marginBottom:10 }}>Mario's Analysis</div>
              <div style={{ fontSize:12,color:T.w6,lineHeight:1.8,fontFamily:fonts.sans,fontWeight:300,maxHeight:220,overflowY:'auto',marginBottom:16 }}>
                {popupAnalysis.split('\n').map((l,i)=>l.trim()?<div key={i} style={{ marginBottom:6 }}>{l}</div>:null)}
              </div>
              {diary[0]?.flagClinic && <div style={{ background:`${T.err}10`,border:`1px solid ${T.err}35`,borderRadius:7,padding:'8px 12px',marginBottom:14,fontSize:11,color:T.err,fontFamily:fonts.mono }}>Flagged for clinician review</div>}
              <button onClick={()=>setPopup(null)} style={{ width:'100%',background:T.w1,border:`1px solid ${T.w3}`,borderRadius:9,padding:'11px',cursor:'pointer',color:T.w5,fontSize:12,fontFamily:fonts.sans }}>Close — logged to diary</button>
            </>}
          </div>
        </div>
      </div>
    );
  };

  // ── TAB CONTENT ───────────────────────────────────────────────────────────────
  const tabContent = () => {

    // ── MONITOR ──
    if (tab === 'monitor') return (
      <div>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28 }}>
          <div><Eyebrow>Real-time biometric monitoring</Eyebrow><SectionTitle>Post-Meal Response<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Tracker</em></SectionTitle></div>
          <button onClick={()=>setClinView(v=>!v)} style={{ background:clinView?T.rgBg:T.w1,border:`1px solid ${clinView?T.rg:T.w3}`,borderRadius:9,padding:'8px 16px',cursor:'pointer',fontSize:11,fontFamily:fonts.sans,color:clinView?T.rg2:T.w5 }}>
            {clinView?'Patient view':'Clinician view'}
          </button>
        </div>
        {!monActive && monTimeline.length === 0 ? (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
            <Panel>
              <FieldLabel>Meal type</FieldLabel>
              <div style={{ display:'flex',gap:5,marginBottom:18,flexWrap:'wrap' }}>
                {['Breakfast','Snack','Lunch','Dinner','Post-exercise'].map(m=>(
                  <button key={m} onClick={()=>setMonMealLabel(m)} style={{ background:monMealLabel===m?T.rgBg:T.w,border:`1px solid ${monMealLabel===m?T.rg:T.w3}`,borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:11,fontFamily:fonts.sans,color:monMealLabel===m?T.rg2:T.w5 }}>{m}</button>
                ))}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                <FieldLabel>Foods eaten</FieldLabel>
                <div style={{ display:'flex',gap:4 }}>
                  {[1,2,3,4].map(d=>(
                    <button key={d} onClick={()=>{setRotDay(d);setMonFoods([]);}} style={{ background:rotDay===d?T.rg:T.w,border:`1px solid ${rotDay===d?T.rg:T.w3}`,color:rotDay===d?'#fff':T.w5,borderRadius:4,padding:'2px 9px',cursor:'pointer',fontSize:10,fontFamily:fonts.mono }}>D{d}</button>
                  ))}
                </div>
              </div>
              {monFoods.length > 0 && (
                <div style={{ background:`${T.ok}0F`,border:`1px solid ${T.ok}30`,borderRadius:7,padding:'8px 10px',marginBottom:8 }}>
                  <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.ok,letterSpacing:'0.14em',marginBottom:5 }}>YOUR MEAL ({monFoods.length})</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
                    {monFoods.map((f,i)=>{const fu=f.toUpperCase(),isS=(P.severe||[]).some(s=>fu.includes(s)||s.includes(fu.split(' ')[0])),isM=(P.moderate||[]).some(s=>fu.includes(s)||s.includes(fu.split(' ')[0])),col=isS?T.err:isM?T.warn:T.ok;return(
                      <span key={i} onClick={()=>setMonFoods(p=>p.filter((_,j)=>j!==i))} style={{ background:col+'18',border:`1px solid ${col}50`,borderRadius:4,padding:'2px 8px',fontSize:11,fontFamily:fonts.sans,color:col,cursor:'pointer' }}>{f} ×</span>
                    );})}
                  </div>
                </div>
              )}
              <RuledInput value={monFoodInput} onChange={e=>setMonFoodInput(e.target.value)} placeholder="Type food + Enter" style={{ marginBottom:10 }}/>
              <div style={{ maxHeight:200,overflowY:'auto',marginTop:8 }}>
                {ROT[rotDay] ? ['protein','veg','grains','fruit','misc'].map(cat=>{
                  const items = (ROT[rotDay][cat]||[]).filter(f=>!monFoodInput||f.toLowerCase().includes(monFoodInput.toLowerCase()));
                  if (!items.length) return null;
                  return <div key={cat} style={{ marginBottom:8 }}>
                    <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:4 }}>{cat}</div>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:3 }}>
                      {items.map(f=>{const fu=f.toUpperCase(),isSev=(P.severe||[]).some(s=>fu===s),isMod=(P.moderate||[]).some(s=>fu===s),added=monFoods.includes(f),col=isSev?T.err:isMod?T.warn:T.ok;return(
                        <button key={f} onClick={()=>setMonFoods(p=>added?p.filter(x=>x!==f):[...p,f])} style={{ background:added?col+'18':T.w,border:`1px solid ${added?col:isSev?T.err+'40':isMod?T.warn+'30':T.w3}`,borderRadius:4,padding:'2px 7px',cursor:'pointer',fontSize:10,fontFamily:fonts.sans,color:added?col:isSev?T.err+'90':isMod?T.warn+'90':T.w5,fontWeight:added?500:400 }}>
                          {added?'+ ':''}{f}
                        </button>
                      );})}
                    </div>
                  </div>;
                }) : <div style={{ fontSize:11,color:T.w4,fontFamily:fonts.sans,paddingTop:8 }}>Upload your ALCAT results to load rotation foods.</div>}
              </div>
              <div style={{ marginTop:16 }}>
                <BtnPrimary onClick={startMonitoring}>Start 2h monitoring</BtnPrimary>
              </div>
            </Panel>
            <div>
              {diary.length > 0 && <Panel>
                <FieldLabel>Recent Reactions</FieldLabel>
                {diary.slice(0,3).map(e=>(
                  <div key={e.id} style={{ borderBottom:`1px solid ${T.w2}`,paddingBottom:8,marginBottom:8 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
                      <span style={{ fontSize:12,color:T.w7,fontFamily:fonts.sans }}>{e.meal}</span>
                      <span style={{ fontSize:10,color:T.w4,fontFamily:fonts.mono }}>{new Date(e.ts).toLocaleDateString('en-SE')}</span>
                    </div>
                    <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                      {e.spike && <span style={{ fontSize:10,background:e.spike.level==='severe'?`${T.err}18`:`${T.warn}18`,color:e.spike.level==='severe'?T.err:T.warn,border:`1px solid ${e.spike.level==='severe'?T.err:T.warn}40`,borderRadius:4,padding:'1px 7px',fontFamily:fonts.mono }}>{e.spike.label}</span>}
                      {e.flagClinic && <span style={{ fontSize:10,color:T.err,fontFamily:fonts.mono }}>Flagged</span>}
                    </div>
                  </div>
                ))}
              </Panel>}
            </div>
          </div>
        ) : (
          <div>
            {monActive && (
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:T.err,animation:'pulse 1.2s infinite' }}/>
                  <span style={{ fontFamily:fonts.mono,fontSize:10,color:T.err,letterSpacing:'0.12em' }}>MONITORING ACTIVE — {Math.floor(monTimer/60)}:{String(monTimer%60).padStart(2,'0')}</span>
                  <span style={{ fontFamily:fonts.sans,fontSize:11,color:T.w4 }}>{monMealLabel} · Day {rotDay}</span>
                </div>
                <button onClick={()=>{setMonActive(false);setMonTimeline([]);setMonFoods([]);}} style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:7,padding:'6px 14px',cursor:'pointer',fontSize:11,fontFamily:fonts.sans,color:T.w5 }}>Stop</button>
              </div>
            )}
            {monTimeline.length > 0 && (
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20 }}>
                {[
                  { key:'hr',label:'Heart Rate',unit:'bpm',color:T.err,range:[50,140] },
                  { key:'hrv',label:'HRV',unit:'ms',color:T.rg,range:[20,100] },
                  { key:'glucose',label:'Glucose',unit:'mg/dL',color:T.warn,range:[60,200] },
                  { key:'temp',label:'Temperature',unit:'°C',color:`#6A9E8E`,range:[36,38] },
                ].map(m=>{
                  const vals = monTimeline.map(p=>p[m.key]);
                  const latest = vals[vals.length-1];
                  const h=60,w=220,lo=m.range[0],hi=m.range[1];
                  const pts = vals.map((v,i)=>`${(i/(vals.length-1))*w},${h-(((v-lo)/(hi-lo))*h*0.8+h*0.1)}`).join(' ');
                  return (
                    <Panel key={m.key} style={{ marginBottom:0 }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                        <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.16em',textTransform:'uppercase' }}>{m.label}</div>
                        <div style={{ fontFamily:fonts.mono,fontSize:16,color:m.color,fontWeight:400 }}>{latest}<span style={{ fontSize:11,color:T.w4,marginLeft:3 }}>{m.unit}</span></div>
                      </div>
                      <svg width={w} height={h} style={{ display:'block' }}>
                        <polyline points={pts} fill="none" stroke={m.color} strokeWidth={1.5} strokeLinejoin="round"/>
                      </svg>
                    </Panel>
                  );
                })}
              </div>
            )}
            {monSpikes.length > 0 && (
              <Panel style={{ border:`1px solid ${T.err}35`,background:`${T.err}06` }}>
                <FieldLabel>Detected spikes</FieldLabel>
                {monSpikes.map((s,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:`1px solid ${T.w2}` }}>
                    <div style={{ width:6,height:6,borderRadius:'50%',background:s.level==='severe'?T.err:T.warn,flexShrink:0 }}/>
                    <div style={{ flex:1,fontSize:12,color:T.w6,fontFamily:fonts.sans }}>{s.label} — {s.val}</div>
                    <span style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4 }}>{s.min}min</span>
                  </div>
                ))}
              </Panel>
            )}
          </div>
        )}
      </div>
    );

    // ── PROTOCOL ──
    if (tab === 'protocol') return (
      <div>
        <Eyebrow>Clinical elimination protocol</Eyebrow>
        <SectionTitle>Your<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Protocol</em></SectionTitle>
        {P.name ? <>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:28 }}>
            {[['Protocol',P.protocol||'Option A — 21-day detox'],['Phase',`Phase ${P.phase||1}`],['Day',`Day ${P.dayInProtocol||1}`]].map(([l,v])=>(
              <Panel key={l} style={{ marginBottom:0,textAlign:'center' }}>
                <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:6 }}>{l}</div>
                <div style={{ fontFamily:fonts.serif,fontSize:15,color:T.w7,fontWeight:400 }}>{v}</div>
              </Panel>
            ))}
          </div>
          {P.severe?.length > 0 && <Panel>
            <FieldLabel>Severe reactors — avoid 9 months</FieldLabel>
            <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
              {P.severe.map(f=><span key={f} style={{ background:`${T.err}12`,border:`1px solid ${T.err}35`,borderRadius:4,padding:'3px 9px',fontSize:11,fontFamily:fonts.sans,color:T.err }}>{f}</span>)}
            </div>
          </Panel>}
          {P.moderate?.length > 0 && <Panel>
            <FieldLabel>Moderate reactors — avoid 6 months</FieldLabel>
            <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
              {P.moderate.map(f=><span key={f} style={{ background:`${T.warn}10`,border:`1px solid ${T.warn}30`,borderRadius:4,padding:'3px 9px',fontSize:11,fontFamily:fonts.sans,color:T.warn }}>{f}</span>)}
            </div>
          </Panel>}
          {P.mild?.length > 0 && <Panel>
            <FieldLabel>Mild reactors — avoid 3 months</FieldLabel>
            <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
              {P.mild.map(f=><span key={f} style={{ background:`${T.w2}`,border:`1px solid ${T.w3}`,borderRadius:4,padding:'3px 9px',fontSize:11,fontFamily:fonts.sans,color:T.w5 }}>{f}</span>)}
            </div>
          </Panel>}
          {(P.alsoAvoid?.candida?.length > 0 || P.alsoAvoid?.whey?.length > 0) && <Panel>
            <FieldLabel>Marker-specific avoidances</FieldLabel>
            {P.alsoAvoid.candida?.length > 0 && <><div style={{ fontFamily:fonts.mono,fontSize:10,color:'#906080',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6 }}>Candida — 90–120 days</div><div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:14 }}>{P.alsoAvoid.candida.map(f=><span key={f} style={{ background:'#90608012',border:'1px solid #90608030',borderRadius:4,padding:'3px 9px',fontSize:11,fontFamily:fonts.sans,color:'#906080' }}>{f}</span>)}</div></>}
            {P.alsoAvoid.whey?.length > 0 && <><div style={{ fontFamily:fonts.mono,fontSize:10,color:'#5080A8',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6 }}>Whey/Dairy — 120–180 days</div><div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>{P.alsoAvoid.whey.map(f=><span key={f} style={{ background:'#5080A812',border:'1px solid #5080A830',borderRadius:4,padding:'3px 9px',fontSize:11,fontFamily:fonts.sans,color:'#5080A8' }}>{f}</span>)}</div></>}
          </Panel>}
          <Panel>
            <FieldLabel>Reintroduction phases</FieldLabel>
            {PHASES.map(ph=>(
              <div key={ph.id} style={{ borderLeft:`2px solid ${ph.color}`,paddingLeft:14,marginBottom:18 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                  <span style={{ fontSize:13,fontFamily:fonts.sans,fontWeight:500,color:T.w7 }}>Phase {ph.id} — {ph.label}</span>
                  <span style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4 }}>{ph.range}</span>
                </div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:6 }}>
                  {ph.rules.map(r=><span key={r} style={{ fontSize:11,fontFamily:fonts.sans,color:T.w5,background:T.w2,borderRadius:4,padding:'2px 8px' }}>{r}</span>)}
                </div>
                <div style={{ fontSize:11,color:T.w4,fontFamily:fonts.sans,fontStyle:'italic' }}>{ph.note}</div>
              </div>
            ))}
          </Panel>
        </> : <EmptyState title="No protocol loaded" sub="Complete onboarding and upload your ALCAT results to see your personalised protocol."/>}
      </div>
    );

    // ── ROTATION ──
    if (tab === 'rotation') return (
      <div>
        <Eyebrow>4-day food rotation</Eyebrow>
        <SectionTitle>Rotation<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Calendar</em></SectionTitle>
        <div style={{ display:'flex',gap:8,marginBottom:28 }}>
          {[1,2,3,4].map(d=>(
            <button key={d} onClick={()=>setRotDay(d)} style={{ flex:1,background:rotDay===d?T.rg:T.w1,border:`1px solid ${rotDay===d?T.rg:T.w3}`,borderRadius:9,padding:'12px 8px',cursor:'pointer',color:rotDay===d?'#fff':T.w5,fontFamily:fonts.mono,fontSize:11,fontWeight:rotDay===d?500:400,transition:'all .18s' }}>Day {d}</button>
          ))}
        </div>
        {ROT[rotDay] && Object.keys(ROT[rotDay]).length > 0 ? (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            {Object.entries(ROT[rotDay]).map(([cat,items])=>(
              <Panel key={cat} style={{ marginBottom:0 }}>
                <FieldLabel>{cat}</FieldLabel>
                <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                  {items.map(f=><span key={f} style={{ fontSize:12,color:T.w6,fontFamily:fonts.sans,background:T.w,border:`1px solid ${T.w3}`,borderRadius:4,padding:'3px 8px' }}>{f}</span>)}
                </div>
              </Panel>
            ))}
          </div>
        ) : <EmptyState title="Rotation not yet loaded" sub="Your 4-day rotation is generated from your ALCAT results. Upload your results to unlock this view."/>}
      </div>
    );

    // ── MEALS ──
    if (tab === 'meals') return (
      <div>
        <Eyebrow>Daily meal planner</Eyebrow>
        <SectionTitle>Meal<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Plans</em></SectionTitle>
        <div style={{ display:'flex',gap:8,marginBottom:28 }}>
          {[1,2,3,4].map(d=>(
            <button key={d} onClick={()=>{setRotDay(d);setRecipeSteps(null);setActiveRecipe(null);}} style={{ flex:1,background:rotDay===d?T.rg:T.w1,border:`1px solid ${rotDay===d?T.rg:T.w3}`,borderRadius:9,padding:'12px 8px',cursor:'pointer',color:rotDay===d?'#fff':T.w5,fontFamily:fonts.mono,fontSize:11,fontWeight:rotDay===d?500:400,transition:'all .18s' }}>Day {d}</button>
          ))}
        </div>
        {MEALS_DATA[rotDay] ? (
          Object.entries(MEALS_DATA[rotDay]).map(([mealKey, meal])=>{
            const prot = getP(rotDay, mealKey);
            const active = activeRecipe === `${rotDay}-${mealKey}`;
            return (
              <Panel key={mealKey}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:meal.isProtein?12:0 }}>
                  <div>
                    <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:4 }}>{mealKey.replace(/(\d)/,' $1').replace('snack','Snack ')}</div>
                    <div style={{ fontSize:14,color:T.w6,fontFamily:fonts.sans }}>{meal.base}</div>
                  </div>
                  {meal.isProtein && (
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <button onClick={()=>setPicker(picker===`${rotDay}-${mealKey}`?null:`${rotDay}-${mealKey}`)} style={{ background:T.rgBg,border:`1px solid ${T.rg}`,borderRadius:7,padding:'6px 12px',cursor:'pointer',fontSize:11,fontFamily:fonts.sans,color:T.rg2 }}>{prot||'Choose protein'}</button>
                    </div>
                  )}
                </div>
                {picker === `${rotDay}-${mealKey}` && (
                  <div style={{ background:T.w,border:`1px solid ${T.w3}`,borderRadius:8,padding:'10px',marginTop:8 }}>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                      {Object.keys(meal.methods||{}).map(p=>(
                        <button key={p} onClick={()=>setP(rotDay,mealKey,p)} style={{ background:prot===p?T.rgBg:T.w,border:`1px solid ${prot===p?T.rg:T.w3}`,borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontFamily:fonts.sans,color:prot===p?T.rg2:T.w5 }}>{p}</button>
                      ))}
                    </div>
                  </div>
                )}
                {meal.isProtein && prot && (
                  <div style={{ marginTop:10 }}>
                    <button onClick={()=>{setActiveRecipe(active?null:`${rotDay}-${mealKey}`);if(!active)fetchRecipeSteps(rotDay,mealKey,prot,meal.base,meal.sides);}} style={{ background:'none',border:`1px solid ${T.w3}`,borderRadius:7,padding:'6px 14px',cursor:'pointer',fontSize:11,fontFamily:fonts.sans,color:T.w5 }}>
                      {active ? 'Hide recipe' : 'Get recipe steps'}
                    </button>
                    {active && (
                      <div style={{ marginTop:12,fontSize:11.5,color:T.w6,lineHeight:1.8,fontFamily:fonts.sans,fontWeight:300 }}>
                        {recipeLoading ? <span style={{ color:T.w4,fontFamily:fonts.mono,fontSize:10 }}>Loading recipe…</span>
                          : recipeSteps?.split('\n').map((l,i)=>l.trim()?<div key={i} style={{ marginBottom:4 }}>{l}</div>:null)}
                      </div>
                    )}
                  </div>
                )}
              </Panel>
            );
          })
        ) : <EmptyState title="Meal plans not loaded" sub="Meal plans are generated from your ALCAT rotation data. Upload your results to unlock this tab."/>}
      </div>
    );

    // ── GENERATE ──
    if (tab === 'generate') return (
      <div>
        <Eyebrow>AI menu generation</Eyebrow>
        <SectionTitle>Generate<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Menu</em></SectionTitle>
        <Panel>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:20 }}>
            <div>
              <FieldLabel>Rotation day</FieldLabel>
              <div style={{ display:'flex',gap:6 }}>
                {[1,2,3,4].map(d=>(
                  <button key={d} onClick={()=>setRotDay(d)} style={{ flex:1,background:rotDay===d?T.rg:T.w,border:`1px solid ${rotDay===d?T.rg:T.w3}`,borderRadius:7,padding:'9px 6px',cursor:'pointer',color:rotDay===d?'#fff':T.w5,fontFamily:fonts.mono,fontSize:11 }}>D{d}</button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Phase</FieldLabel>
              <div style={{ display:'flex',gap:6 }}>
                {[{id:'detox',label:'Detox'},{id:'post3months',label:'Post Month 3'}].map(p=>(
                  <button key={p.id} onClick={()=>setGenPhase(p.id)} style={{ flex:1,background:genPhase===p.id?T.rgBg:T.w,border:`1px solid ${genPhase===p.id?T.rg:T.w3}`,borderRadius:7,padding:'9px 6px',cursor:'pointer',color:genPhase===p.id?T.rg2:T.w5,fontFamily:fonts.sans,fontSize:11,fontWeight:genPhase===p.id?500:400 }}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <FieldLabel>Scope</FieldLabel>
            <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
              {[['full_day','Full Day'],['breakfast','Breakfast'],['lunch','Lunch'],['dinner','Dinner']].map(([id,label])=>(
                <button key={id} onClick={()=>setMealScope(id)} style={{ background:mealScope===id?T.rgBg:T.w,border:`1px solid ${mealScope===id?T.rg:T.w3}`,borderRadius:7,padding:'8px 16px',cursor:'pointer',color:mealScope===id?T.rg2:T.w5,fontFamily:fonts.sans,fontSize:11,fontWeight:mealScope===id?500:400 }}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <FieldLabel>Eating pattern</FieldLabel>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {EAT_PATS.map(ep=>(
                <button key={ep.id} onClick={async()=>{setEatPat(ep.id);if(ep.fasting&&!ifResearch){setIfLoad(true);try{const r=await callClaude([{role:'user',content:'Summarise the latest clinical evidence on intermittent fasting for metabolic inflammation and gut healing. 3 sentences max.'}],buildMarioSystemPrompt(P));setIfResearch(r);}catch{}setIfLoad(false);}}} style={{ background:eatPat===ep.id?T.rgBg:T.w,border:`1px solid ${eatPat===ep.id?T.rg:T.w3}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',textAlign:'left',minWidth:120 }}>
                  <div style={{ fontSize:12,color:eatPat===ep.id?T.rg2:T.w6,fontFamily:fonts.sans,fontWeight:500,marginBottom:2 }}>{ep.label}</div>
                  <div style={{ fontSize:10,color:T.w4,fontFamily:fonts.mono }}>{ep.desc}</div>
                  {ep.detail && eatPat===ep.id && <div style={{ fontSize:10,color:T.rg2,fontFamily:fonts.mono,marginTop:2 }}>{ep.detail}</div>}
                </button>
              ))}
            </div>
            {ifResearch && <div style={{ marginTop:12,background:T.rgBg,border:`1px solid ${T.rg}25`,borderRadius:8,padding:'10px 14px',fontSize:11,color:T.w5,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.7 }}>{ifLoad?'Loading research…':ifResearch}</div>}
          </div>
          <div style={{ marginBottom:24 }}>
            <FieldLabel>Cuisine</FieldLabel>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
              {CUISINES.map(c=>(
                <button key={c.id} onClick={()=>setCuisine(c.id)} style={{ background:cuisine===c.id?T.rgBg:T.w,border:`1px solid ${cuisine===c.id?T.rg:T.w3}`,borderRadius:8,padding:'10px 12px',cursor:'pointer',textAlign:'left',transition:'all .15s' }}>
                  <div style={{ fontSize:12,color:cuisine===c.id?T.rg2:T.w6,fontFamily:fonts.sans,fontWeight:500,marginBottom:2 }}>{c.label}</div>
                  <div style={{ fontSize:10,color:T.w4,fontFamily:fonts.mono }}>{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <BtnPrimary onClick={genMenu} loading={genLoad} disabled={!cuisine}>Generate menu</BtnPrimary>
        </Panel>
        {genResult && <Panel>
          <FieldLabel>Generated menu</FieldLabel>
          <div style={{ fontSize:13,color:T.w6,lineHeight:1.9,fontFamily:fonts.sans,fontWeight:300 }}>
            {genResult.split('\n').map((l,i)=>{
              if(l.startsWith('**')&&l.endsWith('**'))return<div key={i} style={{ fontFamily:fonts.serif,fontSize:15,fontWeight:600,color:T.w7,marginTop:14,marginBottom:3 }}>{l.replace(/\*\*/g,'')}</div>;
              return l.trim()?<div key={i} style={{ marginBottom:4 }}>{l}</div>:null;
            })}
          </div>
        </Panel>}
      </div>
    );

    // ── GROCERY ──
    if (tab === 'grocery') return (
      <div>
        <Eyebrow>Smart grocery — geo-adaptive</Eyebrow>
        <SectionTitle>Grocery<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>List</em></SectionTitle>
        <Panel>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:20 }}>
            <div>
              <FieldLabel>Country</FieldLabel>
              <div style={{ display:'flex',gap:6 }}>
                {['SE','US','GB','DE'].map(cc=>(
                  <button key={cc} onClick={()=>setCountry(cc)} style={{ background:country===cc?T.rg:T.w,border:`1px solid ${country===cc?T.rg:T.w3}`,borderRadius:6,padding:'5px 12px',cursor:'pointer',color:country===cc?'#fff':T.w5,fontFamily:fonts.mono,fontSize:10 }}>{cc}</button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Rotation days</FieldLabel>
              <div style={{ display:'flex',gap:6 }}>
                {[1,2,3,4].map(d=>{const sel=groceryWeek.includes(d);return(
                  <button key={d} onClick={()=>setGroceryWeek(p=>sel?p.filter(x=>x!==d):[...p,d].sort())} style={{ background:sel?T.rg:T.w,border:`1px solid ${sel?T.rg:T.w3}`,borderRadius:6,padding:'5px 12px',cursor:'pointer',color:sel?'#fff':T.w5,fontFamily:fonts.mono,fontSize:10 }}>D{d}</button>
                );})}
              </div>
            </div>
          </div>
          <BtnPrimary onClick={buildGroceryList} loading={groceryLoad} disabled={groceryWeek.length===0}>Build grocery list</BtnPrimary>
        </Panel>
        {groceryList && <>
          <Panel>
            <FieldLabel>Your list</FieldLabel>
            <div style={{ fontSize:12.5,color:T.w6,lineHeight:1.9,fontFamily:fonts.sans,fontWeight:300 }}>
              {groceryList.split('\n').map((l,i)=>{
                if(l.startsWith('**')&&l.endsWith('**'))return<div key={i} style={{ fontFamily:fonts.mono,fontSize:11,color:T.rg2,letterSpacing:'0.18em',textTransform:'uppercase',marginTop:16,marginBottom:6 }}>{l.replace(/\*\*/g,'')}</div>;
                if(l.startsWith('- '))return<div key={i} style={{ display:'flex',gap:8,alignItems:'flex-start',marginBottom:2 }}><span style={{ color:T.rg,flexShrink:0 }}>·</span><span>{l.slice(2)}</span></div>;
                return l.trim()?<div key={i} style={{ fontSize:11,color:T.w4 }}>{l}</div>:null;
              })}
            </div>
          </Panel>
          <Panel>
            <FieldLabel>Order online — {country} stores</FieldLabel>
            <div style={{ marginBottom:12 }}>
              {stores.map((s,i)=>(
                <button key={s.name} onClick={()=>setGroceryStore(i)} style={{ background:groceryStore===i?T.rgBg:T.w1,border:`1px solid ${groceryStore===i?T.rg:T.w3}`,borderRadius:8,padding:'8px 14px',cursor:'pointer',marginRight:8,marginBottom:8,fontSize:11.5,fontFamily:fonts.sans,color:groceryStore===i?T.rg2:T.w5,fontWeight:groceryStore===i?500:400 }}>{s.name}</button>
              ))}
            </div>
            {groceryList.split('\n').filter(l=>l.startsWith('- ')).map(l=>l.slice(2).trim().split('(')[0].trim()).filter(Boolean).slice(0,16).map((item,i)=>(
              <a key={i} href={stores[groceryStore].search + encodeURIComponent(item)} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex',alignItems:'center',gap:6,background:T.w,border:`1px solid ${T.w3}`,borderRadius:6,padding:'5px 12px',margin:'0 6px 6px 0',textDecoration:'none',fontSize:11.5,color:T.w6,fontFamily:fonts.sans,transition:'all .15s' }}>
                {item}
                <span style={{ fontSize:11,color:T.rg,fontFamily:fonts.mono }}>search</span>
              </a>
            ))}
          </Panel>
        </>}
        <Panel>
          <FieldLabel>Shopping rules — always apply</FieldLabel>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            {[
              { rule:'Wild-caught fish only',          detail:'Farm-raised contains inflammatory omega-6. Look for MSC certified.' },
              { rule:'Oils: tallow, coconut, avocado', detail:'No sunflower, canola, rapeseed, or vegetable oil.' },
              { rule:'Organic for today\'s rotation',  detail:'Buy organic for items on your plate today.' },
              { rule:'No hidden yeast or sugars',      detail:'Nutritional yeast, malt extract, dextrose — all Candida triggers.' },
            ].map(r=>(
              <div key={r.rule} style={{ background:T.w,border:`1px solid ${T.w3}`,borderRadius:8,padding:'12px' }}>
                <div style={{ fontSize:12,color:T.w7,fontFamily:fonts.sans,fontWeight:500,marginBottom:4 }}>{r.rule}</div>
                <div style={{ fontSize:10.5,color:T.w4,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.5 }}>{r.detail}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );

    // ── FOOD CHECK ──
    if (tab === 'lookup') return (
      <div>
        <Eyebrow>ALCAT reactive food search</Eyebrow>
        <SectionTitle>Food<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Check</em></SectionTitle>
        <Panel>
          <FieldLabel>Search any food</FieldLabel>
          <RuledInput value={foodQ} onChange={e=>setFoodQ(e.target.value)} placeholder="e.g. salmon, oat, tomato…"/>
          {foodQ.length > 1 && (
            <div style={{ marginTop:16 }}>
              {foodResults.length === 0
                ? <div style={{ fontSize:13,color:T.ok,fontFamily:fonts.sans,padding:'10px 0' }}>Not found in reactive list — cleared for your protocol.</div>
                : foodResults.map(({food,level},i)=>{
                    const col = level==='severe'?T.err:level==='moderate'?T.warn:level==='mild'?T.w5:level==='candida'?'#906080':'#5080A8';
                    const bg = level==='severe'?`${T.err}12`:level==='moderate'?`${T.warn}10`:T.w2;
                    const avoidText = level==='severe'?'Avoid 9 months':level==='moderate'?'Avoid 6 months':level==='mild'?'Avoid 3 months':level==='candida'?'Candida trigger — 90 days':'Whey/Dairy — 120 days';
                    return (
                      <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',background:bg,border:`1px solid ${col}30`,borderRadius:8,padding:'12px 14px',marginBottom:8 }}>
                        <div>
                          <div style={{ fontSize:14,color:T.w7,fontFamily:fonts.sans,fontWeight:500,marginBottom:2 }}>{food}</div>
                          <div style={{ fontSize:11,color:col,fontFamily:fonts.mono,letterSpacing:'0.1em',textTransform:'uppercase' }}>{level}</div>
                        </div>
                        <div style={{ fontSize:11,color:T.w4,fontFamily:fonts.sans,textAlign:'right' }}>{avoidText}</div>
                      </div>
                    );
                  })
              }
            </div>
          )}
          {foodQ.length <= 1 && allFoods.length > 0 && (
            <div style={{ marginTop:14 }}>
              <div style={{ display:'flex',gap:12,fontFamily:fonts.mono,fontSize:11,color:T.w4,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:10 }}>
                <span style={{ color:T.err }}>{P.severe?.length||0} severe</span>
                <span style={{ color:T.warn }}>{P.moderate?.length||0} moderate</span>
                <span style={{ color:T.w5 }}>{P.mild?.length||0} mild</span>
              </div>
            </div>
          )}
          {allFoods.length === 0 && <EmptyState title="No ALCAT data loaded" sub="Upload your ALCAT results to enable food lookup."/>}
        </Panel>
      </div>
    );

    // ── MARIO (full-screen AI companion) ──
    if (tab === 'mario') return (
      <div style={{ display:'flex',flexDirection:'column',height:'100%',minHeight:'calc(100dvh - 164px)' }}>
        <div style={{ flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'20px 20px 16px' }}>
        {chatMsgs.length === 0 && (
          <div style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:14,padding:'20px 18px',marginBottom:16 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
              <div style={{ width:34,height:34,borderRadius:'50%',background:`linear-gradient(140deg,${T.rg3},${T.rg})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <div style={{ fontFamily:fonts.sans,fontSize:13,color:T.w7,fontWeight:500 }}>Mario</div>
                <div style={{ fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:'0.12em' }}>BIOLOGICAL AI COMPANION</div>
              </div>
            </div>
            <div style={{ fontSize:13,color:T.w5,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.8,marginBottom:16 }}>
              {P.name ? `Hello ${P.name.split(' ')[0]} — I'm your personalised clinical AI, built on your lab data and the full MediBalans protocol.` : "Hello — I'm Mario, your clinical AI. Introduce yourself and I'll personalise my responses to your biology."}
            </div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>
              {(() => {
                const day = P.dayInProtocol || 1;
                const hasAlcat = (P.severe?.length||0)+(P.moderate?.length||0)+(P.mild?.length||0) > 0;
                const hasCma = (P.cmaDeficiencies?.length||0) > 0;
                const hasSnps = (P.genomicSnps?.length||0) > 0;
                const hasRedox = P.redoxScore != null;
                // Day 1-3: Getting started
                if (day <= 3) return [
                  'What should I eat today?',
                  'Why do we remove these specific foods?',
                  hasAlcat ? 'Walk me through my ALCAT results' : 'What tests should I start with?',
                  'What is the 3-hour meal rhythm?',
                  hasCma ? 'What do my CMA results mean?' : 'How does this protocol work?',
                ];
                // Day 4-7: Detox reactions likely
                if (day <= 7) return [
                  'I feel different — is this the detox reaction?',
                  `What should I eat on Day ${day}?`,
                  'Why am I so tired?',
                  hasSnps ? 'How do my genetics affect the detox?' : 'Can I exercise during detox?',
                  'What can I eat at a restaurant?',
                ];
                // Day 8-14: Settling in
                if (day <= 14) return [
                  `Day ${day} — am I on track?`,
                  'When should I start intermittent fasting?',
                  hasCma ? 'Which foods correct my deficiencies?' : 'What supplements should I consider?',
                  hasSnps ? 'How should I train based on my genetics?' : 'What exercise is best right now?',
                  'Explain the gut healing timeline',
                ];
                // Day 15-21: Final detox push
                if (day <= 21) return [
                  `Day ${day} — what changes should I notice?`,
                  'What happens after the 21-day detox?',
                  hasRedox ? `My REDOX is ${P.redoxScore} — what does that mean for my diet?` : 'How do I maintain these results?',
                  hasSnps ? 'Explain my methylation pathway' : 'What is methylation and why does it matter?',
                  'Design my post-detox longevity diet',
                ];
                // Day 22-60: Post-detox rebuild
                if (day <= 60) return [
                  'Which foods can I reintroduce now?',
                  hasCma ? 'Are my nutrient deficiencies improving?' : 'What should I track at this stage?',
                  hasSnps ? 'How do my genes affect my recovery timeline?' : 'When will I feel fully better?',
                  'Optimise my circadian rhythm for recovery',
                  hasRedox ? 'What should my REDOX target be?' : 'Explain the 90-day biological arc',
                ];
                // Day 61+: Longevity phase
                return [
                  'Design my long-term longevity diet',
                  hasSnps ? 'What hormetic practices suit my genetics?' : 'What is hormesis and how do I use it?',
                  'How do I maintain immune silence long-term?',
                  hasCma ? 'Review my current nutrient status' : 'What should I test next?',
                  'Explain my biological age trajectory',
                ];
              })().map(q=>(
                <button key={q} onClick={()=>setChatIn(q)} style={{ background:T.rgBg,border:`1px solid ${T.rg}25`,borderRadius:6,padding:'7px 14px',cursor:'pointer',fontSize:11.5,fontFamily:fonts.sans,color:T.rg2 }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {chatMsgs.map((m,i)=>(
          <div key={i} style={{ display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',marginBottom:10 }}>
            <div style={{ maxWidth:'82%',background:m.role==='user'?T.rg:T.w1,border:`1px solid ${m.role==='user'?T.rg:T.w3}`,borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',padding:'12px 16px',fontSize:13,color:m.role==='user'?'#fff':T.w6,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.7 }}>
              {m.content.split('\n').map((l,j)=>l.trim()?<div key={j} style={{ marginBottom:4 }}>{l}</div>:null)}
            </div>
          </div>
        ))}
        {chatLoad && <div style={{ display:'flex',justifyContent:'flex-start',marginBottom:10 }}><div style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:'16px 16px 16px 4px',padding:'12px 16px',fontSize:13,color:T.w4,fontFamily:fonts.mono }}>…</div></div>}
        <div ref={chatEndRef}/>
        </div>
        <div style={{ padding:'12px 20px 20px',background:T.w,borderTop:`1px solid ${T.w2}`,flexShrink:0 }}>
          <div style={{ display:'flex',gap:8,alignItems:'center' }}>
            <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}} placeholder="Ask Mario anything…" style={{ flex:1,background:T.w1,border:`1px solid ${T.w3}`,borderRadius:22,padding:'11px 18px',fontSize:13,fontFamily:fonts.sans,color:T.w7,outline:'none' }}/>
            <button onClick={sendChat} disabled={!chatIn.trim()||chatLoad} style={{ width:42,height:42,borderRadius:'50%',border:'none',background:chatIn.trim()?T.rg:T.w3,cursor:chatIn.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background .15s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    );

    // ── OUTCOMES ──
    if (tab === 'outcomes') return (
      <div>
        <Eyebrow>Progress tracking</Eyebrow>
        <SectionTitle>Outcomes<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Engine</em></SectionTitle>
        <Panel>
          <FieldLabel>{outcomes.baseline ? 'Log check-in' : 'Set baseline'}</FieldLabel>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:8 }}>Energy level (1–10)</div>
            <div style={{ display:'flex',gap:6 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                <button key={n} onClick={()=>setOutEnergy(n)} style={{ width:32,height:32,borderRadius:6,border:`1px solid ${outEnergy===n?T.rg:T.w3}`,background:outEnergy===n?T.rg:T.w,cursor:'pointer',fontFamily:fonts.mono,fontSize:11,color:outEnergy===n?'#fff':T.w5 }}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:8 }}>Active symptoms</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>
              {Object.values(SYMPTOM_CATS).flatMap(c=>c.items).map(s=>(
                <Chip key={s} label={s} on={outSymptoms.includes(s)} onClick={()=>setOutSymptoms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}/>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <FieldLabel>Notes</FieldLabel>
            <RuledInput multiline rows={2} value={outNotes} onChange={e=>setOutNotes(e.target.value)} placeholder="How do you feel today? Any observations…"/>
          </div>
          <BtnPrimary onClick={logOutcome}>{outcomes.baseline ? 'Log check-in' : 'Set baseline'}</BtnPrimary>
        </Panel>
        {outcomes.baseline && <>
          <Panel>
            <FieldLabel>Baseline — Day {outcomes.baseline.day}</FieldLabel>
            <div style={{ display:'flex',gap:24 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:fonts.serif,fontSize:32,color:T.rg,fontWeight:400 }}>{outcomes.baseline.energy}</div>
                <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.14em',textTransform:'uppercase' }}>Energy</div>
              </div>
              <div>
                <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:6 }}>Baseline symptoms</div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                  {outcomes.baseline.symptoms.length > 0 ? outcomes.baseline.symptoms.map(s=><span key={s} style={{ background:`${T.err}10`,border:`1px solid ${T.err}25`,borderRadius:4,padding:'2px 8px',fontSize:11,fontFamily:fonts.sans,color:T.err }}>{s}</span>) : <span style={{ fontSize:12,color:T.w4,fontFamily:fonts.sans }}>No symptoms logged</span>}
                </div>
              </div>
            </div>
          </Panel>
          {outcomes.checkins.length > 0 && <Panel>
            <FieldLabel>Progress trajectory</FieldLabel>
            <div style={{ position:'relative',height:80,marginBottom:12 }}>
              <svg width="100%" height={80} style={{ display:'block' }}>
                {(() => {
                  const all = [outcomes.baseline, ...outcomes.checkins];
                  const max = 10, w = 600;
                  const pts = all.map((e,i)=>`${(i/(all.length-1||1))*w},${80-(e.energy/max)*70}`).join(' ');
                  return <>
                    <polyline points={pts} fill="none" stroke={T.rg} strokeWidth={2} strokeLinejoin="round"/>
                    {all.map((e,i)=><circle key={i} cx={(i/(all.length-1||1))*w} cy={80-(e.energy/max)*70} r={3} fill={T.rg}/>)}
                  </>;
                })()}
              </svg>
            </div>
            {outcomes.checkins.slice(-3).reverse().map((c,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',gap:16,padding:'8px 0',borderBottom:`1px solid ${T.w2}` }}>
                <div style={{ fontFamily:fonts.serif,fontSize:22,color:c.energy>=7?T.ok:c.energy>=4?T.warn:T.err,fontWeight:400,minWidth:28 }}>{c.energy}</div>
                <div>
                  <div style={{ fontSize:11,color:T.w4,fontFamily:fonts.mono }}>{new Date(c.ts).toLocaleDateString('en-SE')} · Day {c.day}</div>
                  {c.notes && <div style={{ fontSize:12,color:T.w5,fontFamily:fonts.sans,fontWeight:300,marginTop:2 }}>{c.notes}</div>}
                </div>
              </div>
            ))}
          </Panel>}
        </>}
      </div>
    );

    // ── GUTCHECK ──
    if (tab === 'gut') return (
      <div>
        <Eyebrow>Stool journal · Bristol Stool Scale</Eyebrow>
        <SectionTitle>GutCheck<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Journal</em></SectionTitle>
        <Panel>
          <FieldLabel>Select Bristol type</FieldLabel>
          <div style={{ display:'flex',flexDirection:'column',gap:7,marginBottom:20 }}>
            {[
              { type:1, label:'Type 1 — Separate hard lumps, like nuts', clinical:'Severe constipation', color:T.err },
              { type:2, label:'Type 2 — Sausage-shaped, lumpy',          clinical:'Mild constipation',  color:T.warn },
              { type:3, label:'Type 3 — Like a sausage, cracks on surface', clinical:'Normal, slight dehydration', color:T.ok },
              { type:4, label:'Type 4 — Like a sausage, smooth and soft',  clinical:'Optimal transit',  color:T.ok },
              { type:5, label:'Type 5 — Soft blobs, clear-cut edges',     clinical:'Lacking fibre',     color:T.warn },
              { type:6, label:'Type 6 — Fluffy, mushy, ragged edges',     clinical:'Mild diarrhoea',    color:T.warn },
              { type:7, label:'Type 7 — Entirely liquid, no solid pieces', clinical:'Severe diarrhoea or reaction', color:T.err },
            ].map(t=>(
              <button key={t.type} onClick={()=>setGutType(t.type)} style={{ display:'flex',alignItems:'center',gap:12,background:gutType===t.type?T.rgBg:T.w,border:`1px solid ${gutType===t.type?T.rg:T.w3}`,borderRadius:8,padding:'10px 14px',cursor:'pointer',textAlign:'left',transition:'all .15s' }}>
                <div style={{ width:28,height:28,borderRadius:'50%',background:gutType===t.type?T.rg:T.w2,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <span style={{ fontFamily:fonts.mono,fontSize:11,fontWeight:500,color:gutType===t.type?'#fff':T.w5 }}>{t.type}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,color:T.w7,fontFamily:fonts.sans,marginBottom:2 }}>{t.label}</div>
                  <div style={{ fontSize:10,color:t.color,fontFamily:fonts.mono,letterSpacing:'0.1em' }}>{t.clinical}</div>
                </div>
              </button>
            ))}
          </div>
          {/* Photo upload */}
          <div style={{ marginBottom:16 }}>
            <FieldLabel>Photo (optional — Mario reads it automatically)</FieldLabel>
            <input ref={gutFileRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={e=>{ const f=e.target.files[0]; if(f){ setGutPhoto(URL.createObjectURL(f)); fileToBase64(f).then(b64=>setGutPhotoB64(b64)); } e.target.value=''; }}/>
            <div onClick={() => gutFileRef.current?.click()} style={{ border:`2px dashed ${gutPhoto?T.rg:T.w3}`, borderRadius:10, padding:'16px', textAlign:'center', cursor:'pointer', background:gutPhoto?T.rgBg:T.w1, transition:'all 0.2s' }}>
              {gutPhoto
                ? <img src={gutPhoto} alt="stool sample" style={{ maxHeight:120, borderRadius:8, display:'block', margin:'0 auto' }}/>
                : <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w4 }}>Tap to take photo or upload · Mario analyses Bristol type automatically</div>
              }
            </div>
          </div>
          <FieldLabel>Notes</FieldLabel>
          <RuledInput value={gutNotes} onChange={e=>setGutNotes(e.target.value)} placeholder="Any relevant notes — pain, urgency, colour, timing…" style={{ marginBottom:16 }}/>
          <BtnPrimary onClick={logGut} disabled={gutType===null && !gutPhotoB64}>{gutAnalysisLoad?'Analysing…':'Log & Analyse'}</BtnPrimary>
          {gutAnalysis && <div style={{ marginTop:16, padding:'14px 16px', background:T.rgBg, borderRadius:8, borderLeft:`3px solid ${T.rg}` }}>
            <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.rg, letterSpacing:'0.14em', marginBottom:8 }}>MARIO ANALYSIS</div>
            <div style={{ fontFamily:fonts.sans, fontSize:13, color:T.w6, lineHeight:1.7 }}>{gutAnalysis}</div>
          </div>}
        </Panel>
        {gutLogs.length > 0 && <Panel>
          <FieldLabel>Journal ({gutLogs.length} entries)</FieldLabel>
          {gutLogs.slice(0,10).map(e=>(
            <div key={e.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:`1px solid ${T.w2}` }}>
              <div style={{ width:32,height:32,borderRadius:'50%',background:e.type&&e.type<=2||e.type>=6?`${T.err}18`:e.type===4?`${T.ok}18`:`${T.warn}18`,border:`1px solid ${e.type&&e.type<=2||e.type>=6?T.err:e.type===4?T.ok:T.warn}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <span style={{ fontFamily:fonts.mono,fontSize:12,fontWeight:500,color:e.type&&e.type<=2||e.type>=6?T.err:e.type===4?T.ok:T.warn }}>{e.type||'P'}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11,color:T.w4,fontFamily:fonts.mono }}>{new Date(e.ts).toLocaleDateString('en-SE')} {new Date(e.ts).toLocaleTimeString('en-SE',{hour:'2-digit',minute:'2-digit'})}{e.photo?' · photo':''}</div>
                {e.notes && <div style={{ fontSize:12,color:T.w5,fontFamily:fonts.sans,fontWeight:300,marginTop:2 }}>{e.notes}</div>}
                {e.analysis && <div style={{ fontSize:11,color:T.w5,fontFamily:fonts.sans,marginTop:4,fontStyle:'italic' }}>{e.analysis.slice(0,120)}…</div>}
              </div>
            </div>
          ))}
        </Panel>}
      </div>
    );

    // ── PLATECHECK ──
    if (tab === 'plate') return (
      <div>
        <Eyebrow>AI meal compliance scanner</Eyebrow>
        <SectionTitle>Plate<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Check</em></SectionTitle>
        <Panel>
          {/* Photo */}
          <div style={{ marginBottom:20 }}>
            <FieldLabel>Photo your plate</FieldLabel>
            <input ref={plateFileRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={e=>{ const f=e.target.files[0]; if(f){ setPlatePhoto(URL.createObjectURL(f)); fileToBase64(f).then(b64=>setPlatePhotoB64(b64)); } e.target.value=''; }}/>
            <div onClick={() => plateFileRef.current?.click()} style={{ border:`2px dashed ${platePhoto?T.rg:T.w3}`, borderRadius:10, padding:'20px', textAlign:'center', cursor:'pointer', background:platePhoto?T.rgBg:T.w1, transition:'all 0.2s' }}>
              {platePhoto
                ? <img src={platePhoto} alt="meal" style={{ maxHeight:180, borderRadius:8, display:'block', margin:'0 auto' }}/>
                : <div style={{ fontFamily:fonts.sans, fontSize:13, color:T.w4 }}>Tap to take a photo of your plate — Mario identifies every ingredient</div>
              }
            </div>
          </div>
          <FieldLabel>Or describe your meal</FieldLabel>
          <RuledInput multiline rows={2} value={plateDesc} onChange={e=>setPlateDesc(e.target.value)} placeholder="e.g. Grilled salmon with roasted broccoli, olive oil, and quinoa. Side salad with lemon dressing." style={{ marginBottom:20 }}/>
          <BtnPrimary onClick={runPlateCheck} disabled={plateLoad||(!plateDesc.trim()&&!platePhotoB64)}>{plateLoad?'Scanning…':'Scan for compliance'}</BtnPrimary>
        </Panel>
        {plateResult && <Panel>
          {(() => {
            const isPass = plateResult.includes('PASS');
            const isReview = plateResult.includes('REVIEW');
            const col = isPass ? T.ok : isReview ? T.warn : T.err;
            return <>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:col }}/>
                <div style={{ fontFamily:fonts.mono,fontSize:11,color:col,letterSpacing:'0.18em',textTransform:'uppercase' }}>
                  {isPass ? 'Meal clears protocol' : isReview ? 'Review required' : 'Protocol conflict detected'}
                </div>
              </div>
              <div style={{ fontSize:12.5,color:T.w6,lineHeight:1.9,fontFamily:fonts.sans,fontWeight:300 }}>
                {plateResult.split('\n').map((l,i)=>{
                  const isHeader = l.startsWith('-') && l.includes(':');
                  return l.trim() ? <div key={i} style={{ marginBottom:5,color:isHeader?T.rg2:T.w6,fontFamily:isHeader?fonts.mono:fonts.sans,fontSize:isHeader?9:12.5,letterSpacing:isHeader?'0.12em':'normal',textTransform:isHeader?'uppercase':'none' }}>{l}</div> : null;
                })}
              </div>
            </>;
          })()}
        </Panel>}
        {!P.severe?.length && <Panel><EmptyState title="No ALCAT data loaded" sub="PlateCheck is most accurate when your reactive food lists are loaded from your ALCAT results."/></Panel>}
      </div>
    );

    // ── MEDICATIONS ──
    if (tab === 'meds') return (
      <div>
        <Eyebrow>Protocol interaction review</Eyebrow>
        <SectionTitle>Medications<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>& Supplements</em></SectionTitle>
        <Panel>
          <div style={{ marginBottom:22 }}>
            <FieldLabel>Current medications (pharmaceutical)</FieldLabel>
            <RuledInput multiline rows={4} value={medRx} onChange={e=>setMedRx(e.target.value)} placeholder="List all pharmaceutical medications — name, dose, frequency&#10;e.g. Levothyroxine 50mcg once daily&#10;     Estradiol transdermal patch 50mcg/24h&#10;     Metformin 500mg twice daily"/>
          </div>
          <div style={{ marginBottom:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <FieldLabel style={{ marginBottom:0 }}>Supplements & nutraceuticals</FieldLabel>
              <input ref={suppLabelRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) scanSuppLabel(f); e.target.value = ''; }}/>
              <button onClick={() => suppLabelRef.current?.click()} disabled={suppScanLoad} style={{ display:'flex', alignItems:'center', gap:6, background: suppScanLoad ? T.w1 : T.rgBg, border:`1px solid ${T.rg}`, borderRadius:7, padding:'5px 12px', fontFamily:fonts.sans, fontSize:11, fontWeight:600, color: suppScanLoad ? T.w4 : T.rg2, cursor: suppScanLoad ? 'default' : 'pointer' }}>
                {suppScanLoad
                  ? <><span style={{ width:8, height:8, borderRadius:'50%', background:T.rg, display:'inline-block', animation:'pulse 1.2s infinite' }}/> Reading label…</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Scan label</>
                }
              </button>
            </div>
            <RuledInput multiline rows={4} value={medSupp} onChange={e=>setMedSupp(e.target.value)} placeholder="List all supplements — name, dose, frequency&#10;e.g. Magnesium glycinate 400mg at bedtime&#10;     Vitamin D3 5000 IU with K2-MK7 200mcg&#10;     Omega-3 EPA/DHA 2g daily"/>
          </div>
          <div style={{ marginBottom:22 }}>
            <FieldLabel>Clinical notes (free text)</FieldLabel>
            <RuledInput multiline rows={3} value={medNotes} onChange={e=>setMedNotes(e.target.value)} placeholder="Any relevant clinical context — diagnoses, intolerances, previous reactions…"/>
          </div>
          <BtnPrimary onClick={analyzeInteractions} loading={medLoad} disabled={!medRx && !medSupp}>Analyse protocol interactions</BtnPrimary>
        </Panel>
        {medAnalysis && <Panel>
          <FieldLabel>Mario's interaction analysis</FieldLabel>
          <div style={{ fontSize:13,color:T.w6,lineHeight:1.85,fontFamily:fonts.sans,fontWeight:300 }}>
            {medAnalysis.split('\n').map((l,i)=>l.trim()?<div key={i} style={{ marginBottom:6 }}>{l}</div>:null)}
          </div>
          <div style={{ marginTop:16,padding:'10px 14px',background:`${T.warn}0C`,border:`1px solid ${T.warn}25`,borderRadius:8 }}>
            <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.warn,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:4 }}>Clinical advisory</div>
            <div style={{ fontSize:11,color:T.w5,fontFamily:fonts.sans,fontWeight:300,lineHeight:1.6 }}>This analysis is informational. Always review medication adjustments with Dr Mario Anthis before making changes.</div>
          </div>
        </Panel>}
        {/* Hormone delivery reference */}
        <Panel>
          <FieldLabel>Hormonal therapy reference</FieldLabel>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            {[
              { hormone:'Oestrogen',  methods:['Transdermal patch','Transdermal gel','Oral tablet','Vaginal cream'] },
              { hormone:'Progesterone', methods:['Oral micronised (Utrogestan)','Intrauterine (Mirena)','Transdermal cream'] },
              { hormone:'Testosterone', methods:['Transdermal gel','Subcutaneous implant','Oral undecanoate','IM injection'] },
              { hormone:'Thyroid',      methods:['Levothyroxine (T4)','Liothyronine (T3)','Desiccated (T4+T3)','Compounded'] },
            ].map(h=>(
              <div key={h.hormone} style={{ background:T.w,border:`1px solid ${T.w3}`,borderRadius:8,padding:'12px' }}>
                <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.rg2,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:8 }}>{h.hormone}</div>
                {h.methods.map(m=><div key={m} style={{ fontSize:11.5,color:T.w5,fontFamily:fonts.sans,fontWeight:300,marginBottom:4 }}>· {m}</div>)}
              </div>
            ))}
          </div>
        </Panel>
        {/* API integrations — scaffolded */}
        <Panel>
          <FieldLabel>Lab integrations</FieldLabel>
          <div style={{ display:'flex',gap:10 }}>
            {[
              { name:'Dante Labs WGS',  status:danteStub.ready?'Connected':'Pending',  note:'Genomic data — awaiting service token', color:danteStub.ready?T.ok:T.w4 },
              { name:'VitaminLab',      status:vitaminLabStub.ready?'Connected':'Pending', note:'Micronutrient data — awaiting API docs', color:vitaminLabStub.ready?T.ok:T.w4 },
            ].map(api=>(
              <div key={api.name} style={{ flex:1,background:T.w,border:`1px solid ${T.w3}`,borderRadius:8,padding:'12px' }}>
                <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:4 }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:api.color }}/>
                  <span style={{ fontSize:12,color:T.w7,fontFamily:fonts.sans,fontWeight:500 }}>{api.name}</span>
                </div>
                <div style={{ fontFamily:fonts.mono,fontSize:11,color:api.color,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:4 }}>{api.status}</div>
                <div style={{ fontSize:10.5,color:T.w4,fontFamily:fonts.sans,fontWeight:300 }}>{api.note}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );

    // ── LAB RESULTS ──
    if (tab === 'labs') return (
      <div>
        <Eyebrow>Upload & manage lab data</Eyebrow>
        <SectionTitle>Lab<br/><em style={{ fontStyle:'italic',color:T.rg2 }}>Results</em></SectionTitle>

        {/* Tests on file — shows which data drives conclusions */}
        <Panel>
          <FieldLabel>Tests on file</FieldLabel>
          <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w4, marginBottom:14, lineHeight:1.5 }}>
            These uploaded results inform your personalised protocol, meal design, and supplement recommendations.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { name:'ALCAT food reactivity', active: (P.severe?.length||0)+(P.moderate?.length||0)+(P.mild?.length||0) > 0, detail: `${(P.severe?.length||0)+(P.moderate?.length||0)+(P.mild?.length||0)} reactive foods identified` },
              { name:'CMA/CNA micronutrients', active: (P.cmaDeficiencies?.length||0)+(P.cmaAdequate?.length||0) > 0, detail: `${(P.cmaAllNutrients||[]).length} nutrients tested` },
              { name:'REDOX / Spectrox', active: P.redoxScore != null, detail: P.redoxScore != null ? `Score: ${P.redoxScore}/100` : null },
              { name:'Antioxidant panel', active: (P.cmaAntioxidants||[]).length > 0, detail: `${(P.cmaAntioxidants||[]).length} markers` },
              { name:'Genomic variants (VCF)', active: (P.genomicSnps||[]).length > 0, detail: `${(P.genomicSnps||[]).length} SNPs analysed` },
              { name:'Blood work / Other labs', active: P.customLabs?.length > 0, detail: P.customLabs?.length ? `${P.customLabs.length} reports` : null },
            ].map(t => (
              <div key={t.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background: t.active ? `${T.ok}08` : T.w1, border:`1px solid ${t.active ? T.ok+'30' : T.w3}`, borderRadius:8 }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background: t.active ? T.ok : T.w3, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {t.active
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 3V9M3 6H9" stroke={T.w5} strokeWidth="1.2" strokeLinecap="round"/></svg>}
                </div>
                <div>
                  <div style={{ fontFamily:fonts.sans, fontSize:12, color: t.active ? T.w7 : T.w4, fontWeight: t.active ? 500 : 400 }}>{t.name}</div>
                  {t.active && t.detail && <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.ok, letterSpacing:'0.06em', marginTop:1 }}>{t.detail}</div>}
                  {!t.active && <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.w4, letterSpacing:'0.06em', marginTop:1 }}>Not uploaded</div>}
                </div>
              </div>
            ))}
          </div>
          {((P.severe?.length||0)+(P.moderate?.length||0)+(P.mild?.length||0)+(P.cmaDeficiencies?.length||0)+(P.cmaAdequate?.length||0)+(P.genomicSnps?.length||0)) === 0 && (
            <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.warn, marginTop:14, padding:'10px 14px', background:`${T.warn}08`, borderRadius:8, lineHeight:1.5 }}>
              No lab data uploaded yet. Upload your test results below so Mario can build your evidence-based protocol.
            </div>
          )}
        </Panel>

        {/* Current ALCAT results summary */}
        {(P.severe?.length > 0 || P.moderate?.length > 0 || P.mild?.length > 0) && (
          <Panel>
            <FieldLabel>ALCAT — Reactive foods</FieldLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:8 }}>
              {[['Severe', P.severe, T.err], ['Moderate', P.moderate, T.warn], ['Mild', P.mild, T.w5]].map(([label, items, color]) => (
                <div key={label}>
                  <div style={{ fontFamily:fonts.mono, fontSize:10, color, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>{label} · {(items||[]).length}</div>
                  {(items||[]).slice(0, 6).map(f => <div key={f} style={{ fontSize:11, color:T.w6, fontFamily:fonts.sans, padding:'1px 0' }}>{f}</div>)}
                  {(items||[]).length > 6 && <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4 }}>+{items.length - 6} more</div>}
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* CMA/CNA micronutrient results */}
        {(P.cmaDeficiencies?.length > 0 || P.cmaAdequate?.length > 0) && (
          <Panel>
            <FieldLabel>CMA/CNA — Intracellular micronutrients ({(P.cmaAllNutrients||[]).length} tested)</FieldLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.err, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Deficient / Low · {(P.cmaDeficiencies||[]).length}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {(P.cmaDeficiencies||[]).map(n => (
                    <span key={n} style={{ background:`${T.err}12`, border:`1px solid ${T.err}35`, borderRadius:4, padding:'3px 9px', fontSize:11, fontFamily:fonts.sans, color:T.err }}>{n}</span>
                  ))}
                </div>
                {(P.cmaDeficiencies||[]).length === 0 && <div style={{ fontSize:11, color:T.w4, fontFamily:fonts.sans }}>None detected</div>}
              </div>
              <div>
                <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.ok, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Adequate · {(P.cmaAdequate||[]).length}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {(P.cmaAdequate||[]).map(n => (
                    <span key={n} style={{ background:`${T.ok}10`, border:`1px solid ${T.ok}25`, borderRadius:4, padding:'3px 9px', fontSize:11, fontFamily:fonts.sans, color:T.ok }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* Redox score + Antioxidant panel */}
        {P.redoxScore != null && (
          <Panel>
            <FieldLabel>REDOX / Spectrox — Total antioxidant function</FieldLabel>
            <div style={{ display:'flex', alignItems:'center', gap:24, marginBottom:16 }}>
              <div style={{ position:'relative', width:100, height:100 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke={T.w2} strokeWidth="8"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke={P.redoxScore < 50 ? T.err : P.redoxScore < 75 ? T.warn : T.ok} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(P.redoxScore / 100) * 264} 264`} transform="rotate(-90 50 50)" style={{ transition:'stroke-dasharray 0.8s ease' }}/>
                  <text x="50" y="48" textAnchor="middle" fontFamily={fonts.sans} fontSize="24" fontWeight="400" fill={T.w7}>{P.redoxScore}</text>
                  <text x="50" y="62" textAnchor="middle" fontFamily={fonts.mono} fontSize="9" fill={T.w4}>/ 100</text>
                </svg>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:11, color:P.redoxScore < 50 ? T.err : P.redoxScore < 75 ? T.warn : T.ok, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>
                  {P.redoxScore < 50 ? 'Severely depleted' : P.redoxScore < 75 ? 'Compromised' : 'Adequate'}
                </div>
                <div style={{ fontFamily:fonts.sans, fontSize:13, color:T.w6, lineHeight:1.6 }}>
                  {P.redoxScore < 50
                    ? 'Your antioxidant defense is critically low. Your diet must maximise redox-supportive foods at every meal. Flagged for clinician review before aggressive detox.'
                    : P.redoxScore < 75
                    ? 'Your antioxidant reserve is below optimal. Mario will prioritise redox-supportive foods — sulfur-rich vegetables, dark berries, and polyphenol sources — in every meal suggestion.'
                    : 'Your antioxidant defense is functioning well. Standard protocol applies with maintained antioxidant intake through diverse whole foods.'}
                </div>
              </div>
            </div>
            {(P.cmaAntioxidants||[]).length > 0 && (
              <div>
                <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.w4, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>Antioxidant panel</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:8 }}>
                  {(P.cmaAntioxidants||[]).map(a => {
                    const col = a.status === 'deficient' ? T.err : a.status === 'low' ? T.warn : T.ok;
                    return (
                      <div key={a.name} style={{ background:col+'08', border:`1px solid ${col}25`, borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w7, fontWeight:500, marginBottom:2 }}>{a.name}</div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                          {a.value != null && <span style={{ fontFamily:fonts.mono, fontSize:13, color:col, fontWeight:500 }}>{a.value}</span>}
                          <span style={{ fontFamily:fonts.mono, fontSize:10, color:col, letterSpacing:'0.1em', textTransform:'uppercase' }}>{a.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Panel>
        )}

        {/* Upload area */}
        <Panel>
          <FieldLabel>Upload new results</FieldLabel>
          <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w4, marginBottom:16, lineHeight:1.6 }}>
            PDF, photo, or screenshot of your ALCAT / CMA / CNA report. VCF genetic data files also accepted.
          </div>

          <div style={{ border:`2px dashed ${dashLabSuccess ? T.ok : dashLabError ? T.warn : T.w3}`, borderRadius:12, padding:'28px 20px', textAlign:'center', background:dashLabSuccess ? `${T.ok}08` : T.w1, transition:'all 0.3s', marginBottom:16 }}>
            {dashLabParsing ? (
              <div>
                <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:12 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:T.rg, animation:`pulse 1.2s ${i*0.2}s infinite` }}/>)}
                </div>
                <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4, letterSpacing:'0.12em' }}>ANALYSING YOUR RESULTS...</div>
              </div>
            ) : dashLabSuccess ? (
              <div>
                <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.ok, letterSpacing:'0.14em', marginBottom:8 }}>
                  RESULTS UPDATED
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:8 }}>
                  {(P.severe?.length||0)+(P.moderate?.length||0)+(P.mild?.length||0) > 0 && <span style={{ fontFamily:fonts.mono, fontSize:10, color:T.w5, background:T.w1, padding:'2px 8px', borderRadius:4 }}>ALCAT: {(P.severe||[]).length+(P.moderate||[]).length+(P.mild||[]).length} foods</span>}
                  {(P.cmaDeficiencies?.length||0)+(P.cmaAdequate?.length||0) > 0 && <span style={{ fontFamily:fonts.mono, fontSize:10, color:T.w5, background:T.w1, padding:'2px 8px', borderRadius:4 }}>CMA: {(P.cmaAllNutrients||[]).length} nutrients</span>}
                  {P.redoxScore != null && <span style={{ fontFamily:fonts.mono, fontSize:10, color:T.w5, background:T.w1, padding:'2px 8px', borderRadius:4 }}>REDOX: {P.redoxScore}/100</span>}
                  {(P.genomicSnps||[]).length > 0 && <span style={{ fontFamily:fonts.mono, fontSize:10, color:T.w5, background:T.w1, padding:'2px 8px', borderRadius:4 }}>VCF: {(P.genomicSnps||[]).length} SNPs</span>}
                </div>
                {dashLabFiles.map(fn => <div key={fn} style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4 }}>{fn}</div>)}
              </div>
            ) : (
              <div>
                <div style={{ fontFamily:fonts.serif, fontSize:16, color:T.w6, marginBottom:6 }}>Drop your lab results here</div>
                <div style={{ fontFamily:fonts.sans, fontSize:11, color:T.w4, marginBottom:14 }}>ALCAT PDF · CMA/CNA report · Lab photo · VCF genetic data · ZIP archive</div>
              </div>
            )}

            {dashLabError && (
              <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.warn, marginTop:8 }}>{typeof dashLabError === 'string' ? dashLabError : 'Could not extract results'}</div>
            )}

            {/* Hidden inputs — triggered via ref.click() for Android reliability */}
            <input ref={labFileRef} type="file" accept="*/*" style={{ display:'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) { setDashLabFile(f); dashParseFile(f, false); } e.target.value = ''; }}/>
            <input ref={labFileAddRef} type="file" accept="*/*" style={{ display:'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) { setDashLabFile(f); dashParseFile(f, true); } e.target.value = ''; }}/>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:12, flexWrap:'wrap' }}>
              <button onClick={() => labFileRef.current?.click()} style={{ background:T.rg, color:'#fff', border:'none', borderRadius:8, padding:'9px 22px', fontFamily:fonts.sans, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                {dashLabSuccess ? 'Replace results' : 'Choose file'}
              </button>
              {dashLabSuccess && (
                <button onClick={() => labFileAddRef.current?.click()} style={{ background:'none', border:`1px solid ${T.rg}`, color:T.rg, borderRadius:8, padding:'9px 22px', fontFamily:fonts.sans, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  + Add another file
                </button>
              )}
            </div>
            {dashLabSuccess && (
              <div style={{ marginTop:14, padding:'12px 16px', background:`${T.rg}0A`, border:`1px solid ${T.rg3}`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w6, lineHeight:1.5 }}>
                  New data available — {dietPlan ? 'update your diet to reflect the latest results.' : 'generate your personalised protocol now.'}
                </div>
                <button onClick={()=>{ setShowDiet(true); generateDiet(patient); }} style={{
                  background:T.rg, color:'#fff', border:'none', borderRadius:7, padding:'8px 20px', whiteSpace:'nowrap',
                  fontFamily:fonts.sans, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0,
                }}>
                  {dietPlan ? 'Update diet plan' : 'Generate diet plan'}
                </button>
              </div>
            )}
          </div>
        </Panel>

        {/* Genomic data display */}
        {P.genomicSnps?.length > 0 && (() => {
          const domainLabels = {
            methylation: 'Methylation & Folate Cycle',
            detox: 'Detoxification & Glutathione',
            inflammation: 'Inflammation & Immunity',
            longevity: 'Longevity Pathways',
            nutrients: 'Nutrient Metabolism',
            circadian: 'Circadian & Sleep',
            ans: 'Autonomic Nervous System',
            exercise: 'Exercise & Hormesis',
            sun: 'Sun & UV Response',
          };
          const domainColors = {
            methylation: '#8B5CF6', detox: '#10B981', inflammation: '#EF4444',
            longevity: '#F59E0B', nutrients: '#3B82F6', circadian: '#6366F1',
            ans: '#EC4899', exercise: '#F97316', sun: '#EAB308',
          };
          const grouped = {};
          P.genomicSnps.forEach(snp => {
            const d = snp.domain || 'other';
            if (!grouped[d]) grouped[d] = [];
            grouped[d].push(snp);
          });
          const domains = Object.keys(domainLabels).filter(d => grouped[d]?.length);
          // Also include ungrouped
          if (grouped['other']?.length) domains.push('other');
          return (
            <Panel>
              <FieldLabel>Actionable genomic variants — {P.genomicSnps.length} SNPs</FieldLabel>
              <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w4, marginBottom:16, lineHeight:1.5 }}>
                Only variants with a specific intervention — supplementation, diet, training, hormesis, circadian, or lifestyle adjustment.
              </div>
              {domains.map(domain => (
                <div key={domain} style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:fonts.mono, fontSize:10, color:domainColors[domain]||T.w5, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8, paddingBottom:4, borderBottom:`1px solid ${(domainColors[domain]||T.w5)}25` }}>
                    {domainLabels[domain] || 'Other'} · {grouped[domain].length}
                  </div>
                  {grouped[domain].map((snp, i) => {
                    const statusCol = snp.status === 'risk' ? T.err : snp.status === 'carrier' ? T.warn : T.ok;
                    return (
                      <div key={i} style={{ display:'flex', gap:10, padding:'7px 0', borderBottom:`1px solid ${T.w2}`, fontSize:12, fontFamily:fonts.sans, alignItems:'flex-start' }}>
                        <div style={{ minWidth:70 }}>
                          <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.rg2 }}>{snp.rsid}</div>
                          <div style={{ fontFamily:fonts.mono, fontSize:10, color:statusCol, textTransform:'uppercase' }}>{snp.status}</div>
                        </div>
                        <div style={{ minWidth:55, fontFamily:fonts.sans, fontSize:11, color:T.w6, fontWeight:500 }}>{snp.gene}</div>
                        <div style={{ minWidth:30, fontFamily:fonts.mono, fontSize:11, color:T.w5, textAlign:'center' }}>{snp.genotype}</div>
                        <div style={{ flex:1, fontSize:11, color:T.w5, lineHeight:1.4 }}>{snp.impact}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </Panel>
          );
        })()}

        {/* Files on record */}
        {uploadedLabFiles.length > 0 && (
          <Panel>
            <FieldLabel>Files on record</FieldLabel>
            <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w4, marginBottom:12, lineHeight:1.5 }}>
              These files are permanently stored in your account and loaded automatically on every login.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {uploadedLabFiles.map((f, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:T.w1, border:`1px solid ${T.w2}`, borderRadius:8 }}>
                  <div style={{ width:32, height:32, borderRadius:6, background:`${T.rg}10`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:fonts.mono, fontSize:9, color:T.rg2, textTransform:'uppercase' }}>{f.name.split('.').pop()}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w7, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                    <div style={{ fontFamily:fonts.mono, fontSize:10, color:T.w4 }}>
                      {f.size ? `${(f.size/1024).toFixed(0)} KB` : ''}{f.uploadedAt ? ` · ${new Date(f.uploadedAt).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:T.ok, flexShrink:0 }}/>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* File type guide */}
        <Panel>
          <FieldLabel>Supported file types</FieldLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { type:'ALCAT / CMA / CNA', formats:'PDF, photo, screenshot', desc:'Food reactivity & nutrient analysis' },
              { type:'Blood work', formats:'PDF, photo', desc:'Standard blood panels, thyroid, hormones' },
              { type:'VCF genetic data', formats:'.vcf, .txt, .zip', desc:'23andMe, AncestryDNA, Dante Labs exports' },
              { type:'Clinical reports', formats:'.doc, .docx, PDF', desc:'Doctor\'s notes, specialist reports' },
              { type:'ZIP archives', formats:'.zip', desc:'Upload multiple files at once — auto-extracted' },
            ].map(ft => (
              <div key={ft.type} style={{ background:T.w, border:`1px solid ${T.w3}`, borderRadius:8, padding:12 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.rg2, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>{ft.type}</div>
                <div style={{ fontSize:11, color:T.w6, fontFamily:fonts.sans, marginBottom:2 }}>{ft.formats}</div>
                <div style={{ fontSize:10, color:T.w4, fontFamily:fonts.sans, fontWeight:300 }}>{ft.desc}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );

    // ── TODAY ──
    if (tab === 'today') {
      const now = new Date();
      const hour = now.getHours();
      const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const protocolDay = P.dayInProtocol || 1;
      const phaseObj = PHASES.find(ph => {
        if (ph.id === 1) return protocolDay <= 21;
        if (ph.id === 2) return protocolDay <= 90;
        if (ph.id === 3) return protocolDay <= 120;
        if (ph.id === 4) return protocolDay <= 180;
        return true;
      }) || PHASES[0];
      const hasAlcat = (P.severe?.length||0)+(P.moderate?.length||0)+(P.mild?.length||0) > 0;
      const hasCMA = (P.cmaDeficiencies?.length||0) > 0;
      const todayRotDay = protocolDay > 0 ? ((protocolDay % 4) || 4) : rotDay;
      const todayFoods = ROT[todayRotDay] || null;
      const bindingConstraint = (P.severe?.length||0) > 3 ? {
        label: 'Immune load', sub: `${P.severe.length} severe reactive foods — immune silence protocol required`, sys: 'Immune', color: T.err,
      } : hasCMA ? {
        label: 'Cellular micronutrient gap', sub: `${P.cmaDeficiencies.length} intracellular deficiencies limiting cell function`, sys: 'Micronutrient', color: T.warn,
      } : P.redoxScore != null && P.redoxScore < 75 ? {
        label: 'Redox depletion', sub: `Antioxidant score ${P.redoxScore}/100 — oxidative stress active`, sys: 'Redox', color: T.warn,
      } : hasAlcat ? {
        label: 'Reactive food protocol active', sub: `${(P.severe?.length||0)+(P.moderate?.length||0)} foods restricted — stay on rotation`, sys: 'Immune', color: T.ok,
      } : null;

      return (
        <div>
          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.rg,letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:10 }}>
              {greeting}{P.name ? `, ${P.name.split(' ')[0]}` : ''}
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14,flexWrap:'wrap' }}>
              <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:`${phaseObj.color}15`,border:`1px solid ${phaseObj.color}40`,borderRadius:20,padding:'5px 14px' }}>
                <div style={{ width:5,height:5,borderRadius:'50%',background:phaseObj.color,flexShrink:0 }}/>
                <span style={{ fontFamily:fonts.mono,fontSize:10,color:phaseObj.color,letterSpacing:'0.12em' }}>{phaseObj.label.toUpperCase()} · DAY {protocolDay}</span>
              </div>
              {monActive && (
                <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:`${T.err}12`,border:`1px solid ${T.err}40`,borderRadius:20,padding:'5px 14px' }}>
                  <div style={{ width:5,height:5,borderRadius:'50%',background:T.err,animation:'pulse 1.2s infinite',flexShrink:0 }}/>
                  <span style={{ fontFamily:fonts.mono,fontSize:10,color:T.err,letterSpacing:'0.12em' }}>MONITORING ACTIVE</span>
                </div>
              )}
            </div>
            <div style={{ fontFamily:fonts.serif,fontSize:26,color:T.w7,lineHeight:1.2,fontWeight:400 }}>
              {!hasAlcat ? <>Start your<br/>biological reset.</> : <>Your protocol<br/>is active.</>}
            </div>
          </div>

          {!hasAlcat && (
            <div style={{ background:T.rgBg,border:`1px solid ${T.rg}30`,borderRadius:16,padding:'20px 18px',marginBottom:14 }}>
              <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.rg2,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:8 }}>NEXT STEP</div>
              <div style={{ fontFamily:fonts.sans,fontSize:14,color:T.w7,fontWeight:500,marginBottom:6 }}>Upload your ALCAT results</div>
              <div style={{ fontFamily:fonts.sans,fontSize:12,color:T.w5,lineHeight:1.6,marginBottom:14 }}>Mario builds your reactive food profile and personalised 21-day immune reset protocol from your lab data.</div>
              <button onClick={()=>setTab('me')} style={{ background:T.rg,border:'none',borderRadius:9,padding:'10px 22px',cursor:'pointer',fontFamily:fonts.sans,fontSize:12,fontWeight:600,color:'#fff' }}>Go to My Labs</button>
            </div>
          )}

          {bindingConstraint && (
            <div style={{ background:`${bindingConstraint.color}10`,border:`1px solid ${bindingConstraint.color}35`,borderRadius:14,padding:'16px 18px',marginBottom:14 }}>
              <div style={{ fontFamily:fonts.mono,fontSize:10,color:bindingConstraint.color,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:6 }}>BINDING CONSTRAINT · {bindingConstraint.sys.toUpperCase()}</div>
              <div style={{ fontFamily:fonts.sans,fontSize:14,color:T.w7,fontWeight:500,marginBottom:3 }}>{bindingConstraint.label}</div>
              <div style={{ fontFamily:fonts.sans,fontSize:12,color:T.w5,lineHeight:1.5 }}>{bindingConstraint.sub}</div>
            </div>
          )}

          {hasAlcat && (
            <div style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:14,overflow:'hidden',marginBottom:14 }}>
              <div style={{ padding:'12px 16px 10px',borderBottom:`1px solid ${T.w2}` }}>
                <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.16em',textTransform:'uppercase' }}>TODAY'S MEALS · ROTATION DAY {todayRotDay}</div>
              </div>
              {[{meal:'Breakfast',mhour:7,emoji:'☀️',cat:'protein'},{meal:'Lunch',mhour:13,emoji:'🌤️',cat:'veg'},{meal:'Dinner',mhour:19,emoji:'🌙',cat:'grains'}].map(({meal,mhour,emoji,cat},i)=>{
                const isPast = hour > mhour + 2;
                const isCurrent = hour >= mhour - 1 && hour <= mhour + 2;
                const foods = todayFoods?.[cat] || [];
                return (
                  <div key={meal} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<2?`1px solid ${T.w2}`:'none',opacity:isPast?0.5:1 }}>
                    <div style={{ width:34,height:34,borderRadius:10,background:isCurrent?T.rg:T.w2,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:16 }}>{emoji}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <span style={{ fontFamily:fonts.sans,fontSize:13,color:T.w7,fontWeight:isCurrent?500:400 }}>{meal}</span>
                        <span style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4 }}>{mhour}:00</span>
                      </div>
                      <div style={{ fontFamily:fonts.sans,fontSize:11,color:T.w4,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                        {foods.slice(0,3).join(' · ') || (isCurrent?'Tap LOG to record this meal':'See rotation plan')}
                      </div>
                    </div>
                    {isCurrent && <button onClick={()=>setTab('monitor')} style={{ background:T.rg,border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontFamily:fonts.mono,fontSize:10,color:'#fff',letterSpacing:'0.08em',flexShrink:0 }}>LOG</button>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14 }}>
            <button onClick={()=>setTab('plate')} style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:14,padding:'14px 16px',cursor:'pointer',textAlign:'left' }}>
              <div style={{ marginBottom:6 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.rg2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
              <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.rg2,letterSpacing:'0.14em',marginBottom:3 }}>PLATE CHECK</div>
              <div style={{ fontFamily:fonts.sans,fontSize:11,color:T.w5 }}>Scan meal for reactions</div>
            </button>
            <button onClick={()=>setTab('gut')} style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:14,padding:'14px 16px',cursor:'pointer',textAlign:'left' }}>
              <div style={{ marginBottom:6 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.rg2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-4m-6 0h6"/></svg></div>
              <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.rg2,letterSpacing:'0.14em',marginBottom:3 }}>GUT CHECK</div>
              <div style={{ fontFamily:fonts.sans,fontSize:11,color:T.w5 }}>Log symptoms now</div>
            </button>
            <button onClick={()=>setTab('monitor')} style={{ background:T.w1,border:`1px solid ${monActive?T.err:T.w3}`,borderRadius:14,padding:'14px 16px',cursor:'pointer',textAlign:'left' }}>
              <div style={{ marginBottom:6 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={monActive?T.err:T.rg2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
              <div style={{ fontFamily:fonts.mono,fontSize:10,color:monActive?T.err:T.rg2,letterSpacing:'0.14em',marginBottom:3 }}>{monActive?'MONITORING ON':'MONITOR'}</div>
              <div style={{ fontFamily:fonts.sans,fontSize:11,color:T.w5 }}>Post-meal biometrics</div>
            </button>
            <button onClick={()=>setShowDoctorPopup(true)} style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:14,padding:'14px 16px',cursor:'pointer',textAlign:'left' }}>
              <div style={{ marginBottom:6 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.rg2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
              <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.rg2,letterSpacing:'0.14em',marginBottom:3 }}>DOCTOR</div>
              <div style={{ fontFamily:fonts.sans,fontSize:11,color:T.w5 }}>Speak to a clinician</div>
            </button>
          </div>

          <button onClick={()=>setTab('mario')} style={{ width:'100%',background:`linear-gradient(140deg,${T.rg3} 0%,${T.rg} 40%,${T.rg2} 100%)`,border:'none',borderRadius:14,padding:'18px 20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:fonts.sans,fontSize:14,color:'rgba(255,255,255,0.92)',fontWeight:500,marginBottom:2 }}>Ask Mario anything</div>
              <div style={{ fontFamily:fonts.mono,fontSize:10,color:'rgba(255,255,255,0.55)',letterSpacing:'0.14em' }}>YOUR BIOLOGICAL AI</div>
            </div>
            <div style={{ width:38,height:38,borderRadius:'50%',background:'rgba(255,255,255,0.14)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
          </button>
        </div>
      );
    }

    // ── ME ──
    if (tab === 'me') {
      const protocolDay = P.dayInProtocol || 1;
      const phaseObj = PHASES.find(ph => {
        if (ph.id === 1) return protocolDay <= 21;
        if (ph.id === 2) return protocolDay <= 90;
        if (ph.id === 3) return protocolDay <= 120;
        if (ph.id === 4) return protocolDay <= 180;
        return true;
      }) || PHASES[0];
      const subsystems = [
        { label:'Immune',       color:(P.severe?.length||0)>0?T.err:T.ok,              detail:`${(P.severe?.length||0)+(P.moderate?.length||0)} reactive foods` },
        { label:'Redox',        color:P.redoxScore!=null?(P.redoxScore<50?T.err:P.redoxScore<75?T.warn:T.ok):T.w4, detail:P.redoxScore!=null?`Score ${P.redoxScore}/100`:'Not tested' },
        { label:'Micronutrient',color:(P.cmaDeficiencies?.length||0)>0?T.warn:(P.cmaAdequate?.length||0)>0?T.ok:T.w4, detail:(P.cmaDeficiencies?.length||0)>0?`${P.cmaDeficiencies.length} deficient`:(P.cmaAdequate?.length||0)>0?'Adequate':'Not tested' },
        { label:'Methylation',  color:(P.genomicSnps||[]).filter(s=>s.domain==='methylation').length>0?T.warn:T.w4, detail:(P.genomicSnps||[]).filter(s=>s.domain==='methylation').length>0?`${(P.genomicSnps||[]).filter(s=>s.domain==='methylation').length} variants`:'Not tested' },
        { label:'Mitochondrial',color:T.w4, detail:'Not tested' },
        { label:'Circadian',    color:T.ok, detail:'Protocol active' },
      ];
      const archiveRows = [
        { label:'Labs & Reactivity',         detail:'ALCAT · CMA · Blood work',             goTab:'labs',     count:(P.severe?.length||0)+(P.moderate?.length||0)+(P.mild?.length||0)>0?`${(P.severe?.length||0)+(P.moderate?.length||0)+(P.mild?.length||0)} items`:'Upload' },
        { label:'Genomics',                  detail:'VCF · SNPs · Pathways',                goTab:'labs',     count:(P.genomicSnps?.length||0)>0?`${P.genomicSnps.length} SNPs`:'Upload' },
        { label:'Rotation & Meals',          detail:'4-day rotation · Meal plan · Grocery', goTab:'rotation', count:ROT[1]?'Active':'Set up' },
        { label:'Supplements & Medications', detail:'Current formulation · Interactions',   goTab:'meds',     count:(medSupp||medRx)?'On file':'Add' },
        { label:'Outcomes & Progress',       detail:'Symptoms · Energy · Measurements',     goTab:'outcomes', count:(outcomes.checkins?.length||0)>0?`${outcomes.checkins.length} check-ins`:'Start' },
        { label:'Generate Protocol',         detail:'Meal plan · Rotation · Grocery list',  goTab:'generate', count:'Generate' },
      ];
      return (
        <div>
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:16 }}>
            <div style={{ width:52,height:52,borderRadius:'50%',background:`linear-gradient(140deg,${T.rg3},${T.rg})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <span style={{ fontFamily:fonts.serif,fontSize:22,color:'#fff',fontWeight:400 }}>{P.name?P.name.charAt(0).toUpperCase():'M'}</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:fonts.serif,fontSize:20,color:T.w7,fontWeight:400 }}>{P.name||'Your profile'}</div>
              <div style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4,letterSpacing:'0.14em',textTransform:'uppercase',marginTop:2 }}>
                {P.hormonalStatus||P.sex||''}{P.dayInProtocol?` · Day ${P.dayInProtocol}`:''}
              </div>
            </div>
            <button onClick={async()=>{ await supabase.auth.signOut(); setAuthUser(null); setPatient({}); setShowAuth(true); setShowLanding(false); setShowOnboarding(false); }} style={{ background:'none',border:`1px solid ${T.w3}`,borderRadius:8,padding:'7px 14px',cursor:'pointer',fontFamily:fonts.mono,fontSize:10,color:T.w5,letterSpacing:'0.1em',flexShrink:0 }}>SIGN OUT</button>
          </div>
          <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:`${phaseObj.color}15`,border:`1px solid ${phaseObj.color}40`,borderRadius:20,padding:'5px 14px',marginBottom:20 }}>
            <div style={{ width:5,height:5,borderRadius:'50%',background:phaseObj.color,flexShrink:0 }}/>
            <span style={{ fontFamily:fonts.mono,fontSize:10,color:phaseObj.color,letterSpacing:'0.12em' }}>{phaseObj.label.toUpperCase()} · DAY {protocolDay} · {phaseObj.range.toUpperCase()}</span>
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:10 }}>BIOLOGICAL SUBSYSTEMS</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8 }}>
              {subsystems.map(sys=>(
                <div key={sys.label} style={{ background:`${sys.color}10`,border:`1px solid ${sys.color}30`,borderRadius:10,padding:'10px 12px' }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:sys.color,marginBottom:6 }}/>
                  <div style={{ fontFamily:fonts.mono,fontSize:9,color:sys.color,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:2 }}>{sys.label}</div>
                  <div style={{ fontFamily:fonts.sans,fontSize:10,color:T.w5 }}>{sys.detail}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:T.w1,border:`1px solid ${T.w3}`,borderRadius:14,overflow:'hidden',marginBottom:20 }}>
            {archiveRows.map((row,i)=>(
              <button key={row.label} onClick={()=>setTab(row.goTab)} style={{ width:'100%',display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:'none',border:'none',borderBottom:i<archiveRows.length-1?`1px solid ${T.w2}`:'none',cursor:'pointer',textAlign:'left' }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:fonts.sans,fontSize:13,color:T.w7,fontWeight:500,marginBottom:1 }}>{row.label}</div>
                  <div style={{ fontFamily:fonts.sans,fontSize:11,color:T.w4 }}>{row.detail}</div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:6,flexShrink:0 }}>
                  <span style={{ fontFamily:fonts.mono,fontSize:10,color:T.rg2 }}>{row.count}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.w4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </button>
            ))}
          </div>
          <div style={{ textAlign:'center',padding:'4px 0 8px' }}>
            <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.1em',marginBottom:6 }}>MediBalans AB · Karlavägen 89, Stockholm</div>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:8 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill={T.rg} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ fontFamily:fonts.mono,fontSize:10,color:T.w5 }}>4.87 Reco · #1 health clinic in Sweden</span>
            </div>
            <span style={{ fontFamily:fonts.mono,fontSize:9,color:T.rg2,border:`1px solid ${T.rg}25`,borderRadius:3,padding:'2px 8px',letterSpacing:'0.12em',background:T.rgBg }}>PATENT PENDING · SE 2615203-3</span>
          </div>
        </div>
      );
    }

    return null;
  };

  // ── LANDING ───────────────────────────────────────────────────────────────────
  // Auth check loading
  if (!authChecked) return (
    <div style={{ minHeight:'100vh', background:T.w, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4, letterSpacing:'0.2em' }}>LOADING...</div>
    </div>
  );

  // Auth gate
  if (showAuth || (!authUser && !showLanding)) return (
    <AuthScreen onAuthed={(user) => {
      setAuthUser(user);
      setShowAuth(false);
    }}/>
  );

  if (showLanding) return (
    <div style={{ minHeight:'100vh',background:T.w,overflow:'hidden',position:'relative' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');*{box-sizing:border-box}button:hover{opacity:0.88}`}</style>
      {/* Orbs */}
      {[{s:520,c:`rgba(220,180,168,0.22)`,an:'ob1',t:'8%',l:'58%'},{s:360,c:`rgba(196,136,122,0.14)`,an:'ob2',t:'40%',l:'72%'},{s:440,c:`rgba(240,210,195,0.16)`,an:'ob3',t:'-8%',l:'36%'}].map((o,i)=>(
        <div key={i} style={{ position:'absolute',top:o.t,left:o.l,width:o.s,height:o.s,borderRadius:'50%',background:o.c,filter:'blur(80px)',animation:`${o.an} ${14+i*2.5}s ease-in-out infinite`,pointerEvents:'none' }}/>
      ))}
      {/* Caustic lines */}
      {[{an:'ca1',rot:'-6deg',t:'22%'},{an:'ca2',rot:'9deg',t:'58%'}].map((c,i)=>(
        <div key={i} style={{ position:'absolute',left:0,top:c.t,width:'100%',height:1,background:`linear-gradient(90deg,transparent,rgba(196,136,122,0.18) 30%,rgba(196,136,122,0.32) 50%,rgba(196,136,122,0.18) 70%,transparent)`,transform:`rotate(${c.rot})`,animation:`${c.an} 11s ease-in-out infinite`,pointerEvents:'none' }}/>
      ))}
      {/* Nav */}
      <div style={{ position:'relative',zIndex:10,height:58,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 60px',borderBottom:`1px solid ${T.w3}` }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ width:9,height:9,borderRadius:'50%',background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,0.40)`,flexShrink:0 }}/>
          <span style={{ fontFamily:"'EB Garamond', Georgia, serif",fontSize:18,fontWeight:400,color:T.w7,letterSpacing:'0.01em' }}>meet mario</span>
        </div>
        <span style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,border:`1px solid ${T.w3}`,borderRadius:3,padding:'3px 8px',letterSpacing:'0.14em' }}>PATENT PENDING · SE 2615203-3</span>
      </div>
      {/* Hero — everything above the fold, no scroll */}
      <div style={{ position:'relative',zIndex:2,padding:'28px 60px 0',maxWidth:860,height:'calc(100vh - 58px)',display:'flex',flexDirection:'column',justifyContent:'center' }}>
        <div style={{ display:'inline-flex',alignItems:'center',gap:12,marginBottom:20 }}>
          <div style={{ width:28,height:1,background:T.rg }}/>
          <span style={{ fontFamily:fonts.mono,fontSize:11,color:T.rg2,letterSpacing:'0.24em',textTransform:'uppercase' }}>precision medicine · stockholm</span>
        </div>
        <h1 style={{ fontFamily:fonts.serif,fontSize:54,fontWeight:400,lineHeight:1.0,letterSpacing:'-0.02em',color:T.w7,marginBottom:16 }}>
          Your body has<br/>been speaking.<br/>
          <em style={{ fontStyle:'italic',background:`linear-gradient(118deg,${T.rg2} 0%,${T.rg} 22%,#ECC8B8 36%,${T.rg} 50%,${T.rg2} 72%,${T.rg3} 88%,${T.rg} 100%)`,backgroundSize:'220% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',animation:'shimmer 5.5s linear infinite' }}>We translate it.</em>
        </h1>
        <p style={{ fontSize:15,fontWeight:300,color:T.w5,lineHeight:1.7,maxWidth:480,marginBottom:28,fontFamily:fonts.sans }}>A clinical intake built on proprietary immune reactivity data. Ten minutes. A 21-day protocol designed for your precise biology.</p>
        <div style={{ display:'flex',gap:0,borderTop:`1px solid ${T.w3}`,borderBottom:`1px solid ${T.w3}`,marginBottom:32,width:'fit-content' }}>
          {[['21','Day Protocol'],['10′','Intake Time'],['7','Patent Claims'],['4','Diagnostic Pillars']].map(([n,l],i,arr)=>(
            <div key={l} style={{ padding:'12px 28px 10px 0',marginRight:28,borderRight:i<arr.length-1?`1px solid ${T.w3}`:'none' }}>
              <div style={{ fontFamily:fonts.serif,fontSize:26,fontWeight:400,color:T.w7,letterSpacing:'-0.03em',lineHeight:1,marginBottom:4 }}>{n}</div>
              <div style={{ fontFamily:fonts.mono,fontSize:10,color:T.w4,letterSpacing:'0.18em',textTransform:'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:20,marginBottom:32 }}>
          <BtnPrimary onClick={()=>{setShowLanding(false); if(authUser){setShowOnboarding(true);}else{setShowAuth(true);}}}>Begin Assessment</BtnPrimary>
          <span style={{ fontFamily:fonts.mono,fontSize:11,color:T.w4,letterSpacing:'0.12em' }}>~10 min · GDPR · No card required</span>
        </div>
        {/* Trust bar */}
        <div style={{ display:'flex',alignItems:'center',gap:24,flexWrap:'wrap' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ display:'flex',gap:2 }}>
              {[1,2,3,4,5].map(i=>(
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i<=4?T.rg:T.rg+'60'} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <span style={{ fontFamily:fonts.sans,fontSize:13,fontWeight:600,color:T.w7 }}>4.87</span>
            <span style={{ fontFamily:fonts.sans,fontSize:12,color:T.w5 }}>on Reco</span>
          </div>
          <div style={{ width:1,height:16,background:T.w3 }}/>
          <span style={{ fontFamily:fonts.sans,fontSize:12,color:T.w5 }}>#1 rated health clinic in Sweden</span>
          <div style={{ width:1,height:16,background:T.w3 }}/>
          <a href="https://medibalans.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily:fonts.sans,fontSize:12,color:T.rg2,textDecoration:'none',borderBottom:`1px solid ${T.rg}30` }}>medibalans.com</a>
        </div>
      </div>
      <style>{`@keyframes ob1{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}25%{transform:translate(36px,-30px) scale(1.04) rotate(4deg)}50%{transform:translate(14px,38px) scale(.97) rotate(-3deg)}75%{transform:translate(-24px,12px) scale(1.02) rotate(6deg)}}@keyframes ob2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-28px,22px) scale(.95)}70%{transform:translate(20px,-16px) scale(1.03)}}@keyframes ob3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-18px,-24px) scale(1.07)}}@keyframes ca1{0%,100%{opacity:.38;transform:rotate(-6deg) scaleX(1)}50%{opacity:.08;transform:rotate(-3deg) scaleX(1.45)}}@keyframes ca2{0%,100%{opacity:.32;transform:rotate(9deg) scaleX(1)}50%{opacity:.06;transform:rotate(6deg) scaleX(.62)}}@keyframes shimmer{0%{background-position:0% center}100%{background-position:220% center}}`}</style>
    </div>
  );

  // ── ONBOARDING ────────────────────────────────────────────────────────────────
  if (showOnboarding) return (
    <Onboarding onComplete={async (data)=>{
      setPatient(data);
      setShowOnboarding(false);
      // Save profile to Supabase + sessionStorage so returning users skip onboarding
      const profilePayload = {
        name: data.name,
        dob: data.dob,
        sex: data.sex,
        hormonalStatus: data.hormonalStatus,
        geographyOfOrigin: data.geographyOfOrigin,
        yearsInCurrentCountry: data.yearsInCurrentCountry,
        symptoms: data.symptoms,
        tests: data.tests,
        medications: data.medications,
        supplements: data.supplements,
        conditions: data.conditions,
        goals: data.goals,
        alcat_severe: data.alcat_severe || [],
        alcat_moderate: data.alcat_moderate || [],
        alcat_mild: data.alcat_mild || [],
      };
      // Immediate sessionStorage save — works regardless of Supabase RLS
      if (authUser?.id) {
        try { sessionStorage.setItem('mm_profile_' + authUser.id, JSON.stringify(profilePayload)); } catch {}
      }
      if (authUser?.id) {
        // Save to profiles table (primary)
        try {
          const { error: profileErr } = await supabase.from('profiles').upsert({
            id: authUser.id,
            full_name: data.name,
            onboarding_complete: true,
            patient_data: JSON.stringify(profilePayload),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
          if (profileErr) console.error('[save] profiles upsert error:', profileErr.message);
          else console.log('[save] profiles saved OK');
        } catch(e) { console.error('[save] profiles exception:', e); }
        // Save to onboarding_intake (backup)
        try {
          const { error: intakeErr } = await supabase.from('onboarding_intake').upsert({
            user_id: authUser.id,
            name: data.name,
            dob: data.dob,
            sex: data.sex,
            hormonal_status: data.hormonalStatus,
            geography_of_origin: data.geographyOfOrigin,
            years_in_current_country: data.yearsInCurrentCountry,
            symptoms: data.symptoms || [],
            tests: data.tests || [],
            medications: data.medications || '',
            supplements: data.supplements || '',
            conditions: data.conditions || '',
            goals: data.goals || [],
            alcat_severe: data.alcat_severe || [],
            alcat_moderate: data.alcat_moderate || [],
            alcat_mild: data.alcat_mild || [],
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
          if (intakeErr) console.error('[save] onboarding_intake upsert error:', intakeErr.message);
          else console.log('[save] onboarding_intake saved OK');
        } catch(e) { console.error('[save] onboarding_intake exception:', e); }
      } else {
        console.warn('[save] No authUser — onboarding data NOT saved to database');
      }
      let score = 20;
      if (data.symptoms?.length >= 5) score += 25;
      else if (data.symptoms?.length >= 3) score += 15;
      else if (data.symptoms?.length >= 1) score += 8;
      if (data.yearsInCurrentCountry && +data.yearsInCurrentCountry < 5) score += 12;
      if (data.hormonalStatus && data.hormonalStatus !== 'Not applicable') score += 8;
      if (data.medications?.trim()) score += 10;
      if (data.conditions?.trim()) score += 10;
      setBesScore(Math.min(score, 92));
      setShowBES(true);
    }}/>
  );

  // ── BES RESULTS ────────────────────────────────────────────────────────────────
  if (showBES) {
    const s = besScore;
    const level = s < 35 ? 'Low' : s < 60 ? 'Moderate' : 'Elevated';
    const levelColor = s < 35 ? T.ok : s < 60 ? T.warn : T.err;
    const arc = Math.round((s / 100) * 180);
    const desc = s < 35
      ? 'Your biological signals suggest a relatively low entropic burden. Your system has strong repair capacity and is likely to respond quickly to the protocol.'
      : s < 60
      ? 'Your biological signals suggest a moderate entropic burden accumulated over time. Your system has good repair capacity but will benefit from the full 90-day protocol.'
      : 'Your biological signals suggest an elevated entropic burden with deeper systemic involvement. Your system will respond — but in layers. The full multi-stage protocol is what your biology needs.';
    return (
      <div style={{ minHeight:'100vh', background:T.w, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:fonts.sans }}>
        <div style={{ maxWidth:520, width:'100%', padding:'0 24px', textAlign:'center' }}>
          <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.rg, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:20 }}>
            Biological Entropy Score
          </div>
          {/* SVG Gauge */}
          <svg width={260} height={150} viewBox="0 0 260 150" style={{ display:'block', margin:'0 auto 8px' }}>
            <path d="M 20 140 A 110 110 0 0 1 240 140" fill="none" stroke={T.w2} strokeWidth={14} strokeLinecap="round"/>
            <path d="M 20 140 A 110 110 0 0 1 240 140" fill="none" stroke={levelColor} strokeWidth={14} strokeLinecap="round"
              strokeDasharray={`${arc * 1.92} 346`} style={{ transition:'stroke-dasharray 1.2s ease' }}/>
            <text x={130} y={120} textAnchor="middle" fontFamily="'Playfair Display',serif" fontSize={48} fontWeight={400} fill={T.w7}>{s}</text>
            <text x={130} y={142} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize={9} fill={T.w4} letterSpacing="4">/ 100</text>
          </svg>
          <div style={{ fontFamily:fonts.mono, fontSize:11, fontWeight:500, color:levelColor, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:16 }}>
            {level} Entropy
          </div>
          <h2 style={{ fontFamily:fonts.serif, fontSize:26, fontWeight:400, color:T.w7, marginBottom:16, lineHeight:1.3 }}>
            Your biology is ready<br/>to begin the reset.
          </h2>
          <p style={{ fontSize:14, color:T.w5, lineHeight:1.7, marginBottom:32 }}>{desc}</p>
          <div style={{ background:T.rgBg, border:`1px solid ${T.rg3}`, borderRadius:10, padding:'14px 20px', marginBottom:32, textAlign:'left' }}>
            <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.rg, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>Protocol assigned</div>
            <div style={{ fontFamily:fonts.serif, fontSize:16, color:T.w7 }}>Option A — 21-Day Universal GCR Detox</div>
            <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w5, marginTop:4 }}>The fastest path to immune silence. Saves 3 months vs rotation-only approach.</div>
          </div>
          <button onClick={()=>setShowDietBasis(true)} style={{
            background:T.rg, color:'#fff', border:'none', borderRadius:9, padding:'13px 36px',
            fontFamily:fonts.sans, fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.04em',
          }}>
            Generate My 21-Day Plan
          </button>

          {/* Diet basis explanation popup */}
          {showDietBasis && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={()=>setShowDietBasis(false)}>
              <div onClick={e=>e.stopPropagation()} style={{ background:T.w, borderRadius:16, maxWidth:540, width:'100%', padding:'36px 32px', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
                <div style={{ fontFamily:fonts.serif, fontSize:22, color:T.w7, marginBottom:6 }}>How we design your protocol</div>
                <div style={{ fontFamily:fonts.sans, fontSize:13, color:T.w5, lineHeight:1.7, marginBottom:20 }}>
                  Your personalised diet is not generic advice. It is built from multiple layers of your own biological data:
                </div>
                <div style={{ display:'grid', gap:12, marginBottom:20 }}>
                  {[
                    { icon:'🛡️', title:'Immune system (ALCAT)', desc:'Your innate immune reactivity profile — which foods your immune system recognises as threats. These are excluded to achieve immune silence.', active:(patient.severe?.length||0)+(patient.moderate?.length||0)+(patient.mild?.length||0)>0 },
                    { icon:'🔬', title:'Cellular function (CMA/CNA)', desc:'Your intracellular micronutrient levels — 55 nutrients measured inside your cells. Deficiencies are corrected through targeted food selection.', active:(patient.cmaDeficiencies?.length||0)+(patient.cmaAdequate?.length||0)>0 },
                    { icon:'⚡', title:'Antioxidant defence (REDOX)', desc:'Your total antioxidant capacity and individual antioxidant levels. Every meal is designed to restore your redox balance.', active:patient.redoxScore!=null },
                    { icon:'🧬', title:'Genetics (VCF)', desc:'Your genetic variants in methylation, detox, nutrient metabolism, hormesis response, and autonomic balance. Genes tell us WHY — the protocol addresses WHAT.', active:(patient.genomicSnps?.length||0)>0 },
                    { icon:'🔮', title:'Proteomics & RNA (coming soon)', desc:'Protein expression and transcriptomic profiling will add the final layer — measuring which genes are actively expressing and which proteins are circulating.', active:false },
                  ].map(layer => (
                    <div key={layer.title} style={{ display:'flex', gap:14, padding:'12px 16px', background:layer.active?`${T.ok}06`:T.w1, border:`1px solid ${layer.active?T.ok+'25':T.w3}`, borderRadius:10 }}>
                      <div style={{ fontSize:20, lineHeight:1 }}>{layer.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                          <span style={{ fontFamily:fonts.sans, fontSize:13, fontWeight:600, color:T.w7 }}>{layer.title}</span>
                          {layer.active ? <span style={{ fontFamily:fonts.mono, fontSize:9, color:T.ok, letterSpacing:'0.1em', textTransform:'uppercase', background:`${T.ok}12`, padding:'1px 6px', borderRadius:3 }}>UPLOADED</span>
                          : layer.title.includes('coming') ? <span style={{ fontFamily:fonts.mono, fontSize:9, color:T.w4, letterSpacing:'0.1em', textTransform:'uppercase' }}>COMING SOON</span>
                          : <span style={{ fontFamily:fonts.mono, fontSize:9, color:T.warn, letterSpacing:'0.1em', textTransform:'uppercase' }}>NOT YET UPLOADED</span>}
                        </div>
                        <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w5, lineHeight:1.5 }}>{layer.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily:fonts.sans, fontSize:12, color:T.w4, lineHeight:1.6, marginBottom:20, padding:'10px 14px', background:T.w1, borderRadius:8 }}>
                  The more data layers available, the more precise your protocol. You can always upload additional tests later — Mario will recalibrate automatically.
                </div>
                <div style={{ display:'flex', gap:12 }}>
                  <button onClick={()=>{
                    setShowDietBasis(false);
                    setShowBES(false); setShowDiet(true);
                    generateDiet(patient);
                  }} style={{
                    background:T.rg, color:'#fff', border:'none', borderRadius:9, padding:'13px 32px',
                    fontFamily:fonts.sans, fontSize:14, fontWeight:700, cursor:'pointer',
                  }}>
                    Generate my protocol
                  </button>
                  <button onClick={()=>setShowDietBasis(false)} style={{
                    background:'none', border:`1px solid ${T.w3}`, borderRadius:9, padding:'13px 24px',
                    fontFamily:fonts.sans, fontSize:13, color:T.w5, cursor:'pointer',
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 21-DAY DIET SCREEN ─────────────────────────────────────────────────────
  if (showDiet) return (
    <div style={{ minHeight:'100vh', background:T.w, fontFamily:fonts.sans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');*{box-sizing:border-box}`}</style>
      <Nav onBabyBalans={()=>window.open('/pregnancy','_blank')} onSignOut={async()=>{ await supabase.auth.signOut(); setAuthUser(null); setPatient({}); setShowAuth(true); setShowLanding(false); setShowOnboarding(false); }}/>
      <div style={{ maxWidth:720, margin:'0 auto', padding:'48px 24px 80px' }}>
        <Eyebrow>Your personalised protocol</Eyebrow>
        <div style={{ fontFamily:fonts.serif, fontSize:32, fontWeight:400, color:T.w7, marginBottom:8, lineHeight:1.2 }}>
          21-Day GCR Elimination Diet
        </div>
        <div style={{ fontFamily:fonts.sans, fontSize:13, color:T.w5, marginBottom:32 }}>
          Built on your immune reactivity, cellular micronutrients, antioxidant status, and genetic architecture.
        </div>
        {dietLoading ? (
          <Panel style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontFamily:fonts.serif, fontSize:18, color:T.w5, marginBottom:20, fontStyle:'italic' }}>
              Building your personalised protocol...
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              {[0,1,2].map(i=><div key={i} style={{ width:8,height:8,borderRadius:'50%',background:T.rg,animation:`pulse 1.2s ${i*0.2}s infinite` }}/>)}
            </div>
            <div style={{ fontFamily:fonts.mono, fontSize:11, color:T.w4, marginTop:20, letterSpacing:'0.12em' }}>
              CROSS-REFERENCING IMMUNITY · MICRONUTRIENTS · REDOX · GENETICS
            </div>
          </Panel>
        ) : (
          <Panel>
            <pre style={{ fontFamily:fonts.sans, fontSize:13, color:T.w6, lineHeight:1.9, whiteSpace:'pre-wrap', margin:0 }}>{dietPlan}</pre>
          </Panel>
        )}
        {!dietLoading && (
          <div style={{ display:'flex', gap:12, marginTop:24 }}>
            <button onClick={()=>{ setShowDiet(false); setTab('monitor'); }} style={{
              background:T.rg, color:'#fff', border:'none', borderRadius:9, padding:'13px 36px',
              fontFamily:fonts.sans, fontSize:14, fontWeight:700, cursor:'pointer',
            }}>
              Enter Dashboard
            </button>
            <button onClick={()=>{
              const el = document.createElement('a');
              el.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dietPlan);
              el.download = 'MeetMario-21Day-Plan.txt';
              el.click();
            }} style={{
              background:'transparent', color:T.rg, border:`1px solid ${T.rg3}`, borderRadius:9, padding:'13px 28px',
              fontFamily:fonts.sans, fontSize:13, fontWeight:600, cursor:'pointer',
            }}>
              Download Plan
            </button>
            <button onClick={()=>generateDiet(patient)} style={{
              background:'transparent', color:T.w5, border:`1px solid ${T.w3}`, borderRadius:9, padding:'13px 28px',
              fontFamily:fonts.sans, fontSize:13, fontWeight:600, cursor:'pointer',
            }}>
              Regenerate with latest data
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── DASHBOARD — Mobile-first OS layout ────────────────────────────────────────
  return (
    <div style={{ height:'100dvh',minHeight:'-webkit-fill-available',background:T.w,color:T.w7,fontFamily:fonts.sans,display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto',overflow:'hidden',position:'relative' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');@keyframes pulse{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}*{box-sizing:border-box}input::placeholder,textarea::placeholder{color:${T.w4};font-style:italic;font-weight:300}::-webkit-scrollbar{width:0;height:0}button:hover{opacity:0.88}a{color:inherit;text-decoration:none}`}</style>
      {popup && <SpikePopup/>}
      {showDoctorPopup && (
        <div style={{ position:'fixed',inset:0,background:'rgba(28,20,16,0.5)',zIndex:2000,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(8px)' }} onClick={()=>setShowDoctorPopup(false)}>
          <div style={{ background:T.w,borderRadius:'20px 20px 0 0',width:'100%',maxWidth:430,boxShadow:'0 -8px 40px rgba(28,20,16,0.22)',overflow:'hidden',paddingBottom:'env(safe-area-inset-bottom,0px)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:36,height:4,borderRadius:2,background:T.w3,margin:'12px auto 0' }}/>
            <div style={{ padding:'20px 24px 0' }}>
              <div style={{ fontFamily:fonts.mono,fontSize:11,letterSpacing:'0.18em',color:T.rg2,textTransform:'uppercase',marginBottom:8 }}>Doctor consultation</div>
              <div style={{ fontFamily:fonts.serif,fontSize:22,color:T.w7,fontWeight:400,lineHeight:1.2,marginBottom:12 }}>Speak with our clinical team</div>
              <div style={{ fontFamily:fonts.sans,fontSize:13,color:T.w5,lineHeight:1.6,marginBottom:8 }}>Our team of physicians at MediBalans can review your case and provide personalised clinical guidance.</div>
            </div>
            <div style={{ margin:'16px 24px',padding:'14px 18px',background:T.rgBg,border:`1px solid ${T.rg}20`,borderRadius:10 }}>
              <div style={{ display:'flex',alignItems:'baseline',gap:8 }}><span style={{ fontFamily:fonts.serif,fontSize:26,color:T.rg2,fontWeight:400 }}>2 500 kr</span><span style={{ fontFamily:fonts.sans,fontSize:12,color:T.w5 }}>/ hour</span></div>
              <div style={{ fontFamily:fonts.sans,fontSize:11.5,color:T.w4,marginTop:4,lineHeight:1.5 }}>Video or phone consultation. Booking confirmation via email.</div>
            </div>
            <div style={{ padding:'0 24px 24px',display:'flex',gap:10 }}>
              <button onClick={()=>setShowDoctorPopup(false)} style={{ flex:1,padding:'13px',borderRadius:12,border:`1px solid ${T.w3}`,background:T.w,cursor:'pointer',fontFamily:fonts.sans,fontSize:13,fontWeight:500,color:T.w5 }}>Cancel</button>
              <button onClick={()=>{ window.location.href='mailto:info@medibalans.se?subject=Doctor%20Consultation%20Request&body=I%20would%20like%20to%20book%20a%20consultation.'; setShowDoctorPopup(false); }} style={{ flex:1,padding:'13px',borderRadius:12,border:'none',background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,cursor:'pointer',fontFamily:fonts.sans,fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.97)' }}>Request booking</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile header */}
      <div style={{ paddingTop:'env(safe-area-inset-top,0px)',background:'rgba(247,244,240,0.96)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderBottom:`1px solid ${T.w2}`,zIndex:100,flexShrink:0 }}>
        <div style={{ height:50,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:`linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,boxShadow:`0 2px 8px rgba(160,100,85,0.40)`,flexShrink:0 }}/>
            <span style={{ fontFamily:fonts.serif,fontSize:17,fontWeight:400,color:T.w7,letterSpacing:'0.01em' }}>meet mario</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            {monActive && (
              <button onClick={()=>setTab('monitor')} style={{ display:'flex',alignItems:'center',gap:5,background:`${T.err}12`,border:`1px solid ${T.err}30`,borderRadius:12,padding:'3px 10px',cursor:'pointer' }}>
                <div style={{ width:5,height:5,borderRadius:'50%',background:T.err,animation:'pulse 1.2s infinite' }}/>
                <span style={{ fontFamily:fonts.mono,fontSize:9,color:T.err,letterSpacing:'0.12em' }}>LIVE</span>
              </button>
            )}
            {patient.dayInProtocol ? <div style={{ fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:'0.14em',textTransform:'uppercase' }}>DAY {patient.dayInProtocol}</div> : null}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:tab==='mario'?'0':'20px 20px 24px' }} onClick={()=>picker&&setPicker(null)}>
        {tabContent()}
      </div>

      {/* Emergency strip — only outside mario tab */}
      {tab !== 'mario' && (
        <div style={{ padding:'6px 20px',background:`${T.err}08`,borderTop:`1px solid ${T.err}15`,display:'flex',justifyContent:'center',flexShrink:0 }}>
          <button onClick={()=>{const nums={US:'911',GB:'999',DE:'112',SE:'112'};window.location.href='tel:'+(nums[country]||'112');}} style={{ display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',fontFamily:fonts.mono,fontSize:10,color:T.err,letterSpacing:'0.1em' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            EMERGENCY · {({US:'911',GB:'999',DE:'112',SE:'112'})[country]||'112'}
          </button>
        </div>
      )}

      {/* Bottom navigation */}
      <div style={{ paddingBottom:'env(safe-area-inset-bottom,0px)',background:'rgba(247,244,240,0.96)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderTop:`1px solid ${T.w2}`,zIndex:100,flexShrink:0 }}>
        <div style={{ height:58,display:'flex',alignItems:'center',justifyContent:'space-around' }}>
          {BOTTOM_TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,background:'none',border:'none',cursor:'pointer',color:tab===t.id?T.rg2:T.w4,transition:'color .15s',WebkitTapHighlightColor:'transparent' }}>
              {t.icon}
              <span style={{ fontFamily:fonts.mono,fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:tab===t.id?600:400 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
