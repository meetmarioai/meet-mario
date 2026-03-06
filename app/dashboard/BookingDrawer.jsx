// ─────────────────────────────────────────────────────────────────────────────
// BookingDrawer.jsx
// MediBalans — Clinical Booking Overlay
// Canonical Balans design system · No iframe · Slides from right
// State owned by MeetMario.jsx, passed in as props
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { saveBooking } from "./saveBooking";

// ─── DESIGN TOKENS (mirror MeetMario.jsx T + fonts) ──────────────────────────
const T = {
  w:    "#F7F4F0",
  w1:   "#F1EDE7",
  w2:   "#E8E2DA",
  w3:   "#D8D0C4",
  w4:   "#B8ACA0",
  w5:   "#8A7E72",
  w6:   "#4A4038",
  w7:   "#1C1510",
  rg:   "#C4887A",
  rg2:  "#9A6255",
  rg3:  "#DEB0A4",
  rgBg: "#F8F0EE",
  ok:   "#6A9060",
};
const fonts = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', 'Arial', sans-serif",
  mono:  "'SF Mono', 'Fira Mono', 'Courier New', monospace",
};

// ─── SERVICE CATALOG ──────────────────────────────────────────────────────────
export const BOKA_SERVICES = [
  { cat:"Diagnostik", sublabel:"Precision Medicine", items:[
    {id:"precisionsbas",    name:"Precisionsbas",      price:22000, dur:90,  tier:"I",   desc:"ALCAT 250 · CMA · Methylation 5-gene · 6 mån Meet Mario AI"},
    {id:"full-methylation", name:"Full Methylation",   price:29000, dur:90,  tier:"II",  desc:"ALCAT 250 · CMA · MethylDetox 38-gene · 6 mån Meet Mario AI", featured:true},
    {id:"comprehensive",    name:"Comprehensive",      price:39000, dur:120, tier:"III", desc:"ALCAT 483 · CMA · MethylDetox · 6 mån Meet Mario AI"},
    {id:"genomic-precision",name:"Genomic Precision",  price:50000, dur:120, tier:"IV",  desc:"ALCAT 483 · CMA · WGS 30× · Pharmacogenomics · 6 mån Meet Mario AI"},
  ]},
  { cat:"Konsultation", sublabel:"Läkarbesök", items:[
    {id:"funk-45",   name:"Funktionsmedicin 45 min",   price:null, dur:45, desc:"Klinisk bedömning med Dr Anthis"},
    {id:"lakar-30",  name:"Läkarbesök 30 min",         price:null, dur:30, desc:"Uppföljning"},
    {id:"lakar-45",  name:"Läkarbesök 45 min",         price:null, dur:45, desc:"Utökad läkarbedömning"},
    {id:"vitalitet", name:"Vitalitetsprogram",         price:null, dur:60, desc:"Provsvargenomgång & protokolljustering"},
  ]},
  { cat:"Behandling", sublabel:"IV · IM · Scanning", items:[
    {id:"myers",   name:"Myers Cocktail IV",           price:null, dur:45, tag:"IV",   desc:"Mg · Ca · B-komplex · C-vitamin"},
    {id:"reset",   name:"Reset Recovery IV",           price:null, dur:60, tag:"IV",   desc:"Återhämtningsinfusion"},
    {id:"b12",     name:"Vitaminshot B12",             price:null, dur:15, tag:"IM",   desc:"Methylcobalamin · IM"},
    {id:"d3",      name:"Vitaminshot D3",              price:null, dur:15, tag:"IM",   desc:"Högdos D3 · IM"},
    {id:"nls",     name:"Kroppsscanning NLS",          price:null, dur:60, tag:"NLS",  desc:"Non-linear diagnostisk scanning"},
    {id:"inbody",  name:"Inbody Kroppsmätning",        price:null, dur:15, tag:"SCAN", desc:"Kroppssammansättning"},
    {id:"ekg-24",  name:"EKG 24h Monitor",             price:null, dur:15, tag:"EKG",  desc:"Holter 24h"},
  ]},
  { cat:"Återbesök", sublabel:"Uppföljning", items:[
    {id:"ater-30", name:"Återbesök 30 min",            price:null, dur:30, desc:"Kort uppföljning"},
    {id:"ater-60", name:"Återbesök 60 min",            price:null, dur:60, desc:"Provsvargenomgång"},
  ]},
];

// ─── ANAMNESIS SCHEMA ─────────────────────────────────────────────────────────
export const BOKA_ANAMNESIS = [
  {id:"chief",    title:"Huvudsakliga besvär", fields:[
    {id:"complaint", label:"Primärt besvär",            type:"textarea", ph:"Beskriv dina huvudsakliga besvär och mål..."},
    {id:"duration",  label:"Besvärens varaktighet",     type:"select",   opts:["< 1 månad","1–6 månader","6–12 månader","1–3 år","> 3 år"]},
    {id:"severity",  label:"Påverkan på vardagen",      type:"scale"},
  ]},
  {id:"meds",     title:"Medicinering & Tillskott", fields:[
    {id:"meds",      label:"Nuvarande läkemedel",       type:"textarea", ph:"Namn · dos · frekvens..."},
    {id:"supps",     label:"Kosttillskott",             type:"textarea", ph:"Vitaminer · mineraler..."},
    {id:"allergies", label:"Kända allergier",           type:"textarea", ph:"Läkemedel · livsmedel · miljö..."},
  ]},
  {id:"history",  title:"Hälsohistoria", fields:[
    {id:"diagnoses", label:"Nuvarande diagnoser",       type:"textarea", ph:"Bekräftade tillstånd..."},
    {id:"family",    label:"Ärftliga sjukdomar",        type:"textarea", ph:"Föräldrar · syskon..."},
    {id:"labs",      label:"Tidigare relevanta prover", type:"textarea", ph:"Blodprover · genetiska tester..."},
  ]},
  {id:"lifestyle",title:"Livsstil & Symptom", fields:[
    {id:"sleep",    label:"Sömnkvalitet",               type:"select", opts:["Utmärkt (7–9h)","God (6–7h)","Varierande","Dålig (< 6h)","Sömnstörning"]},
    {id:"stress",   label:"Stressnivå",                 type:"scale"},
    {id:"exercise", label:"Träningsfrekvens",           type:"select", opts:["Dagligen","3–5 ggr/vecka","1–2 ggr/vecka","Sällan","Aldrig"]},
    {id:"symptoms", label:"Aktuella symptom",           type:"multicheck", opts:[
      "Kronisk trötthet","Hjärndimma","Ledvärk","Muskelvärk",
      "Maghälsa","Uppblåsthet","Huvudvärk","Sömnproblem",
      "Humörsvängningar","Ångest","Depression","Viktproblem",
      "Hormonstörningar","Hudproblem","Håravfall","Autoimmunitet",
      "Hjärtklappning","Yrsel",
    ]},
  ]},
];

// ─── SLOT GENERATOR (exported so MeetMario can call once via useState) ────────
export const genBokaSlots = () => {
  const slots = {}, today = new Date();
  for(let d=1; d<=45; d++){
    const dt = new Date(today);
    dt.setDate(today.getDate() + d);
    if([0,6].includes(dt.getDay())) continue;
    const key = dt.toISOString().split("T")[0];
    const times = ["08:30","09:00","09:30","10:00","10:30","11:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];
    slots[key] = times.filter(() => Math.random() > 0.5);
  }
  return slots;
};

// ─── CANONICAL BALANS GLYPHS ──────────────────────────────────────────────────
// ◉ Constrained Cell
const GCell = ({ sz=16, clr=T.rg2 }) => (
  <svg width={sz} height={sz} viewBox="0 0 140 140" fill="none">
    <circle cx="70" cy="70" r="54" stroke={clr} strokeWidth="3" fill="none"/>
    <circle cx="70" cy="70" r="32" stroke={clr} strokeWidth="2" fill="none"/>
    <circle cx="70" cy="70" r="9" fill={T.rg}/>
    <line x1="70" y1="14" x2="70" y2="24" stroke={clr} strokeWidth="2.5"/>
    <line x1="70" y1="116" x2="70" y2="126" stroke={clr} strokeWidth="2.5"/>
    <line x1="14" y1="70" x2="24" y2="70" stroke={clr} strokeWidth="2.5"/>
    <line x1="116" y1="70" x2="126" y2="70" stroke={clr} strokeWidth="2.5"/>
  </svg>
);

// ◐ Methylation State
const GHalf = ({ sz=16, clr=T.rg2 }) => (
  <svg width={sz} height={sz} viewBox="0 0 140 140" fill="none">
    <circle cx="70" cy="70" r="54" stroke={clr} strokeWidth="3" fill="none"/>
    <path d="M70 16 A54 54 0 0 0 70 124 L70 70 Z" fill={clr} opacity="0.15"/>
    <path d="M70 16 A54 54 0 0 0 70 124" stroke={clr} strokeWidth="3" fill="none"/>
    <line x1="70" y1="16" x2="70" y2="124" stroke={clr} strokeWidth="2"/>
    <circle cx="70" cy="70" r="5.5" fill={clr}/>
    <line x1="70" y1="14" x2="70" y2="24" stroke={clr} strokeWidth="2.5"/>
    <line x1="70" y1="116" x2="70" y2="126" stroke={clr} strokeWidth="2.5"/>
    <line x1="14" y1="70" x2="24" y2="70" stroke={clr} strokeWidth="2.5"/>
    <line x1="116" y1="70" x2="126" y2="70" stroke={clr} strokeWidth="2.5"/>
  </svg>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BookingDrawer({
  // open/close
  open, onClose,
  // slot data
  slots,
  // step
  step, setStep,
  // service
  svc, setSvc,
  // calendar
  date, setDate,
  time, setTime,
  month, setMonth,
  year,  setYear,
  // anamnesis
  anamnesis, setAnamnesis,
  anamIdx, setAnamIdx,
  // patient details
  details, setDetails,
  // completion
  done, setDone,
  // category filter
  cat, setCat,
}) {
  if(!open) return null;

  // ── Local save state ──
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleConfirm = async () => {
    setSaving(true);
    setSaveError(null);
    const result = await saveBooking({
      svc,
      date,
      time,
      details,
      anamnesis,
    });
    setSaving(false);
    if(result.error) {
      setSaveError(result.error);
    } else {
      setDone(true);
    }
  };

  // ── Shared input style ──
  const ibase = {
    width:"100%", padding:"10px 12px",
    border:`1px solid ${T.w3}`, background:T.w1,
    fontSize:13, color:T.w7, fontFamily:fonts.sans,
    fontWeight:300, outline:"none",
    boxSizing:"border-box", lineHeight:1.6,
  };

  // ── Calendar helpers ──
  const today      = new Date();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const adj         = firstDay===0 ? 6 : firstDay-1;
  const MONTHS      = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
  const DAYS        = ["M","T","O","T","F","L","S"];
  const timeSlots   = date ? (slots[date]||[]) : [];

  // ── Validation ──
  const canNext = () => {
    if(step===0) return !!svc;
    if(step===1) return !!date && !!time;
    if(step===3) return details.name && details.email && details.consent;
    return true;
  };

  // ── Category glyph ──
  const catGlyph = (c) =>
    c==="Konsultation" || c==="Återbesök"
      ? <GHalf sz={13}/>
      : <GCell sz={13}/>;

  // ── Reset ──
  const reset = () => {
    setStep(0); setSvc(null); setDate(null); setTime(null);
    setAnamnesis({}); setAnamIdx(0);
    setDetails({name:"",email:"",phone:"",personnummer:"",consent:false});
    setDone(false); setCat(null);
    setMonth(new Date().getMonth());
    setYear(new Date().getFullYear());
  };

  const STEPS = ["Tjänst","Tid","Anamnes","Uppgifter","Bekräfta"];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{position:"fixed",inset:0,background:"rgba(28,21,16,0.55)",zIndex:500,backdropFilter:"blur(4px)"}}
      />

      {/* Drawer */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:"min(680px,100vw)", background:T.w, zIndex:501,
        display:"flex", flexDirection:"column",
        boxShadow:"-24px 0 80px rgba(28,21,16,0.18)", overflow:"hidden",
      }}>

        {/* ── HEADER ── */}
        <div style={{borderBottom:`1px solid ${T.w3}`,padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <GCell sz={18}/>
            <div>
              <div style={{fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.22em",color:T.w4,marginBottom:2}}>
                MEDIBALANS · BOKA KONSULTATION
              </div>
              <div style={{fontFamily:fonts.serif,fontSize:18,fontWeight:400,color:T.w7}}>
                {done
                  ? <em style={{fontStyle:"italic",color:T.rg2}}>Bokad.</em>
                  : STEPS[step]
                }
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{background:"none",border:`1px solid ${T.w3}`,width:32,height:32,cursor:"pointer",color:T.w4,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}
          >×</button>
        </div>

        {/* ── STEP INDICATOR ── */}
        {!done && (
          <div style={{padding:"14px 28px 0",flexShrink:0,borderBottom:`1px solid ${T.w3}`,display:"flex",gap:0}}>
            {STEPS.map((s,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:0}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,paddingBottom:12}}>
                  <div style={{
                    width:20,height:20,borderRadius:"50%",
                    border:`1px solid ${i<step?T.ok:i===step?T.rg:T.w3}`,
                    background:i<step?T.ok:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    transition:"all 0.3s",
                  }}>
                    {i<step
                      ? <span style={{color:"#fff",fontSize:9}}>✓</span>
                      : <span style={{fontFamily:fonts.mono,fontSize:8,color:i===step?T.rg:T.w4}}>{i+1}</span>
                    }
                  </div>
                  <span style={{fontFamily:fonts.mono,fontSize:7,letterSpacing:"0.16em",color:i===step?T.rg:T.w4,textTransform:"uppercase",whiteSpace:"nowrap"}}>
                    {s}
                  </span>
                </div>
                {i<STEPS.length-1 && (
                  <div style={{flex:1,height:1,background:i<step?T.ok:T.w3,margin:"0 6px 12px",transition:"background 0.3s"}}/>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>

          {/* CONFIRMATION SCREEN */}
          {done && (
            <div style={{textAlign:"center",padding:"32px 0"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
                <GCell sz={64}/>
              </div>
              <div style={{fontFamily:fonts.mono,fontSize:8,letterSpacing:"0.24em",color:T.rg2,marginBottom:10}}>
                BOKNINGSSEKVENS INITIERAD
              </div>
              <h2 style={{fontFamily:fonts.serif,fontSize:36,fontWeight:400,color:T.w7,letterSpacing:"-0.02em",lineHeight:1.1,marginBottom:16}}>
                Din tid är<br/><em style={{fontStyle:"italic",color:T.rg2}}>bekräftad.</em>
              </h2>
              <p style={{fontFamily:fonts.sans,fontSize:13,fontWeight:300,color:T.w5,marginBottom:28,lineHeight:1.7}}>
                Bekräftelse skickas till{" "}
                <strong style={{fontWeight:400,color:T.w6}}>{details.email}</strong>
              </p>
              <div style={{border:`1px solid ${T.w3}`,background:T.w1,padding:"20px 24px",textAlign:"left",marginBottom:24}}>
                <div style={{fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.18em",color:T.w4,marginBottom:10}}>
                  BOKNINGSSAMMANFATTNING
                </div>
                <div style={{fontFamily:fonts.serif,fontSize:20,fontWeight:400,color:T.rg2,marginBottom:4}}>
                  {svc?.name}
                </div>
                <div style={{fontFamily:fonts.mono,fontSize:9,color:T.w4,letterSpacing:"0.08em"}}>
                  {date && new Date(date+"T12:00:00").toLocaleDateString("sv-SE",{weekday:"long",day:"numeric",month:"long"}).toUpperCase()} · {time}
                </div>
                <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,marginTop:4}}>
                  BETALNING VID KLINIKBESÖKET
                </div>
              </div>
              <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,lineHeight:2.2,letterSpacing:"0.10em"}}>
                KARLAVÄGEN 89 · 115 22 STOCKHOLM<br/>
                08-530 210 20 · MÅN–FRE 08:00–17:00
              </div>
              <div style={{marginTop:24,display:"flex",justifyContent:"center",gap:10}}>
                <button onClick={reset}
                  style={{background:"none",border:`1px solid ${T.w3}`,padding:"8px 20px",cursor:"pointer",fontFamily:fonts.mono,fontSize:8,letterSpacing:"0.14em",color:T.w4}}>
                  NY BOKNING
                </button>
                <button onClick={onClose}
                  style={{background:"none",border:`1px solid ${T.w3}`,padding:"8px 20px",cursor:"pointer",fontFamily:fonts.mono,fontSize:8,letterSpacing:"0.14em",color:T.w4}}>
                  STÄNG
                </button>
              </div>
            </div>
          )}

          {/* STEP 0 — Service Selection */}
          {!done && step===0 && (
            <div>
              {/* Category filter */}
              <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.w3}`,marginBottom:20,overflowX:"auto"}}>
                <button onClick={()=>setCat(null)}
                  style={{background:"none",border:"none",borderBottom:`2px solid ${!cat?T.rg:"transparent"}`,padding:"8px 14px",fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.16em",color:!cat?T.rg2:T.w4,cursor:"pointer",textTransform:"uppercase",whiteSpace:"nowrap"}}>
                  Alla
                </button>
                {BOKA_SERVICES.map(c => (
                  <button key={c.cat} onClick={()=>setCat(cat===c.cat?null:c.cat)}
                    style={{background:"none",border:"none",borderBottom:`2px solid ${cat===c.cat?T.rg:"transparent"}`,padding:"8px 14px",fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.16em",color:cat===c.cat?T.rg2:T.w4,cursor:"pointer",textTransform:"uppercase",whiteSpace:"nowrap"}}>
                    {c.cat}
                  </button>
                ))}
              </div>

              {/* Service rows */}
              {BOKA_SERVICES.filter(c => !cat || c.cat===cat).map(category => (
                <div key={category.cat} style={{marginBottom:24}}>
                  {/* Category header */}
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    {catGlyph(category.cat)}
                    <span style={{fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.18em",color:T.w4,textTransform:"uppercase"}}>{category.cat}</span>
                    <div style={{flex:1,height:1,background:T.w3}}/>
                    <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,opacity:0.6}}>{category.sublabel}</span>
                  </div>

                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    {category.items.map(item => {
                      const sel = svc?.id===item.id;
                      return (
                        <div key={item.id} onClick={()=>setSvc(sel?null:item)}
                          style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",border:`1px solid ${sel?T.rg:T.w3}`,background:sel?T.rgBg:"transparent",cursor:"pointer",transition:"all 0.15s"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            {/* Radio */}
                            <div style={{width:13,height:13,borderRadius:"50%",border:`1px solid ${sel?T.rg:T.w3}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              {sel && <div style={{width:5,height:5,borderRadius:"50%",background:T.rg}}/>}
                            </div>
                            <div>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}>
                                <span style={{fontSize:13,fontFamily:fonts.sans,fontWeight:sel?400:300,color:sel?T.rg2:T.w7}}>{item.name}</span>
                                {item.tag && (
                                  <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.rg2,border:`1px solid ${T.rg}40`,padding:"1px 6px",background:T.rgBg,letterSpacing:"0.12em"}}>
                                    {item.tag}
                                  </span>
                                )}
                                {item.featured && (
                                  <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.rg2,letterSpacing:"0.10em",border:`1px solid ${T.rg}30`,padding:"1px 6px",background:T.rgBg}}>
                                    REKOMMENDERAS
                                  </span>
                                )}
                                {item.tier && (
                                  <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,letterSpacing:"0.10em"}}>
                                    TIER {item.tier}
                                  </span>
                                )}
                              </div>
                              <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,letterSpacing:"0.04em"}}>{item.desc}</div>
                            </div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                            <div style={{fontFamily:fonts.mono,fontSize:12,color:sel?T.rg:T.w5,letterSpacing:"0.02em"}}>
                              {item.price ? `${item.price.toLocaleString("sv-SE")} kr` : "—"}
                            </div>
                            <div style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,marginTop:1}}>{item.dur} MIN</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 1 — Calendar + Time */}
          {!done && step===1 && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {/* Calendar */}
              <div style={{border:`1px solid ${T.w3}`,padding:"18px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <button
                    onClick={()=>month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1)}
                    style={{background:"none",border:`1px solid ${T.w3}`,width:24,height:24,cursor:"pointer",color:T.w4,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    ‹
                  </button>
                  <span style={{fontFamily:fonts.mono,fontSize:8,letterSpacing:"0.18em",color:T.w5,textTransform:"uppercase"}}>
                    {MONTHS[month]} {year}
                  </span>
                  <button
                    onClick={()=>month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1)}
                    style={{background:"none",border:`1px solid ${T.w3}`,width:24,height:24,cursor:"pointer",color:T.w4,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    ›
                  </button>
                </div>

                {/* Day headers */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:6}}>
                  {DAYS.map((d,i) => (
                    <div key={i} style={{textAlign:"center",fontFamily:fonts.mono,fontSize:7.5,color:T.w4,padding:"2px 0"}}>{d}</div>
                  ))}
                </div>

                {/* Day grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
                  {Array.from({length:adj}).map((_,i) => <div key={`e${i}`}/>)}
                  {Array.from({length:daysInMonth}).map((_,i) => {
                    const day  = i+1;
                    const dt   = new Date(year, month, day);
                    const key  = dt.toISOString().split("T")[0];
                    const isWe = [0,6].includes(dt.getDay());
                    const isPast = dt <= today;
                    const has  = slots[key]?.length > 0;
                    const isSel = date===key;
                    const avail = !isWe && !isPast && has;
                    return (
                      <div key={day}
                        onClick={() => avail && (setDate(key), setTime(null))}
                        style={{
                          textAlign:"center", padding:"6px 1px",
                          fontFamily:fonts.mono, fontSize:10,
                          cursor:avail?"pointer":"default",
                          background:isSel?T.rg:"transparent",
                          color:isSel?"#fff":avail?T.w7:T.w4,
                          transition:"all 0.15s", position:"relative",
                        }}>
                        {day}
                        {has && !isSel && !isPast && !isWe && (
                          <div style={{position:"absolute",bottom:1,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:T.rg,opacity:0.5}}/>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              <div style={{border:`1px solid ${T.w3}`,padding:"18px 16px"}}>
                <div style={{fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.18em",color:T.w4,marginBottom:14,textTransform:"uppercase"}}>
                  {date
                    ? new Date(date+"T12:00:00").toLocaleDateString("sv-SE",{weekday:"long",day:"numeric",month:"long"})
                    : "Välj datum"}
                </div>
                {!date ? (
                  <p style={{fontFamily:fonts.mono,fontSize:9,color:T.w4,lineHeight:1.9}}>← Välj ett datum</p>
                ) : timeSlots.length===0 ? (
                  <p style={{fontFamily:fonts.mono,fontSize:9,color:T.w4}}>Inga lediga tider</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:300,overflowY:"auto"}}>
                    {timeSlots.map(t => {
                      const sel = time===t;
                      return (
                        <div key={t} onClick={()=>setTime(t)}
                          style={{padding:"9px 12px",border:`1px solid ${sel?T.rg:T.w3}`,background:sel?T.rgBg:"transparent",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.15s"}}>
                          <span style={{fontFamily:fonts.mono,fontSize:13,color:sel?T.rg:T.w7,letterSpacing:"0.04em"}}>{t}</span>
                          <span style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,letterSpacing:"0.10em"}}>{svc?.dur} MIN</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Anamnesis */}
          {!done && step===2 && (
            <div style={{border:`1px solid ${T.w3}`}}>
              {/* Section tabs */}
              <div style={{borderBottom:`1px solid ${T.w3}`,display:"flex",gap:0,overflowX:"auto"}}>
                {BOKA_ANAMNESIS.map((s,i) => (
                  <button key={i} onClick={()=>setAnamIdx(i)}
                    style={{background:"none",border:"none",borderBottom:`2px solid ${i===anamIdx?T.rg:"transparent"}`,padding:"10px 14px",fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.14em",color:i===anamIdx?T.rg:i<anamIdx?T.ok:T.w4,cursor:"pointer",textTransform:"uppercase",whiteSpace:"nowrap"}}>
                    {i<anamIdx ? "✓ " : ""}{s.title}
                  </button>
                ))}
              </div>

              <div style={{padding:24}}>
                <div style={{fontFamily:fonts.serif,fontSize:22,fontWeight:400,color:T.w7,marginBottom:22,letterSpacing:"-0.01em"}}>
                  {BOKA_ANAMNESIS[anamIdx].title}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {BOKA_ANAMNESIS[anamIdx].fields.map(f => (
                    <div key={f.id}>
                      <div style={{fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.20em",color:T.w4,marginBottom:7,textTransform:"uppercase"}}>
                        {f.label}
                      </div>
                      {f.type==="textarea" && (
                        <textarea
                          value={anamnesis[f.id]||""} rows={3} placeholder={f.ph}
                          onChange={e=>setAnamnesis(d=>({...d,[f.id]:e.target.value}))}
                          style={{...ibase,resize:"vertical"}}/>
                      )}
                      {f.type==="select" && (
                        <select
                          value={anamnesis[f.id]||""}
                          onChange={e=>setAnamnesis(d=>({...d,[f.id]:e.target.value}))}
                          style={{...ibase,cursor:"pointer"}}>
                          <option value="">Välj...</option>
                          {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )}
                      {f.type==="scale" && (
                        <div>
                          <input type="range" min={1} max={10}
                            value={anamnesis[f.id]||5}
                            onChange={e=>setAnamnesis(d=>({...d,[f.id]:e.target.value}))}
                            style={{width:"100%",accentColor:T.rg}}/>
                          <div style={{display:"flex",justifyContent:"space-between",fontFamily:fonts.mono,fontSize:7.5,color:T.w4,marginTop:3}}>
                            <span>MINIMAL</span>
                            <span style={{color:T.rg}}>{anamnesis[f.id]||5}/10</span>
                            <span>EXTREM</span>
                          </div>
                        </div>
                      )}
                      {f.type==="multicheck" && (
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                          {f.opts.map(opt => {
                            const chk = (anamnesis[f.id]||[]).includes(opt);
                            return (
                              <div key={opt}
                                onClick={()=>{
                                  const c = anamnesis[f.id]||[];
                                  setAnamnesis(d=>({...d,[f.id]:chk?c.filter(x=>x!==opt):[...c,opt]}));
                                }}
                                style={{padding:"7px 10px",border:`1px solid ${chk?T.rg:T.w3}`,background:chk?T.rgBg:"transparent",cursor:"pointer",fontSize:11,fontFamily:fonts.sans,fontWeight:300,color:chk?T.rg2:T.w6,display:"flex",alignItems:"center",gap:7,transition:"all 0.12s"}}>
                                <div style={{width:11,height:11,border:`1px solid ${chk?T.rg:T.w3}`,background:chk?T.rg:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                  {chk && <span style={{color:"#fff",fontSize:8}}>✓</span>}
                                </div>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {anamIdx < BOKA_ANAMNESIS.length-1 && (
                  <button onClick={()=>setAnamIdx(i=>i+1)}
                    style={{marginTop:20,padding:"8px 18px",border:`1px solid ${T.rg}`,background:T.rgBg,color:T.rg2,fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer"}}>
                    Nästa sektion →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — Patient Details */}
          {!done && step===3 && (
            <div style={{border:`1px solid ${T.w3}`,padding:24}}>
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                {[
                  {id:"name",         label:"Fullständigt namn *",  ph:"För- och efternamn"},
                  {id:"email",        label:"E-postadress *",       ph:"din@email.com"},
                  {id:"phone",        label:"Telefonnummer",        ph:"+46 70 XXX XX XX"},
                  {id:"personnummer", label:"Personnummer",         ph:"YYYYMMDD-XXXX"},
                ].map(f => (
                  <div key={f.id}>
                    <div style={{fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.20em",color:T.w4,marginBottom:7,textTransform:"uppercase"}}>
                      {f.label}
                    </div>
                    <input
                      value={details[f.id]}
                      onChange={e=>setDetails(d=>({...d,[f.id]:e.target.value}))}
                      placeholder={f.ph}
                      style={{...ibase}}/>
                  </div>
                ))}

                {/* GDPR consent */}
                <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"14px 16px",border:`1px solid ${T.w3}`,background:T.w1}}>
                  <input
                    type="checkbox" id="boka-consent"
                    checked={details.consent}
                    onChange={e=>setDetails(d=>({...d,consent:e.target.checked}))}
                    style={{width:15,height:15,marginTop:2,accentColor:T.rg,cursor:"pointer",flexShrink:0}}/>
                  <label htmlFor="boka-consent"
                    style={{fontFamily:fonts.sans,fontSize:12,fontWeight:300,color:T.w5,lineHeight:1.7,cursor:"pointer"}}>
                    Jag samtycker till att MediBalans AB behandlar mina personuppgifter och hälsodata i enlighet med{" "}
                    <span style={{color:T.rg2,textDecoration:"underline"}}>integritetspolicyn</span>{" "}
                    (GDPR art. 9). Betalning sker vid klinikbesöket. *
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Confirm */}
          {!done && step===4 && (
            <div style={{border:`1px solid ${T.w3}`}}>
              {[
                {label:"Protokoll",   val:svc?.name,    sub:svc?.desc},
                {label:"Tid",         val:date ? `${new Date(date+"T12:00:00").toLocaleDateString("sv-SE",{weekday:"long",day:"numeric",month:"long"})} · kl. ${time}` : ""},
                {label:"Varaktighet", val:`${svc?.dur} minuter`},
                {label:"Investering", val:svc?.price ? `${svc.price.toLocaleString("sv-SE")} SEK` : "På förfrågan", sub:"Betalas vid klinikbesöket"},
                {label:"Patient",     val:details.name, sub:details.email},
              ].filter(r => r.val).map((row,i,arr) => (
                <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"14px 20px",borderBottom:i<arr.length-1?`1px solid ${T.w3}`:"none"}}>
                  <span style={{fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.18em",color:T.w4,textTransform:"uppercase",paddingTop:2}}>
                    {row.label}
                  </span>
                  <div style={{textAlign:"right",maxWidth:"62%"}}>
                    <div style={{fontSize:13,fontFamily:fonts.sans,fontWeight:300,color:T.w7}}>{row.val}</div>
                    {row.sub && <div style={{fontFamily:fonts.mono,fontSize:8,color:T.w4,marginTop:2}}>{row.sub}</div>}
                  </div>
                </div>
              ))}
              <div style={{padding:"14px 20px",background:T.w1,borderTop:`1px solid ${T.w3}`}}>
                <div style={{fontFamily:fonts.mono,fontSize:7.5,color:T.w4,letterSpacing:"0.10em",lineHeight:2.2}}>
                  KARLAVÄGEN 89 · 115 22 STOCKHOLM · ANLÄND 10 MIN I FÖRVÄG
                </div>
              </div>
            </div>
          )}

        </div>{/* end scrollable */}

        {/* ── FOOTER / NAV ── */}
        {!done && (
          <div style={{borderTop:`1px solid ${T.w3}`,padding:"14px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:T.w1}}>
            {step > 0
              ? <button onClick={()=>setStep(s=>s-1)}
                  style={{background:"none",border:`1px solid ${T.w3}`,padding:"8px 18px",cursor:"pointer",fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.16em",textTransform:"uppercase",color:T.w4}}>
                  ← Tillbaka
                </button>
              : <div/>
            }
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.12em",color:T.rg2,border:`1px solid ${T.rg}20`,padding:"2px 8px",background:T.rgBg}}>
                PATENT PENDING · SE 2615203-3
              </span>
              {step < 4
                ? <button
                    onClick={()=>canNext() && setStep(s=>s+1)}
                    style={{padding:"9px 24px",border:`1px solid ${canNext()?T.rg:T.w3}`,background:canNext()?T.rgBg:"transparent",color:canNext()?T.rg2:T.w4,fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.16em",textTransform:"uppercase",cursor:canNext()?"pointer":"default",transition:"all 0.2s"}}>
                    {["Välj tid →","Anamnes →","Uppgifter →","Granska →"][step]}
                  </button>
                : <button
                    onClick={handleConfirm}
                    disabled={saving}
                    style={{padding:"9px 24px",border:"1px solid rgba(74,124,89,0.4)",background:"rgba(74,124,89,0.07)",color:T.ok,fontFamily:fonts.mono,fontSize:7.5,letterSpacing:"0.16em",textTransform:"uppercase",cursor:saving?"wait":"pointer",opacity:saving?0.6:1}}>
                    {saving ? "Sparar…" : "Bekräfta bokning ✓"}
                  </button>
              }
            </div>
          </div>
          {saveError && (
            <div style={{padding:"10px 28px",background:"#FFF0EE",borderTop:"1px solid #E8C0B8",fontFamily:fonts.mono,fontSize:8,color:"#B85040",letterSpacing:"0.10em"}}>
              FEL: {saveError} — försök igen eller ring 08-530 210 20
            </div>
          )}
        )}

      </div>{/* end drawer */}
    </>
  );
}
