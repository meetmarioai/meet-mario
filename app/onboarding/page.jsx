'use client'
// app/onboarding/page.jsx — Meet Mario Onboarding v3
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const T = {
  bg: '#FAF7F2', w: '#FFFFFF', w1: '#F1EDE7', w3: '#D8D0C4', w4: '#B8ACA0',
  w5: '#8A7E72', w6: '#4A4038', w7: '#1C1510',
  rg: '#C4887A', rg2: '#9A6255', rg3: '#DEB0A4', rgBg: '#F8F0EE',
  ok: '#6A9060', warn: '#B88040', err: '#B85040',
}
const serif = "'Playfair Display',Georgia,serif"
const sans = "-apple-system,'Helvetica Neue',Arial,sans-serif"
const mono = "'SF Mono','Fira Mono','Courier New',monospace"

const SYMPTOMS = [
  {cat:"Gut",items:["Bloating","IBS / loose stools","Constipation","Acid reflux","Nausea","Abdominal pain"]},
  {cat:"Energy",items:["Chronic fatigue","Brain fog","Poor sleep","Morning exhaustion","Post-meal crash"]},
  {cat:"Skin",items:["Eczema","Psoriasis","Acne","Hives / urticaria","Rosacea","Dry skin"]},
  {cat:"Immune",items:["Frequent infections","Autoimmune condition","Allergies","Sinusitis"]},
  {cat:"Metabolic",items:["Weight gain","Insulin resistance / diabetes","High blood pressure","High cholesterol","Thyroid condition"]},
  {cat:"Neurological",items:["Headaches / migraines","Anxiety","Depression","ADHD","Mood swings","Memory issues"]},
  {cat:"Joints",items:["Joint pain","Muscle aches","Fibromyalgia","Stiffness on waking"]},
  {cat:"Hormonal",items:["PMS / cycle irregularity","Menopausal symptoms","Low libido","Hair loss","Infertility"]},
]

const TESTS = [
  {id:"alcat",label:"ALCAT Food Sensitivity"},
  {id:"cma",label:"CMA (Comprehensive Metabolic Array)"},
  {id:"methyldetox",label:"MethylDetox (39-gene panel)"},
  {id:"gimap",label:"GI-MAP (stool microbiome)"},
  {id:"dutch",label:"DUTCH (hormone panel)"},
  {id:"werlabs",label:"Werlabs / standard blood"},
  {id:"wgs",label:"Whole Genome Sequencing (WGS)"},
  {id:"rna",label:"RNA Transcriptomics"},
  {id:"proteomics",label:"Proteomics"},
]

const GOALS = [
  "Gut healing","Energy restoration","Weight management","Hormonal balance",
  "Skin clarity","Brain clarity / focus","Inflammation reduction","Longevity / biological age reversal",
  "Autoimmune management","Cardiovascular health","Mental health","Athletic performance",
]

export default function OnboardingPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '', email: '', dob: '', sex: '', hormonalStatus: '',
    geographyOfOrigin: '', yearsInCurrentCountry: '',
    symptoms: [], symptomDuration: '', familyHistory: '',
    tests: [], otherTests: '',
    goals: [],
    substanceUse: [],
    medications: [], supplements: '',
    notes: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const toggle = (field, val) => setData(d => ({
    ...d,
    [field]: d[field].includes(val) ? d[field].filter(x => x !== val) : [...d[field], val]
  }))

  const steps = [
    // Step 0 — Identity
    <div key="identity">
      <Step title="Who are you?" sub="Basic clinical profile">
        <Field label="Full name">
          <input style={inp} value={data.name} onChange={e=>setData(d=>({...d,name:e.target.value}))} placeholder="Your name" />
        </Field>
        <Field label="Date of birth">
          <input style={inp} type="date" value={data.dob} onChange={e=>setData(d=>({...d,dob:e.target.value}))} />
        </Field>
        <Field label="Biological sex">
          <ChipRow items={["Female","Male","Other"]} selected={data.sex} onSelect={v=>setData(d=>({...d,sex:v}))} single />
        </Field>
        <Field label="Hormonal status" hide={data.sex==="Male"}>
          <ChipRow items={["Pre-menopausal","Peri-menopausal","Post-menopausal","On HRT","On contraceptive pill"]} selected={data.hormonalStatus} onSelect={v=>setData(d=>({...d,hormonalStatus:v}))} single />
        </Field>
        <Field label="Country of ancestral origin (where your family is from)">
          <input style={inp} value={data.geographyOfOrigin} onChange={e=>setData(d=>({...d,geographyOfOrigin:e.target.value}))} placeholder="e.g. Sweden, Turkey, India, Ethiopia…" />
        </Field>
        {data.geographyOfOrigin && data.geographyOfOrigin.toLowerCase() !== 'sweden' && (
          <Field label="Years living in current country">
            <input style={{...inp,maxWidth:120}} type="number" value={data.yearsInCurrentCountry} onChange={e=>setData(d=>({...d,yearsInCurrentCountry:e.target.value}))} placeholder="Years" />
          </Field>
        )}
      </Step>
    </div>,

    // Step 1 — Symptoms
    <div key="symptoms">
      <Step title="What brings you here?" sub="Select all that apply — be thorough">
        {SYMPTOMS.map(({cat,items})=>(
          <Field key={cat} label={cat}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {items.map(item=>{
                const sel = data.symptoms.includes(item)
                return <Chip key={item} label={item} active={sel} onClick={()=>toggle('symptoms',item)} />
              })}
            </div>
          </Field>
        ))}
        <Field label="How long have you had these symptoms?">
          <ChipRow items={["Under 1 year","1–3 years","3–5 years","5–10 years","Over 10 years"]} selected={data.symptomDuration} onSelect={v=>setData(d=>({...d,symptomDuration:v}))} single />
        </Field>
        <Field label="Family history of chronic disease">
          <input style={inp} value={data.familyHistory} onChange={e=>setData(d=>({...d,familyHistory:e.target.value}))} placeholder="e.g. mother — autoimmune, father — type 2 diabetes" />
        </Field>
      </Step>
    </div>,

    // Step 2 — Tests done
    <div key="tests">
      <Step title="Prior testing" sub="Which tests have you had?">
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
          {TESTS.map(t=>{
            const sel = data.tests.includes(t.id)
            return (
              <button key={t.id} onClick={()=>toggle('tests',t.id)} style={{
                background:sel?T.rgBg:T.w1, border:`1px solid ${sel?T.rg:T.w3}`,
                color:sel?T.rg2:T.w5, borderRadius:8, padding:"8px 14px",
                fontSize:12, cursor:"pointer", fontFamily:sans,
              }}>{t.label}</button>
            )
          })}
        </div>
        <Field label="Other tests not listed">
          <input style={inp} value={data.otherTests} onChange={e=>setData(d=>({...d,otherTests:e.target.value}))} placeholder="Any other tests, panels, or labs…" />
        </Field>
      </Step>
    </div>,

    // Step 3 — Goals
    <div key="goals">
      <Step title="What do you want to achieve?" sub="Select your primary goals">
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {GOALS.map(g=>{
            const sel = data.goals.includes(g)
            return <Chip key={g} label={g} active={sel} onClick={()=>toggle('goals',g)} />
          })}
        </div>
      </Step>
    </div>,

    // Step 4 — Medications & lifestyle
    <div key="meds">
      <Step title="Current medications & lifestyle" sub="This helps Mario personalise your protocol">
        <Field label="Current medications (type or select)">
          <input style={inp} value={data.medications.join(', ')} onChange={e=>setData(d=>({...d,medications:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} placeholder="e.g. Levothyroxine, Metformin, estradiol patch…" />
        </Field>
        <Field label="Current supplements">
          <input style={inp} value={data.supplements} onChange={e=>setData(d=>({...d,supplements:e.target.value}))} placeholder="e.g. Vitamin D, magnesium, omega-3…" />
        </Field>
        <Field label="Substance use (optional — helps calibrate protocol)">
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {["Alcohol (regular)","Alcohol (occasional)","Smoking","Cannabis","Recreational drugs"].map(s=>{
              const sel = data.substanceUse.includes(s)
              return <Chip key={s} label={s} active={sel} onClick={()=>toggle('substanceUse',s)} />
            })}
          </div>
        </Field>
        <Field label="Anything else Mario should know">
          <textarea style={{...inp,height:80,resize:"vertical"}} value={data.notes} onChange={e=>setData(d=>({...d,notes:e.target.value}))} placeholder="Additional context, recent events, specific concerns…" />
        </Field>
      </Step>
    </div>,
  ]

  async function handleSubmit() {
    setLoading(true); setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: data.name,
          email: data.email || user.email,
          dob: data.dob || null,
          sex: data.sex,
          hormonal_status: data.hormonalStatus,
          geography_of_origin: data.geographyOfOrigin,
          years_in_current_country: data.yearsInCurrentCountry ? parseInt(data.yearsInCurrentCountry) : null,
          symptoms: data.symptoms,
          symptom_duration: data.symptomDuration,
          family_history: data.familyHistory,
          tests_done: [...data.tests, ...(data.otherTests ? [data.otherTests] : [])],
          goals: data.goals,
          medications: data.medications,
          supplements: data.supplements,
          substance_use: data.substanceUse,
          notes: data.notes,
        })
      }
      // Get AI analysis
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          age: data.dob ? Math.floor((Date.now()-new Date(data.dob).getTime())/(365.25*86400000)) : null,
          symptoms: data.symptoms,
          lifestyle: {
            antibiotic: data.tests.includes('antibiotic') || data.medications.some(m=>m.toLowerCase().includes('antibiotic')),
            stress: data.symptoms.includes('Anxiety') || data.symptoms.includes('Brain fog'),
            processedFood: 3,
            alcohol: data.substanceUse.some(s=>s.includes('Alcohol')),
          }
        })
      })
      const analysis = await res.json()
      setResult(analysis)
      setStep(steps.length)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:sans}}>
      {/* Nav */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(250,247,242,0.92)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.w3}`,padding:"0 40px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:serif,fontSize:18,color:T.w7}}>◉ meet mario</div>
        {step < steps.length && (
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {steps.map((_,i)=>(
              <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i<step?T.rg:i===step?T.rg:T.w3,transition:"all .3s"}}/>
            ))}
          </div>
        )}
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"48px 24px 80px"}}>

        {step < steps.length ? (
          <>
            {steps[step]}
            <div style={{display:"flex",gap:12,marginTop:32}}>
              {step > 0 && (
                <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"14px",borderRadius:10,border:`1px solid ${T.w3}`,background:T.w1,color:T.w5,fontSize:13,cursor:"pointer",fontFamily:sans}}>
                  Back
                </button>
              )}
              <button onClick={step===steps.length-1?handleSubmit:()=>setStep(s=>s+1)} disabled={loading} style={{flex:2,padding:"14px",borderRadius:10,border:"none",background:T.rg,color:"#fff",fontSize:13,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:sans,opacity:loading?0.7:1}}>
                {loading?"Analysing…":step===steps.length-1?"Complete assessment →":"Continue →"}
              </button>
            </div>
            {error && <div style={{marginTop:16,color:T.err,fontSize:13}}>{error}</div>}
            <div style={{textAlign:"center",marginTop:20}}>
              <a href="/dashboard" style={{color:T.w4,fontSize:12,fontFamily:mono,letterSpacing:"0.08em",textDecoration:"none"}}>Skip — go to dashboard</a>
            </div>
          </>
        ) : result ? (
          <Results result={result} name={data.name} />
        ) : null}
      </div>
    </div>
  )
}

function Step({title,sub,children}) {
  return (
    <div>
      <div style={{marginBottom:32}}>
        <div style={{fontFamily:serif,fontSize:32,fontWeight:400,color:T.w7,marginBottom:8}}>{title}</div>
        {sub && <div style={{fontSize:14,color:T.w5}}>{sub}</div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:24}}>{children}</div>
    </div>
  )
}

function Field({label,children,hide}) {
  if(hide) return null
  return (
    <div>
      <div style={{fontFamily:mono,fontSize:9,color:T.w4,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>{label}</div>
      {children}
    </div>
  )
}

const inp = {
  width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${T.w3}`,
  fontSize:14,background:T.w,color:T.w7,outline:"none",fontFamily:sans,boxSizing:"border-box",
}

function Chip({label,active,onClick}) {
  return (
    <button onClick={onClick} style={{
      background:active?T.rgBg:T.w1, border:`1px solid ${active?T.rg:T.w3}`,
      color:active?T.rg2:T.w5, borderRadius:6, padding:"6px 12px",
      fontSize:12, cursor:"pointer", fontFamily:sans,
    }}>{label}</button>
  )
}

function ChipRow({items,selected,onSelect,single}) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
      {items.map(item=>(
        <Chip key={item} label={item} active={single?selected===item:selected?.includes(item)} onClick={()=>onSelect(item)} />
      ))}
    </div>
  )
}

function Results({result,name}) {
  const bes = result.bes || 0
  const besColor = bes < 50 ? T.ok : bes < 65 ? T.warn : bes < 80 ? '#C47030' : T.err
  const top = result.topSevere || []
  return (
    <div>
      <div style={{fontFamily:serif,fontSize:32,fontWeight:400,color:T.w7,marginBottom:8}}>
        {name ? `${name.split(' ')[0]}, here's your profile` : "Your clinical profile"}
      </div>
      <div style={{fontSize:14,color:T.w5,marginBottom:40}}>Based on your responses. ALCAT testing will confirm individual molecular reactivity.</div>

      {/* BES gauge */}
      <div style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:16,padding:"28px 32px",marginBottom:24}}>
        <div style={{fontFamily:mono,fontSize:9,letterSpacing:"0.18em",color:T.w4,textTransform:"uppercase",marginBottom:16}}>Biological Entropy Score</div>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:16}}>
          <div style={{fontFamily:serif,fontSize:52,fontWeight:400,color:besColor}}>{bes}</div>
          <div>
            <div style={{fontSize:16,fontWeight:600,color:besColor,fontFamily:sans}}>{result.besBand}</div>
            <div style={{fontSize:13,color:T.w5,fontFamily:sans,marginTop:4,maxWidth:320}}>{result.interpretation}</div>
          </div>
        </div>
        <div style={{height:6,borderRadius:3,background:T.w3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${bes}%`,background:besColor,transition:"width 1s ease"}}/>
        </div>
      </div>

      {/* Top reactive predictions */}
      {top.length > 0 && (
        <div style={{background:T.w,border:`1px solid ${T.w3}`,borderRadius:16,padding:"28px 32px",marginBottom:24}}>
          <div style={{fontFamily:mono,fontSize:9,letterSpacing:"0.18em",color:T.w4,textTransform:"uppercase",marginBottom:20}}>Predicted High-Reactivity Foods</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {top.slice(0,8).map(({food,score})=>(
              <div key={food} style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:140,fontSize:12,fontFamily:sans,color:T.w6}}>{food}</div>
                <div style={{flex:1,height:6,borderRadius:3,background:T.w2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${score}%`,background:T.rg,borderRadius:3}}/>
                </div>
                <div style={{width:36,fontSize:11,fontFamily:mono,color:T.rg2,textAlign:"right"}}>{score}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,fontSize:11,color:T.w4,fontFamily:mono,letterSpacing:"0.1em"}}>
            Personal risk index 0–100. Statistical prediction based on clinical population data. ALCAT confirms individual reactivity.
          </div>
        </div>
      )}

      <a href="/dashboard" style={{display:"block",textAlign:"center",background:T.rg,color:"#fff",borderRadius:12,padding:"16px",fontSize:14,fontWeight:600,fontFamily:sans,textDecoration:"none",marginTop:8}}>
        Open your dashboard →
      </a>
    </div>
  )
}
